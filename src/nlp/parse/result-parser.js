const _ = require('lodash')
const fs = require('fs')

if (_.nth(process.argv, 2) === 'parse') {
  // const data = fs.readFileSync('data/nlp-benchmark_2020-07-24T19-28-12.json.bak')
  // const data2 = fs.readFileSync('data/nlp-benchmark-alexa_2020-07-24T19-28-12.json')
  const data = fs.readFileSync('data/good-data.json')
  // const data2 = fs.readFileSync('data/nlp-benchmark-alexa_2020-07-24T19-28-12-508.json')
  const data2 = fs.readFileSync('data/nlp-benchmark-alexa_2020-07-24T19-28-12-final.json')
  const json = JSON.parse(data)
  const json2 = JSON.parse(data2)
  const newQuestions = _.keyBy(json2._results, (result) => {
    return result._record._meta.question.question
  })

  for (const key of Object.keys(json)) {
    console.info('key: ' + key)
  }

  for (const result of json._results) {
    const question = result._record._meta.question.question
    if (newQuestions[question]) {
      const newResult = newQuestions[question]
      const oldTranscript = result._responses[0].transcript
      const newTranscript = newResult._responses[0].transcript
      if (oldTranscript === newTranscript) {
        continue
      }
      console.info(`Replacing: ${question}\nOLD: ${oldTranscript}\nNEW: ${newTranscript}\n`)
      result._responses = newResult._responses
    }
  }
  fs.writeFileSync('data/good-data.json', JSON.stringify(json))
} else if (_.nth(process.argv, 2) === 'query') {
  const data = fs.readFileSync('data/nlp-benchmark-google_2020-07-26T16-49-36-original.json')
  const json = JSON.parse(data)

  console.info(json._run)
  const results = json._results.filter((result) => _.get(result, '_record._meta.question.question', '').includes(' us?'))
  results.forEach(result => {
    console.info(result._record._meta.question.question)
    console.info(result._responses[0].transcript)
  })
}
