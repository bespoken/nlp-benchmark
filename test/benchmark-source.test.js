const BenchmarkSource = require('../src/benchmark-source')
const { Config } = require('bespoken-batch-tester')

describe('souce loads records', () => {
  test('source handles google platform correctly', async () => {
    Config.loadFromJSON({
      customer: 'bespoken',
      job: 'job-is-google',
      source: 'src/benchmark-source',
      sourceFile: 'test/data/sample-questions.json'
    })
    const source = new BenchmarkSource()
    const records = await source.loadAll()
    expect(records.length).toBe(2)
    expect(records[0].utterance).toBe('hey google when did bear bryant coach kentucky?')
    expect(records[0].outputField('platform')).toBe('google')
  })
})
