const BenchmarkSource = require('../../src/ivr/process/benchmark-source')
const { Config } = require('bespoken-batch-tester')

describe('souce loads records', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    Config.reset()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })
  test('source handles twilio autopilot platform correctly', async () => {
    Config.loadFromJSON({
      customer: 'bespoken',
      job: 'ivr-benchmark-twilio-autopilot',
      source: 'src/ivr/benchmark-source',
      virtualDeviceConfig: {
        phoneNumber: '1123456789'
      }
    })
    process.env.DATASET_PATH = 'test/data/common_voice_test.tsv'
    const source = new BenchmarkSource()
    const records = await source.loadAll()
    expect(records.length).toBe(5)
    expect(records[0].utterance).toBe('six')
    expect(records[0].meta.platform).toBe('twilio-autopilot')
    expect(records[3].meta.number).toBe('1123456789')
    expect(records[0].meta.clipUrl).toBe('common_voice_en_21953345.mp3')
  })

  test('source handles amazon connect platform correctly', async () => {
    Config.loadFromJSON({
      customer: 'bespoken',
      job: 'ivr-benchmark-amazon-connect',
      source: 'src/ivr/benchmark-source',
      virtualDeviceConfig: {
        phoneNumber: '1198765432'
      }
    })
    process.env.DATASET_PATH = 'test/data/common_voice_test.tsv'
    const source = new BenchmarkSource()
    const records = await source.loadAll()
    expect(records.length).toBe(5)
    expect(records[1].utterance).toBe('yes')
    expect(records[1].meta.platform).toBe('amazon-connect')
    expect(records[1].meta.number).toBe('1198765432')
    expect(records[1].meta.clipUrl).toBe('common_voice_en_22214552.mp3')
  })
})
