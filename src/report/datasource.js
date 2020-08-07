const _ = require('lodash')
const mysql = require('promise-mysql')

class DataSource {
  async connection () {
    console.time('DATASOURCE CONNECTION')
    const connection = await mysql.createConnection({
      database: process.env.MYSQL_DATABASE,
      host: process.env.MYSQL_HOST,
      password: process.env.MYSQL_PASSWORD,
      user: process.env.MYSQL_USER
    })
    console.timeEnd('DATASOURCE CONNECTION')
    return connection
  }

  async query (query) {
    let connection
    try {
      connection = await this.connection()
      const results = await connection.query(query)
      return results
    } finally {
      try {
        if (connection) await connection.destroy()
      } catch (e) {
        console.error('DATASOURCE RESULTS error closing connection: ' + e)
      }
    }
  }

  async successByPlatform () {
    const rawData = await this.query(`select count(*) COUNT, PLATFORM, SUCCESS from NLP_BENCHMARK 
      where SUCCESS in ('true', 'false')
      group by PLATFORM, SUCCESS order by PLATFORM, SUCCESS desc`)
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.groupBy(rawData, 'PLATFORM')
    const successByPlatform = Object.keys(resultsByPlatform).map(platform => {
      const array = resultsByPlatform[platform]
      const successCount = parseInt(array[0].COUNT)
      const failureCount = parseInt(array[1].COUNT)
      return {
        platform,
        successCount: successCount,
        failureCount: failureCount,
        successPercentage: _.round(successCount / (successCount + failureCount) * 100, 2)
      }
    })
    console.info('SuccesBy: ' + JSON.stringify(successByPlatform, null, 2))
    return _.keyBy(successByPlatform, 'platform')
  }

  async successByComplexity () {
    const rawData = await this.query(`select count(*) COUNT, PLATFORM, (COMPARISON = 'true' || COMPOSITIONAL = 'true' || TEMPORAL = 'true') COMPLEX, SUCCESS 
      from NLP_BENCHMARK 
      where SUCCESS in ('true', 'false')
      group by PLATFORM, COMPLEX, SUCCESS 
      order by PLATFORM, COMPLEX, SUCCESS desc`)
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsMap = _.groupBy(rawData, (row) => {
      return row.PLATFORM + row.COMPLEX
    })
    const results = Object.keys(resultsMap).map(key => {
      const array = resultsMap[key]
      const successCount = parseInt(array[0].COUNT)
      const failureCount = parseInt(array[1].COUNT)
      return {
        key: key,
        platform: array[0].PLATFORM,
        complex: array[0].COMPLEX,
        successCount: successCount,
        failureCount: failureCount,
        successPercentage: _.round(successCount / (successCount + failureCount) * 100, 2)
      }
    })
    console.info('Success By Complexity: ' + JSON.stringify(results, null, 2))
    return _.keyBy(results, 'key')
  }

  async successByTopics () {
    let rawData = await this.query(`select count(*) COUNT, PLATFORM, TOPIC, SUCCESS 
      from NLP_BENCHMARK 
      where SUCCESS in ('true', 'false')
      group by PLATFORM, TOPIC, SUCCESS 
      order by PLATFORM, TOPIC, SUCCESS desc`)
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))

    rawData = rawData.filter(row => row.TOPIC !== undefined && row.TOPIC !== null && row.TOPIC.length > 0)
    const resultsMap = _.groupBy(rawData, (row) => {
      return row.PLATFORM + row.TOPIC
    })
    const results = Object.keys(resultsMap).map(key => {
      const array = resultsMap[key]
      console.info(JSON.stringify(array, null, 2))
      const successCount = parseInt(_.get(_.nth(array, 0), 'COUNT', 0))
      const failureCount = parseInt(_.get(_.nth(array, 1), 'COUNT', 0))
      return {
        key: key,
        platform: array[0].PLATFORM,
        topic: _.startCase(array[0].TOPIC),
        successCount: successCount,
        failureCount: failureCount,
        successPercentage: _.round(successCount / (successCount + failureCount) * 100, 0)
      }
    })

    console.info(JSON.stringify(results, null, 2))
    return _.keyBy(results, 'key')
  }

  async successByAnnotations () {
    if (!this.annotationsByPlatform) {
      const rawData = await this.query(`select *
      from NLP_BENCHMARK`)

      // Get the results sorted by platform
      this.annotationsByPlatform = _.groupBy(rawData, (row) => {
        return row.PLATFORM
      })

      // For each annotation, summarize how it did for a particular annotation
      Object.keys(this.annotationsByPlatform).forEach(key => {
        const resultsArray = this.annotationsByPlatform[key]
        const summaries = {}
        this.successByAnnotation(summaries, resultsArray, 'ANSWER_TUPLE')
        this.successByAnnotation(summaries, resultsArray, 'COMPARISON')
        this.successByAnnotation(summaries, resultsArray, 'COMPOSITIONAL')
        this.successByAnnotation(summaries, resultsArray, 'GRAMMATICAL_ERRORS')
        this.successByAnnotation(summaries, resultsArray, 'NO_ANSWER')
        this.successByAnnotation(summaries, resultsArray, 'TELEGRAPHIC')
        this.successByAnnotation(summaries, resultsArray, 'TEMPORAL')
        _.values(summaries).forEach(summary => { summary.platform = this._platformName(key) })
        this.annotationsByPlatform[key] = summaries
      })
    }
    return this.annotationsByPlatform
  }

  successByAnnotation (summaries, results, annotation) {
    console.info('Results: ' + results.length)
    const summaryByAnnotation = _.reduce(results,
      (summary, row) => {
        if (row[annotation] === 'TRUE') {
          if (row.SUCCESS === 'true') {
            summary.successCount++
          } else {
            summary.failureCount++
          }
        }
        return summary
      },
      {
        annotation: annotation,
        failureCount: 0,
        successCount: 0
      }
    )
    console.info('SuumaryByAnnotation: ' + JSON.stringify(summaryByAnnotation, null, 2))
    const totalCount = (summaryByAnnotation.successCount + summaryByAnnotation.failureCount)
    let successPercentage = 100
    if (totalCount > 0) {
      successPercentage = _.round(summaryByAnnotation.successCount / totalCount * 100, 2)
    }
    summaryByAnnotation.successPercentage = successPercentage
    summaryByAnnotation.name = this._annotationName(annotation)
    summaryByAnnotation.platform = this._platformName(annotation)
    summaries[annotation] = summaryByAnnotation
  }

  _annotationName (name) {
    name = _.replace(name, '_', ' ')
    name = _.startCase(_.lowerCase(name))
    return name
  }

  _platformName (name) {
    if (name === 'alexa') {
      return 'Amazon Alexa'
    } else if (name === 'google') {
      return 'Google Assistant'
    } else if (name === 'siri') {
      return 'Apple Siri'
    }
  }
}

module.exports = DataSource
