const _ = require('lodash')
const { Config, Record, Result } = require('bespoken-batch-tester')
const BenchmarkInterceptor = require('../../src/ivr/process/benchmark-interceptor')
const lastResponse = require('../data/ivr_response.json')
const S3 = require('../../src/S3')
jest.mock('../../src/S3')

describe('interceptor works correctly', () => {
  let interceptor, record, result
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
    result = new Result(record, undefined, [_.cloneDeep(lastResponse)])
  })

  describe('sequence config', () => {
    beforeEach(() => {
      Config.loadFromJSON({
        customer: 'ivr-benchmark',
        job: 'test',
        sequence: ['$DIAL']
      })
    })

    test('sequence does not change', async () => {
      await interceptor.interceptRecord(record)
      const sequence = Config.get('sequence')
      expect(sequence).toHaveLength(1)
    })

    test('add index to sequence for dialogflow', async () => {
      _.set(record, 'meta.platform', 'dialogflow')
      await interceptor.interceptRecord(record)
      const sequence = Config.get('sequence')
      expect(sequence).toHaveLength(2)
      expect(sequence[1]).toBe('1')
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

  describe('interceptResult', () => {
    test('actual response matches the expected response', async () => {
      S3.get.mockImplementation(() => 'this is a test')
      await interceptor.interceptResult(record, result)
      expect(result.success).toEqual(true)
    })

    test('actual response does not match the expected response', async () => {
      S3.get.mockImplementation(() => 'this is')
      await interceptor.interceptResult(record, result)
      expect(result.outputFields['Failure reason']).toBe("Actual response didn't match")
      expect(result.success).toEqual(false)
    })

    test('actual response is empty', async () => {
      S3.get.mockImplementation(() => '')
      await interceptor.interceptResult(record, result)
      expect(result.outputFields['Failure reason']).toBe('The actual response is empty')
      expect(result.success).toEqual(false)
    })

    test('utterance starts with <non_speech>', async () => {
      S3.get.mockImplementation(() => 'this is')
      record._utteranceRaw = '<non_speech>This is a test'
      await interceptor.interceptResult(record, result)
      expect(result.outputFields['Expected Response']).toBe('This is a test')
      expect(result.outputFields['Actual Response']).toBe('this is')
      expect(result.outputFields['Failure reason']).toBe('The recording has a silence at the beginning')
      expect(result.success).toEqual(false)

      S3.get.mockImplementation(() => '')
      record._utteranceRaw = '<non_speech>This is a test'
      await interceptor.interceptResult(record, result)
      expect(result.outputFields['Expected Response']).toBe('This is a test')
      expect(result.outputFields['Actual Response']).toBe('')
      expect(result.outputFields['Failure reason']).toBe('The recording has a silence at the beginning')
      expect(result.success).toEqual(false)
    })

    test('utterance is not invoked', async () => {
      S3.get.mockImplementation(() => '')
      _.set(result, 'lastResponse.transcript', 'what did you say')
      await interceptor.interceptResult(record, result)
      expect(result.outputFields['Failure reason']).toBe('The call did not invoke the utterance')
      expect(result.success).toEqual(false)
    })
  })

  describe('cleanup text', () => {
    test('text with prefix', () => {
      const text = interceptor.cleanup('Number: 1. Expected Phrase: <non_speech> This is a <skip>test')
      expect(text).toBe('This is a test')
    })

    test('text without prefix', () => {
      const text = interceptor.cleanup('<non_speech> (background noise starts here) This is a <skip> test')
      const textWithNumbers = interceptor.cleanup("It's four two six seven seventy-five eighty-nine the account number")
      expect(text).toBe('This is a test')
      expect(textWithNumbers).toBe("It's 42677589 the account number")
    })
  })
})
