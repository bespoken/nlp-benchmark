const BenchmarkSource = require('../src/process/benchmark-source')
const { Config } = require('bespoken-batch-tester')

describe('souce loads records', () => {
  beforeEach(() => {
    Config.reset()
  })

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

  test('source handles google platform correctly with actual questions', async () => {
    Config.loadFromJSON({
      customer: 'bespoken',
      job: 'job-is-google',
      source: 'src/benchmark-source',
      sourceFile: 'input/datasets/comqa.json'
    })
    const source = new BenchmarkSource()
    const records = await source.loadAll()
    expect(records.length).toBe(966)
  })
})
