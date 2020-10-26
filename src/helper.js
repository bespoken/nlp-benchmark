const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')
const AudioGenerator = require('./AudioGenerator')

const fetchDataset = () => {
  const sourceFile = process.env.DATASET_PATH
  const data = fs.readFileSync(sourceFile, 'utf8')
  const dataset = parse(data, {
    delimiter: '\t',
    columns: true
  })
  return dataset
}

const generateUtterances = async () => {
  const dataset = fetchDataset()
  for (const row in dataset) {
    const prefix = `Number: ${Number(row) + 1}. Expected Phrase:`
    const path = dataset[row].path
    await AudioGenerator.mergeAudios(prefix, path)
  }
}

module.exports = {
  fetchDataset
}

if (_.nth(process.argv, 2) === 'generate') {
  generateUtterances().then(() => {
    console.log('DONE')
  }).catch(er => console.log(er))
}
