const { Interceptor, Config } = require('bespoken-batch-tester')
// const { wordsToNumbers } = require('words-to-numbers')
const S3 = require('../../S3')

class BenchmarkInterceptor extends Interceptor {
  async interceptRecord (record) {
    if (record.meta.platform.includes('twilio')) {
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
      failureReason = rawResponse.startsWith('<non_speech>')
        ? 'The recording has a silence at the beginning'
        : "Actual response didn't match"
      if (!text) {
        failureReason = result.lastResponse.transcript.includes('what did you say')
          ? 'The call did not invoke the utterance'
          : 'The actual response is empty'
      }
    }

    result.addOutputField('Expected Response', expectedResponse)
    result.addOutputField('Actual Response', actualResponse)
    result.addOutputField('Failure reason', failureReason)
    result.success = !failureReason
    return true
  }

  cleanup (text) {
    const cleanText = text.replace(/Number:.*Phrase:|<\w*>|["?.,]/ig, '')
      .replace(/\s\s/gi, ' ')
      .trim()
    return cleanText
  }
}

module.exports = BenchmarkInterceptor
