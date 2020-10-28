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

  // Generate a dataset combining the transcriptions for the same recordings
  const reducedDataset = dataset.reduce((finalDataset, row) => {
    if (Object.keys(finalDataset).includes(row.recordingid)) {
      finalDataset[row.recordingid].fullTranscript += ` ${row.transcription}`
    } else {
      finalDataset[row.recordingid] = {
        index: Object.keys(finalDataset).length
      }
      finalDataset[row.recordingid].fullTranscript = row.transcription
    }
    return finalDataset
  }, Object.create(null))
  return reducedDataset
}

const generateUtterances = async () => {
  const dataset = fetchDataset()
  for (const row in dataset) {
    const prefix = `Number: ${dataset[row].index + 1}. Expected Phrase:`
    console.info(prefix)
    const recording = `input/ivr/recordings/${row}.wav`
    const audio = await AudioGenerator.mergeAudios(prefix, recording)
    const audioBuffer = Buffer.from(audio, 'base64')
    await S3.upload(audioBuffer, row)
    console.info(`DONE ${dataset[row].index + 1}`)
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
