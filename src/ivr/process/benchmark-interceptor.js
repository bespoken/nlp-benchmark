const { Interceptor } = require('bespoken-batch-tester')

class BenchmarkInterceptor extends Interceptor {
  async interceptRequest (request, device) {
    request[0].settings = {}
    request[0].settings.finishOnPhrase = 'say your utterance now'
  }
}

module.exports = BenchmarkInterceptor
