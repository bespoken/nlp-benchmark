const { Config, Record, Source } = require('bespoken-batch-tester')
const { DefinedCrowd } = require('../parse/defined-crowd')

class BenchmarkSource extends Source {
  async loadAll () {
    const jobName = Config.get('job')
    const number = Config.get('virtualDeviceConfig.phoneNumber')
    const definedCrowd = new DefinedCrowd()
    const dataset = definedCrowd.getDataset()
    const records = []

    for (const i in dataset) {
      const record = new Record('')
      const platform = jobName.replace('ivr-benchmark-', '')
      if (platform.includes('twilio')) {
        const recordingUrl = definedCrowd.getUrl(dataset[i])
        record.utterance = recordingUrl
      } else {
        const prefix = `Number: ${i + 1}. Expected Phrase:`
        const recordingUrl = definedCrowd.getUrl(dataset[i], prefix)
        record.utterance = recordingUrl
      }
      record.meta = {
        platform: platform,
        number: number,
        recordingId: i,
        index: i + 1
      }
      records.push(record)
    }

    return records
  }
}

module.exports = BenchmarkSource
