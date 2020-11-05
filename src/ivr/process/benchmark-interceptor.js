const { Interceptor, Config } = require('bespoken-batch-tester')
const { wordsToNumbers } = require('words-to-numbers')
const speechScorer = require('word-error-rate')
const S3 = require('../../S3')

class BenchmarkInterceptor extends Interceptor {
  async interceptRecord (record) {
    if (record.meta.platform.match(/twilio|dialogflow/)) {
      Config.set('sequence', ['$DIAL', `${record.meta.index}`])
    }
    return true
  }

  async interceptRequest (request, device) {
    // $DIAL
    request[0].settings = {}
    if (request[1].text.startsWith('http')) {
      request[0].settings.finishOnPhrase = 'utterance now'
    } else {
      request[0].settings.finishOnPhrase = 'test number'
    }

    if (!request[1].text.startsWith('http')) {
      request[1].settings = {}
      request[1].settings.finishOnPhrase = 'expected phrase'
    }
  }

  async interceptResult (record, result) {
    result.success = false
    let failureReason = ''
    let buffer = ''
    const platforms = {
      'twilio-autopilot': 'twilio',
      'amazon-connect': 'connect',
      dialogflow: 'dialogflow'
    }
    const response = `${platforms[record.meta.platform]}-${record.meta.index}.txt`
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

    if (expectedResponse.toLowerCase() !== actualResponse.toLowerCase()) {
      const recordingWithSilence = rawResponse.startsWith('<non_speech>')
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

    const wordErrorRate = speechScorer.wordErrorRate(expectedResponse, actualResponse)
    result.addOutputField('Expected Response', expectedResponse)
    result.addOutputField('Actual Response', actualResponse)
    result.addOutputField('Word Error Rate', Math.ceil(wordErrorRate * 100) / 100)
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
