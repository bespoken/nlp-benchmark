const _ = require('lodash')
const DataSource = require('../src/report/datasource')

require('dotenv').config()

const describeIf = process.env.MYSQL_HOST ? describe : describe.skip
describeIf('datasource works correctly', () => {
  test('loads records from the mysql database', async () => {
    const dataSource = new DataSource()
    const results = await dataSource.query('select * from NLP_BENCHMARK LIMIT 1')
    expect(results.length).toBe(1)
    expect(results[0].UTTERANCE).toBeDefined()
  })

  test('counts platforms by success and failure', async () => {
    const dataSource = new DataSource()
    const results = await dataSource.successByPlatform()
    expect(results.alexa.successCount).toBeDefined()
    expect(results.alexa.successPercentage).toBeDefined()
  })

  test('counts success and failure by complexity and platform', async () => {
    const dataSource = new DataSource()
    const results = await dataSource.successByComplexity()
    expect(results.alexa1.successCount).toBeDefined()
    expect(results.alexa1.successPercentage).toBeDefined()
  })

  test('counts success and failure by annotation and platform', async () => {
    const dataSource = new DataSource()
    const results = await dataSource.successByAnnotations()
    console.info(JSON.stringify(results, null, 2))
    expect(_.keys(results).length).toBe(2)
    expect(_.keys(results.alexa).length).toBe(7)
    expect(results.alexa.NO_ANSWER.successCount).toBeDefined()
    expect(results.alexa.NO_ANSWER.successPercentage).toBeDefined()
  }, 30000)
})
