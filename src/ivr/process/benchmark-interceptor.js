const { Interceptor, Config } = require('bespoken-batch-tester')
const { wordsToNumbers } = require('words-to-numbers')
const speechScorer = require('word-error-rate')
const S3 = require('../../S3')
const { tsvToArray } = require('../../helper')

class BenchmarkInterceptor extends Interceptor {
  async interceptPreProcess (job) {
    this.run = job.run
  }

  async interceptRecord (record) {
    const { platform, index, locale } = record.meta
    let sequenceIndex = `${index}`
    if (locale.startsWith('es') && platform.includes('twilio')) {
      sequenceIndex = `$${index}#`
    }
    Config.set('sequence', ['$DIAL', sequenceIndex])
    return true
  }

  async interceptRequest (request, device) {
    const locale = device._configuration.locale || 'en-US'
    const isEnglish = locale === 'en-US'
    const job = Config.get('job')
    let firstPhrase = 'número del test'
    let secondPhrase = 'frase esperada'

    if (job.includes('twilio')) {
      firstPhrase = 'prueba'
      secondPhrase = 'frase'
    } else if (job.includes('amazon')) {
      firstPhrase = 'número de la prueba'
    }

    // $DIAL
    request[0].settings = {}
    request[0].settings.finishOnPhrase = isEnglish ? 'test number' : firstPhrase

    request[1].settings = {}
    request[1].settings.finishOnPhrase = isEnglish ? 'expected phrase' : secondPhrase
  }

  async interceptResult (record, result) {
    result.success = false
    const locale = record.meta.locale || 'en-us'
    let S3path = locale
    if (S3path.startsWith('es')) {
      S3path = 'es-es'
    }
    // Load data from tsv files
    if (!this.recordingInfo) {
      this.recordingInfo = await tsvToArray(`${S3path}/metadata/${S3path}_recording_info.tsv`)
    }

    if (!this.speakerInfo) {
      this.speakerInfo = await tsvToArray(`${S3path}/metadata/${S3path}_speaker_info.tsv`)
    }

    let failureReason = ''
    let buffer = ''
    const platforms = {
      'twilio-autopilot': 'twilio',
      'amazon-connect': 'connect',
      dialogflow: 'dialogflow',
      twilio: 'twilio'
    }
    let response = `${platforms[record.meta.platform]}-${record.meta.index}.txt`
    if (record.rerun) {
      response = `${this.run}/${response}`
    }
    console.log(`S3 get ${response}`)
    try {
      buffer = await S3.get(response, 'ivr-benchmark-responses')
    } catch (err) {
      console.error(`S3 get: ${err.message}`)
    }
    const text = Buffer.from(buffer).toString('utf-8')
    const rawResponse = record.utteranceRaw.replace(/Number:.*Phrase:/gi, '').trim()
    const [firstPart] = rawResponse.split('<non_speech>').filter(piece => piece)
    const expectedResponse = this.cleanup(firstPart)
    const actualResponse = this.cleanup(text)

    const recordingWithSilence = rawResponse.startsWith('<non_speech>')
    let wordErrorRate = 0
    if (!actualResponse.toLowerCase().startsWith(expectedResponse.toLowerCase()) && expectedResponse !== '') {
      wordErrorRate = speechScorer.wordErrorRate(expectedResponse, actualResponse)
      failureReason = "Actual response didn't match"
      if (recordingWithSilence) {
        failureReason = 'The recording has a silence at the beginning'
      }
      if (!text && !recordingWithSilence) {
        failureReason = 'The actual response is empty'
      }
      if (!text && result.lastResponse.transcript.includes('what did you say')) {
        failureReason = 'The call did not invoke the utterance'
      }
    }

    result.addOutputField('Expected Response', expectedResponse)
    result.addOutputField('Actual Response', actualResponse)
    result.addOutputField('Word Error Rate', Math.ceil(wordErrorRate * 100) / 100)
    result.addOutputField('Starts With Non Speech', recordingWithSilence ? 'YES' : 'NO')

    // Show metadata from tsv files
    const recordingRow = this.recordingInfo.find(({ recordingid }) => recordingid === record.meta.recordingId)
    const { domain, left_channel_speaker: customerId } = recordingRow
    const speakerRow = this.speakerInfo.find(({ speakerid }) => speakerid === customerId)
    result.addOutputField('Domain', domain)
    result.addOutputField('Gender', speakerRow.gender)
    result.addOutputField('Age', speakerRow.age)
    result.addOutputField('Accent', speakerRow.accent)
    result.addOutputField('Ethnicity', speakerRow.ethnicity)
    result.addOutputField('Locale', locale)

    result.addOutputField('Audio URL', result.lastResponse.message)
    result.addOutputField('Failure reason', failureReason)
    result.success = !failureReason
    return true
  }

  cleanup (text) {
    const wordsOnly = wordsToNumbers(text).toString()
    return wordsOnly.replace(/Number:.*Phrase:|<\w*>|["?.,-]|\(background.*\)/g, '')
      .replace(/\s\s/g, ' ') // Remove double spaces
      .replace(/(\d)\s+(?=\d)/g, '$1') // Remove space between numbers
      .trim()
  }
}

module.exports = BenchmarkInterceptor
