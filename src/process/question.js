const _ = require('lodash')
const moment = require('moment')
const Util = require('./util')

class Question {
  static fromJSON (json) {
    const question = new Question()
    Object.assign(question, json)
    if (json.answers) {
      question.answers = []
      json.answers.forEach(answer => question.addAnswer(answer))
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

    this.answers.push(new Answer(this, answer))
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
  constructor (question, raw) {
    this.question = question
    this.raw = raw
    this.parse()
  }

  parse () {
    let value = this.raw
    this.answerType = 'TEXT'

    if (value.includes('wikipedia')) {
      // Get the last part of the path for Wikipedia answers
      value = _.nth(value.split('/'), -1)

      // Decode the string
      value = decodeURIComponent(value)

      // Remove underscores
      value = value.split('_').join(' ')

      // Remove any diacritical marks
      value = _.deburr(value)

      // Clean any URL-encoded characters
      value = value.split(/%../).join(' ')

      // Remove sequential spaces
      value = value.replace(/\s+/g, ' ')

      // Check if this is a name - we look for who in the question
      if (this.question.question.includes('who')) {
        // See if the answer is in two parts - first and last name
        if (value.split(' ').length > 1) {
          // remove parentheses at the end
          if (value.toString().indexOf('(')) {
            value = value.split('(')[0].trim()
          }
          const lastName = _.nth(value.split(' '), -1)
          this.question.addAnswer(lastName)
        }
      }
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
    return this.answerType === 'DATE'
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
