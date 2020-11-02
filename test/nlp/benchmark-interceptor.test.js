const BenchmarkInterceptor = require('../../src/nlp/process/benchmark-interceptor')
const Question = require('../../src/nlp/process/question')
const { Record, Result } = require('bespoken-batch-tester')

describe('interceptor works correctly', () => {
  test('matches a date which is exactly the same', () => {
    const question = new Question()
    question.addAnswer('1970-10-04')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'Janis Joplin died on October 4th 1970 at the age of 27 due to heroin overdose',
      card: {
        content: ['Getty Janis Joplin Jan 19, 1943- Oct 4, 1970 Died at 27 years old Due to heroin overdose Show Photos']
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

  test('does match a number value that is in letters', () => {
    const question = new Question()
    question.addAnswer('324 million')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: '327 million'
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

  test('checks a question without an answer', () => {
    const question = new Question()

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'i don\'t know'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })

  test('checks a question with a name that is difficult to spell', () => {
    const question = new Question('who was the 2009 president of poland')
    question.addAnswer('https://en.wikipedia.org/wiki/lech_kaczy%c5%84ski')

    expect(question.answers[0].value).toBe('kaczynski')
    expect(question.answers[1].value).toBe('lech kaczynski')
    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'in 2009 Poland president was left kachinsky'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })

  test('checks a question with a name that is difficult to spell', () => {
    const question = new Question('where was beethoven born')
    question.addAnswer('bonn')

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'bond'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })

  test('checks a question with a name that is has parentheses', () => {
    const question = new Question('who was this writer?')
    question.addAnswer('https://en.wikipedia.org/wiki/john_harington_(writer)')

    expect(question.answers[0].value).toBe('harington')
    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'it is harington'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })

  test('checks a question with an age as the answer', () => {
    const question = new Question()
    question.addAnswer('19 years')

    expect(question.type()).toBe('AGE')
    expect(question.answers[0].value).toBe(19)

    const interceptor = new BenchmarkInterceptor()
    const record = new Record('test utterance', undefined, { question: question })
    const result = new Result(record, undefined, [{
      transcript: 'teen on the website infoplease.com they say graduates high school at age 15 enters Morehouse College shortly thereafter receives ba in sociology from Morehouse College',
      card: {
        content: ['Martin Luther King, Jr., is born in teacher Alberta Atlanta to King and Baptist minister Michael Luther King. school at Graduates high age 15, enters Morehouse College shortly thereafter. Receives BA in sociology from Morehouse College at age 19.']
      }
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })

  test('checks that answers are not case-sensitive', () => {
    const question = new Question()
    question.addAnswer('Got to Be There')

    const interceptor = new BenchmarkInterceptor()
    let record = new Record('test utterance', undefined, { question: question })
    let result = new Result(record, undefined, [{
      transcript: 'got to be there'
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)

    record = new Record('test utterance', undefined, { question: question })
    result = new Result(record, undefined, [{
      card: {
        content: ['gOt to be theRe']
      }
    }])
    interceptor.interceptResult(record, result)
    expect(result.success).toBe(true)
  })
})
