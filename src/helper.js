const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')
const AudioGenerator = require('./AudioGenerator')
const S3 = require('./S3')

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
    const audio = await AudioGenerator.mergeAudios(prefix, path)
    const audioBuffer = Buffer.from(audio, 'base64')
    const fixedPath = path.replace(/.\/input\/audio\/|.mp3/ig, '')
    await S3.upload(audioBuffer, fixedPath)
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
