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
    request[0].settings.finishOnPhrase = 'the test number'

    if (!request[1].text.startsWith('http')) {
      request[1].settings = {}
      request[1].settings.finishOnPhrase = 'the expected phrase'
    }
  }
}

module.exports = BenchmarkInterceptor
