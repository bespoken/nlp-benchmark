const { Interceptor, Config } = require('bespoken-batch-tester')
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
    const platforms = {
      'twilio-autopilot': 'twilio',
      'amazon-connect': 'connect',
      dialogflow: 'dialogflow'
    }
    const response = `${platforms[record.meta.platform]}-${record.meta.index}.txt`
    const buffer = await S3.get(response, 'ivr-benchmark-responses')
    const text = Buffer.from(buffer).toString('utf-8')
    const expectedTranscript = this.cleanup(record.utteranceRaw)
    const actualTranscript = this.cleanup(text)
    result.addOutputField('Expected Transcript', expectedTranscript)
    result.addOutputField('Actual Transcript', actualTranscript)
    let failureReason = ''

    if (expectedTranscript.toLowerCase() !== actualTranscript.toLowerCase()) {
      failureReason = "Actual transcript didn't match"
      result.success = false
    }
    result.addOutputField('Failure reason', failureReason)
    return true
  }

  cleanup (text) {
    return text.replace(/<\w*>|["?.,]/ig, '').trim()
  }
}

module.exports = BenchmarkInterceptor
