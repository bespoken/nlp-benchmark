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
      const prefix = `Number: ${dataset[row].index + 1}. Expected Phrase:`
      const record = new Record(`${prefix} ${dataset[row].fullTranscript}`)
      const platform = jobName.replace('ivr-benchmark-', '')
      if (platform.includes('twilio')) {
        // TODO: url should not have Number: {number}. Expected Phrase:
        const recordingUrl = S3.getUrl(row)
        record.utterance = recordingUrl
      } else {
        const recordingUrl = S3.getUrl(row)
        record.utterance = recordingUrl
      }
      record.meta = {
        platform: platform,
        number: number,
        recordingId: row,
        index: dataset[row].index + 1
      }
      records.push(record)
    }

    return records
  }
}

module.exports = BenchmarkSource
