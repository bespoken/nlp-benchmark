const DataSource = require('../src/report/datasource')

require('dotenv').config()

describe('datasource works correctly', () => {
  test('loads records from the mysql database', async () => {
    const dataSource = new DataSource()
    const results = await dataSource.query('select * from NLP_BENCHMARK LIMIT 1')
    expect(results.length).toBe(1)
    expect(results[0].UTTERANCE).toBeDefined()
  })

  test('counts platforms by success and failure', async () => {
    const dataSource = new DataSource()
    const results = await dataSource.successFailureByPlatform()
    expect(results.alexa.successCount).toBeDefined()
    expect(results.alexa.successPercentage).toBeDefined()
  })
})
