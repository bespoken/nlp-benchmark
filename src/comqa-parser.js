const _ = require('lodash')
const fs = require('fs')
const Question = require('./question')

class ComQAParser {
  constructor () {
    this.rawQuestions = []
  }

  parse () {
    this._read('datasets/ComQA/comqa_dev.json')

    const questions = []
    for (const rawQuestion of this.rawQuestions) {
      let questionText
      // Some times the questions are an array, some times just a single question
      if (rawQuestion.questions) {
        questionText = _.nth(rawQuestion.questions, -1)
      } else {
        questionText = rawQuestion.question
      }

      const question = new Question(questionText, undefined, undefined, rawQuestion)
      for (const answer of rawQuestion.answers) {
        question.addAnswer(answer)
      }
      questions.push(question)
    }

    return questions
  }

  _read (file) {
    const fileContents = fs.readFileSync(file)
    const json = JSON.parse(fileContents)
    this.rawQuestions = this.rawQuestions.concat(json)
    // console.info(JSON.stringify(json, null, 2))
  }
}

module.exports = ComQAParser

if (_.nth(process.argv, 2) === 'parse') {
  const parser = new ComQAParser()
  const questions = parser.parse()
  fs.writeFileSync('input/datasets/comqa.json', JSON.stringify({
    questions: questions.map(question => question.toJSON())
  }, null, 2))
}
