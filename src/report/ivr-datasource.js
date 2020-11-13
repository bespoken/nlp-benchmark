const _ = require('lodash')
const mysql = require('promise-mysql')

class DataSource {
  async connection () {
    const connection = await mysql.createConnection({
      database: process.env.MYSQL_DATABASE,
      host: process.env.MYSQL_HOST,
      password: process.env.MYSQL_PASSWORD,
      user: process.env.MYSQL_USER
    })
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

  async results () {
    let results = await this.query('select * from IVR_BENCHMARK order by UTTERANCE')
    results.forEach(result => {
      if (result.PLATFORM === 'DIALOGFLOW') {
        result.PLATFORM = 'DIALOG FLOW'
      }
      result.AGE_GROUP_35 = result.AGE_GROUP < 35 ? '<35' : '>=35'
      result.WHITE_OR_NOT = 'Unknown'
      if (result.ETHNICITY === 'White American (Non-Hispanic)') {
        result.WHITE_OR_NOT = 'White'
      } else if (result.ETHNICITY === 'Black and African American' ||
          result.ETHNICITY === 'Identify as two or more races' ||
          result.ETHNICITY === 'Latino and Hispanic American') {
        result.WHITE_OR_NOT = 'Not White'
      }
    })

    results = _.sortBy(results, ['UTTERANCE', 'PLATFORM'])
    return results
  }

  async werByAgeGroup (language = 'en') {
    const rawData = await this.query(`select
        case 
          when age <= 35 then '<=35' 
        else '>35' end age_group_35,
          avg(WORD_ERROR_RATE) WER,
          PLATFORM
      from bespoken.IVR_BENCHMARK ib
      where lang = '${language}' 
      group by platform, age_group_35
      order by age_group_35, platform`)
    console.info(`select
    case 
      when age <= 35 then '<=35' 
    else '>35' end age_group_35,
      avg(WORD_ERROR_RATE) WER,
      PLATFORM
  from bespoken.IVR_BENCHMARK ib
  where lang = '${language}' 
  group by platform, age_group_35
  order by age_group_35, platform`)
    rawData.forEach(row => {
      row.WER = _.round(row.WER, 2)
    })
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.groupBy(rawData, 'PLATFORM')
    return resultsByPlatform
  }

  async werByDomain (language = 'en') {
    const rawData = await this.query(`select avg(WORD_ERROR_RATE) WER, count(*) COUNT, PLATFORM, DOMAIN 
      from IVR_BENCHMARK 
      where lang = '${language}' 
      group by PLATFORM, DOMAIN order by PLATFORM, DOMAIN desc`)
    rawData.forEach(row => {
      row.WER = _.round(row.WER, 2)
    })
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.groupBy(rawData, 'PLATFORM')
    return resultsByPlatform
  }

  async werByEthnicity (language = 'en') {
    const rawData = await this.query(`select
        case when ethnicity = 'White American (Non-Hispanic)' then 'White' 
          when ethnicity = 'Black and African American' then 'Not White'
          when ethnicity = 'Identify as two or more races' then 'Not White'
          when ethnicity = 'Latino and Hispanic American' then 'Not White' 
          else 'Other' end ethnicity_group, 
          avg(WORD_ERROR_RATE) WER
      from bespoken.IVR_BENCHMARK ib
      where lang = '${language}' 
      group by ethnicity_group
      order by ethnicity_group;`)
    rawData.forEach(row => {
      row.WER = _.round(row.WER, 2)
    })
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.groupBy(rawData, 'ethnicity_group')
    return resultsByPlatform
  }

  async werByEthnicityAndPlatform (language = 'en') {
    const rawData = await this.query(`select
        case when ethnicity = 'White American (Non-Hispanic)' then 'White' 
          when ethnicity = 'Black and African American' then 'Not White'
          when ethnicity = 'Identify as two or more races' then 'Not White'
          when ethnicity = 'Latino and Hispanic American' then 'Not White' 
          else 'Other' end ethnicity_group, 
          avg(WORD_ERROR_RATE) WER,
          PLATFORM
      from bespoken.IVR_BENCHMARK ib
      where lang = '${language}' 
      group by platform, ethnicity_group
      order by ethnicity_group, platform;`)
    rawData.forEach(row => {
      row.WER = _.round(row.WER, 2)
    })
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.groupBy(rawData, 'PLATFORM')
    return resultsByPlatform
  }

  async werByGender (language = 'en') {
    const rawData = await this.query(`select gender,
          avg(WORD_ERROR_RATE) WER,
          PLATFORM
      from bespoken.IVR_BENCHMARK ib
      where lang = '${language}' 
      group by platform, gender
      order by gender, platform;`)
    rawData.forEach(row => {
      row.WER = _.round(row.WER, 2)
    })
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.groupBy(rawData, 'PLATFORM')
    return resultsByPlatform
  }

  async werByNoisy (language = 'en') {
    const rawData = await this.query(`select avg(WORD_ERROR_RATE) WER, count(*) COUNT, PLATFORM, STARTS_WITH_NON_SPEECH 
      from IVR_BENCHMARK 
      where lang = '${language}' 
      group by PLATFORM, STARTS_WITH_NON_SPEECH order by PLATFORM, STARTS_WITH_NON_SPEECH desc`)
    rawData.forEach(row => {
      row.WER = _.round(row.WER, 2)
    })
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.groupBy(rawData, 'PLATFORM')
    return resultsByPlatform
  }

  async werByPlatform (language = 'en') {
    const rawData = await this.query(`select avg(WORD_ERROR_RATE) WER, count(*) COUNT, PLATFORM 
      from IVR_BENCHMARK 
      where lang = '${language}'
      group by PLATFORM order by PLATFORM desc`)
    rawData.forEach(row => {
      row.WER = _.round(row.WER, 2)
    })
    // console.info('RAWDATA: ' + JSON.stringify(rawData, null, 2))
    const resultsByPlatform = _.keyBy(rawData, 'PLATFORM')
    return resultsByPlatform
  }
}

module.exports = DataSource
