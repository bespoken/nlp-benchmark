class Question {
  static fromJSON (json) {
    const question = new Question()
    Object.assign(question, json)
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
  }

  addAnswer (answer) {
    if (!answer) {
      return
    }
    this.answers.push(answer)
  }
}

module.exports = Question
