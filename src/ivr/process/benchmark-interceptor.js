const { Interceptor, Config } = require('bespoken-batch-tester')

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

  // TODO
  async interceptResult (_record, _result) {
    return true
  }
}

module.exports = BenchmarkInterceptor
