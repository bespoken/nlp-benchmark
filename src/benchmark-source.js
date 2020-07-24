const fs = require('fs')
const { Config, Record, Source } = require('bespoken-batch-tester')
const Question = require('./question')

const platforms = ['alexa']

class QuerySource extends Source {
  async loadAll () {
    const questionsJSON = fs.readFileSync(Config.get('sourceFile'))
    const questionsData = JSON.parse(questionsJSON)
    const records = []
    for (const questionJSON of questionsData.questions) {
      const question = Question.fromJSON(questionJSON)
      const baseUtterance = question.question

      for (const platform of platforms) {
        const utterance = `${platform} ${baseUtterance}`
        const record = new Record(utterance)
        record.meta = {
          question: question
        }
        record.addOutputField('platform', platform)
        record.addDeviceTag(platform)
        records.push(record)
      }
    }
    return records
  }
}

module.exports = QuerySource
