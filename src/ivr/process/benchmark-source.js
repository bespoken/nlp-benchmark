const { Config, Record, Source } = require('bespoken-batch-tester')
const S3 = require('../../S3')
const { fetchDataset } = require('../../helper')

class BenchmarkSource extends Source {
  async loadAll () {
    const jobName = Config.get('job')
    const number = Config.get('virtualDeviceConfig.phoneNumber')
    const dataset = fetchDataset()
    const records = []

    for (const row in dataset) {
      const recordingUrl = S3.getUrl(row)
      const prefix = `Number: ${dataset[row].index + 1}. Expected Phrase:`
      const record = new Record(`${prefix} ${dataset[row].fullTranscript}`)
      record.utterance = recordingUrl
      record.meta = {
        platform: jobName.replace('ivr-benchmark-', ''),
        number: number,
        recordingId: row
      }
      records.push(record)
    }

    return records
  }
}

module.exports = BenchmarkSource
