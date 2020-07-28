const ComQAParser = require('../src/comqa-parser')

describe('ComQA parser works correctly', () => {
  test('parser runs and creates output', () => {
    const parser = new ComQAParser()
    const questions = parser.parse()
    expect(questions.length).toBe(966)

    expect(questions[0].answers.length).toBe(1)
    expect(questions[0].raw).toBeUndefined()
    expect(questions[0].answers[0].raw).toBe('1946-1953')
    expect(questions.some(question => !question.question)).toBe(false)
  })
})
