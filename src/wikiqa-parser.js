const _ = require('lodash')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Question = require('./question')

class WikiQAParser {
  parse () {
    const contents = fs.readFileSync('datasets/WikiQACorpus/WikiQA.tsv')
    const rows = parse(contents, {
      columns: true,
      delimiter: '\t',
      relax: true
    })

    const questions = {}
    for (const row of rows) {
      let question = questions[row.QuestionID]
      // console.log('QuestionID: ' + row.QuestionID + ' question: ' + row.Question)
      if (question) {
        question.addAnswer(row.Sentence)
      } else {
        question = new Question(row.Question, row.DocumentTitle, row.Sentence)
        questions[row.QuestionID] = question
      }
    }
    // console.log('Questions: ' + JSON.stringify(questions)

    const questionArray = Object.keys(questions).map(id => questions[id])

    fs.writeFileSync('input/datasets/wikiqa.json', JSON.stringify({
      questions: questionArray
    }, null, 2))
  }
}

module.exports = WikiQAParser

if (_.nth(process.argv, 2) === 'parse') {
  const parser = new WikiQAParser()
  parser.parse()
}
