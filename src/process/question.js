const _ = require('lodash')
const moment = require('moment')
const Util = require('./util')

class Question {
  static fromJSON (json) {
    const question = new Question()
    Object.assign(question, json)
    if (question.answers) {
      question.answers = question.answers.map(json => new Answer(json))
    }
    return question
  }

  constructor (question, subject, answer, raw) {
    this.question = question
    this.subject = subject
    this.answers = []
    this.annotations = {}
    if (answer) {
      this.addAnswer(answer)
    }
  }

  addAnnotation (key, value) {
    this.annotations[key] = value
  }

  addAnswer (answer) {
    if (!answer) {
      return
    }

    if (answer.length === 0) {
      return
    }

    this.answers.push(new Answer(answer))
  }

  hasNoAnswer () {
    return !this.answers || this.answers.length === 0
  }

  type () {
    if (this.answers.length > 0) {
      return this.answers[0].type()
    }
    return 'TEXT'
  }

  toJSON () {
    const dto = {}
    Object.assign(dto, this)
    // We want to do shallow version of our answer objects
    dto.answers = dto.answers.map(answer => answer.toJSON())
    return dto
  }
}

class Answer {
  constructor (raw) {
    this.raw = raw
    this.parse()
  }

  parse () {
    let value = this.raw
    this.answerType = 'TEXT'

    if (value.includes('wikipedia')) {
      value = _.nth(value.split('/'), -1)
      value = value.split('_').join(' ')

      // Clean any URL-encoded characters
      value = value.split(/%../).join(' ')

      // Remove sequential spaces
      value = value.replace(/\s+/g, ' ')
    } else if (value.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/) !== null) {
      value = moment.utc(value).toISOString()
      this.answerType = 'DATE'
    } else if (value.match(/([0-9]*) years/) !== null) {
      value = value.match(/([0-9]*) years/)[1]
      value = Util.toNumber(value)
      this.answerType = 'AGE'
    } else if (Util.isNumber(value)) {
      value = Util.toNumber(value)
      this.answerType = 'NUMBER'
    }
    this.value = value
  }

  toJSON () {
    return this.raw
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

  text () {
    if (this.value.toString().indexOf('(')) {
      return this.value.toString().split('(')[0].trim()
    }
    return this.value
  }

  type () {
    return this.answerType
  }

  year () {
    return moment(this.value).year()
  }
}

module.exports = Question
