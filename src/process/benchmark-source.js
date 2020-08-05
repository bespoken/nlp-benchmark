const fs = require('fs')
const { Config, Record, Source } = require('bespoken-batch-tester')
const Question = require('./question')

class QuerySource extends Source {
  async loadAll () {
    const jobName = Config.get('job')
    let platform
    let utterancePrefix
    let utteranceSuffix
    if (jobName.includes('alexa')) {
      platform = 'alexa'
      utterancePrefix = 'alexa'
    } else if (jobName.includes('google')) {
      platform = 'google'
      utterancePrefix = 'hey google'
    } else if (jobName.includes('siri')) {
      platform = 'siri'
      utterancePrefix = '<speak> hey siri <break time="4s"/> '
      utteranceSuffix = '</speak>'
    }

    const questionsJSON = fs.readFileSync(Config.get('sourceFile'))
    const questionsData = JSON.parse(questionsJSON)
    const records = []
    for (const questionJSON of questionsData.questions) {
      const question = Question.fromJSON(questionJSON)
      const baseUtterance = question.question

      let utterance = `${utterancePrefix} ${baseUtterance}`
      if (utteranceSuffix) {
        utterance += ' ' + utteranceSuffix
      }
      const record = new Record(utterance)
      record.meta = {
        question: question
      }
      record.addOutputField('platform', platform)
      record.addDeviceTag(platform)
      records.push(record)
    }
    return records
  }
}

module.exports = QuerySource
