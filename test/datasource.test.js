const DataSource = require('../src/report/datasource')

require('dotenv').config()

describe('datasource works correctly', () => {
  test('loads records from the mysql database', async () => {
    const dataSource = new DataSource()
    const results = await dataSource.results('select * from NLP_BENCHMARK LIMIT 1')
    expect(results.length).toBe(1)
    expect(results[0].UTTERANCE).toBeDefined()
  })
})
