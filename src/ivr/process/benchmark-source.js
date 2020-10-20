const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const { Config, Record, Source } = require('bespoken-batch-tester')
// const TTS = require('../../tts')

class BenchmarkSource extends Source {
  static fetchDataset () {
    const sourceFile = process.env.DATASET_PATH
    const data = fs.readFileSync(sourceFile, 'utf8')
    const dataset = parse(data, {
      delimiter: '\t',
      columns: true
    })
    return dataset
  }

  async loadAll () {
    const jobName = Config.get('job')
    const number = Config.get('virtualDeviceConfig.phoneNumber')
    const dataset = BenchmarkSource.fetchDataset()
    const records = []

    for (const row in dataset) {
      // const prefix = `Number: ${row + 1}. Expected Phrase:`
      // const prefixAudio = await TTS.textToSpeechPolly(prefix)
      const utterance = dataset[row].sentence
      const record = new Record(utterance)
      record.meta = {
        platform: jobName.replace('ivr-benchmark-', ''),
        number: number,
        clipUrl: dataset[row].path
      }
      // Set raw utterance
      // record.utterance = S3 pre-signed URL
      records.push(record)
    }

    return records
  }
}

module.exports = BenchmarkSource
