const _ = require('lodash')
const { Interceptor } = require('bespoken-batch-tester')

class BenchmarkInterceptor extends Interceptor {
  interceptResult (record, result) {
    result.addOutputField('transcript', result.lastResponse.transcript)
    result.addOutputField('display', _.join(_.get(result, 'lastResponse.card.content'), ' '))
    result.addOutputField('imageURL', _.get(result, 'lastResponse.raw.imageURL'))
    console.info(result.lastResponse.transcript)
    return true
  }
}

module.exports = BenchmarkInterceptor
