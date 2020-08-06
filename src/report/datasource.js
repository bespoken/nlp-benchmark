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

  async successFailureByPlatform () {
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

  async successFailureByComplexity () {
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
}

module.exports = DataSource
