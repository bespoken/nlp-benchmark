const _ = require('lodash')
const fs = require('fs')
const Question = require('./question')
const moment = require('moment')

class ComQAParser {
  constructor () {
    this.rawQuestions = []
  }

  parse () {
    this._read('datasets/ComQA/comqa_dev.json')
    this._read('datasets/ComQA/comqa_test.json')
    this._read('datasets/ComQA/comqa_train.json')

    const questions = []
    for (const rawQuestion of this.rawQuestions) {
      const question = new Question(_.nth(rawQuestion.questions, -1), undefined, undefined, rawQuestion)
      for (const rawAnswer of rawQuestion.answers) {
        const answer = this._cleanAnswer(rawAnswer)
        question.addAnswer(answer)
      }

      if (question.answers.length > 0) {
        questions.push(question)
      }
    }

    fs.writeFileSync('input/datasets/comqa.json', JSON.stringify({
      questions: questions
    }, null, 2))
  }

  _read (file) {
    const fileContents = fs.readFileSync(file)
    const json = JSON.parse(fileContents)
    this.rawQuestions = this.rawQuestions.concat(json)
    // console.info(JSON.stringify(json, null, 2))
  }

  _cleanAnswer (answer) {
    if (answer.includes('wikipedia')) {
      answer = _.nth(answer.split('/'), -1)
      answer = answer.split('_').join(' ')

      // Clean any URL-encoded characters
      answer = answer.split(/%../).join(' ')

      // Remove sequential spaces
      answer = answer.replace(/\s+/g, ' ')
    } else if (answer.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/) !== null) {
      answer = moment(answer).format('MMM Do YYYY')
    }

    if (answer.length === 0) {
      return undefined
    }

    return answer
  }
}

module.exports = ComQAParser

if (_.nth(process.argv, 2) === 'parse') {
  const parser = new ComQAParser()
  parser.parse()
}
