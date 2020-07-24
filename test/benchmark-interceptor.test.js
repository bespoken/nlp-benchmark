const BenchmarkInterceptor = require('../src/benchmark-interceptor')
const Question = require('../src/question')
const { Record, Result } = require('bespoken-batch-tester')

describe('interceptor works correctly', async () => {
  test('matches a date which is exactly the same', () => {
    const question = new Question()
    question.addAnswer('1970-10-04')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'Janis Joplin died on October 4th 1970 at the age of 27 due to heroin overdose',
      card: {
        content: 'Getty Janis Joplin Jan 19, 1943- Oct 4, 1970 Died at 27 years old Due to heroin overdose Show Photos'
      }
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
    expect(result.outputField('CLOSEST_ANSWER')).toBe('1970-10-04')
  })

  test('matches a date by year only', () => {
    const question = new Question()
    question.addAnswer('1970-10-04')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'Janis Joplin died in 1970 at the age of 27 due to heroin overdose'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })

  test('does not match a number value that is not close', () => {
    const question = new Question()
    question.addAnswer('19 years')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'Morehouse College is 153 years old and it was founded in 1867'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(false)
  })

  test('does match a number value that is close', () => {
    const question = new Question()
    question.addAnswer('919,866')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'ERIE COUNTY POPULATION IN 2017 926,000 1.5M 1M 500K 1850 1900 1950 2000'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })

  test('does NOT match a number value that is close', () => {
    const question = new Question()
    question.addAnswer('15')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: '20'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(false)
  })
})
