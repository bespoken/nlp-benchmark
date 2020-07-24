const _ = require('lodash')
const moment = require('moment')
const Util = require('./util')

class Question {
  static fromJSON (json) {
    const question = new Question()
    Object.assign(question, json)
    question.answers = question.answers.map(json => new Answer(json))
    return question
  }

  constructor (question, subject, answer, raw) {
    this.question = question
    this.subject = subject
    this.answers = []
    if (answer) {
      this.addAnswer(answer)
    }
    this.raw = raw
    this.answerType = 'TEXT'
  }

  addAnswer (answer) {
    if (!answer) {
      return
    }
    const raw = answer

    if (answer.includes('wikipedia')) {
      answer = _.nth(answer.split('/'), -1)
      answer = answer.split('_').join(' ')

      // Clean any URL-encoded characters
      answer = answer.split(/%../).join(' ')

      // Remove sequential spaces
      answer = answer.replace(/\s+/g, ' ')
    } else if (answer.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/) !== null) {
      answer = moment.utc(answer).toISOString()
      this.answerType = 'DATE'
    } else if (Util.isNumber(answer)) {
      answer = Util.toNumber(answer)
      this.answerType = 'NUMBER'
    }

    if (answer.length === 0) {
      return
    }

    this.answers.push(new Answer(answer, raw, this.answerType))
  }
}

class Answer {
  constructor (value, rawValue, type) {
    this.value = value
    this.rawValue = rawValue
    this.type = type
  }

  dateAsSpoken () {
    return this.value.format('MMMM Do YYYY')
  }

  includes (actual) {
    return Util.includes(actual, this.text())
  }

  isDate () {
    return this.type === 'DATE'
  }

  isNumber () {
    return this.type === 'NUMBER'
  }

  raw () {
    return this.rawValue
  }

  text () {
    if (this.value.toString().indexOf('(')) {
      return this.value.toString().split('(')[0].trim()
    }
    return this.value
  }

  year () {
    return moment(this.value).year()
  }
}

module.exports = Question
