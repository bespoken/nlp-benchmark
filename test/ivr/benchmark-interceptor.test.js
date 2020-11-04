const _ = require('lodash')
const { Config, Record, Result } = require('bespoken-batch-tester')
const BenchmarkInterceptor = require('../../src/ivr/process/benchmark-interceptor')
const lastResponse = require('../data/ivr_response.json')

describe('interceptor works correctly', () => {
  let interceptor, record
  beforeEach(() => {
    Config.reset()
    interceptor = new BenchmarkInterceptor()
    record = new Record('Number: 1. Expected Phrase: This is a test')
    record.meta = {
      platform: 'amazon-connect',
      number: '+12345678900',
      recordingId: 'asdf1234ghjk5678',
      index: 1
    }
  })

  describe('sequence config', () => {
    beforeEach(() => {
      Config.loadFromJSON({
        customer: 'ivr-benchmark',
        job: 'test',
        sequence: ['$DIAL']
      })
    })

    test('connect or dialogflow', async () => {
      await interceptor.interceptRecord(record)
      const sequence = Config.get('sequence')
      expect(sequence).toHaveLength(1)
    })

    test('add index to sequence for twilio-autopilot', async () => {
      _.set(record, 'meta.platform', 'twilio-autopilot')
      await interceptor.interceptRecord(record)
      const sequence = Config.get('sequence')
      expect(sequence).toHaveLength(2)
      expect(sequence[1]).toBe('1')
    })
  })

  describe('interceptRequest', () => {
    test('request from amazon-connect or dialogflow', async () => {
      const request = [
        { text: '$DIAL' },
        { text: 'https://ivr-benchmark.audios.com/1234asdf' }
      ]
      await interceptor.interceptRequest(request, null)
      expect(request[0].settings.finishOnPhrase).toBe('utterance now')
    })

    test('request from twilio-autopilot', async () => {
      const request = [
        { text: '$DIAL' },
        { text: '1' },
        { text: 'https://ivr-benchmark.audios.com/1234asdf' }
      ]
      await interceptor.interceptRequest(request, null)
      expect(request[0].settings.finishOnPhrase).toBe('test number')
      expect(request[1].settings.finishOnPhrase).toBe('expected phrase')
    })
  })
})
