const BenchmarkSource = require('../../src/ivr/process/benchmark-source')
const { Config } = require('bespoken-batch-tester')

describe.skip('souce loads records', () => {
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
    expect(records.length).toBe(3)
    expect(records[0].utteranceRaw).toBe('Number: 1. Expected Phrase: <non_speech> How much do I owe on a recent payment <non_speech> can you tell me the amount I owe on a recent payment I would like some information on the amount I owe on a recent payment')
    expect(records[0].meta.platform).toBe('twilio-autopilot')
    expect(records[0].meta.number).toBe('1123456789')
    expect(records[0].meta.recordingId).toBe('0114ab2f-97fa-4b40-b217-9bceaa687d4b')
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
    expect(records.length).toBe(3)
    expect(records[1].utteranceRaw).toBe('Number: 2. Expected Phrase: I would like to request to cancel my card Cancel my card please <non_speech> can I speak with a representative about canceling my card <non_speech>')
    expect(records[1].meta.platform).toBe('amazon-connect')
    expect(records[1].meta.number).toBe('1198765432')
    expect(records[1].meta.recordingId).toBe('028835cb-3dc8-4ea6-a9b1-6b7e53bb1198')
  })
})
