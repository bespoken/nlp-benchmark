const { Config, Record, Source } = require('bespoken-batch-tester')
const { DefinedCrowd } = require('../parse/defined-crowd')

class BenchmarkSource extends Source {
  async loadAll () {
    const jobName = Config.get('job')
    const number = Config.get('virtualDeviceConfig.phoneNumber')
    const definedCrowd = new DefinedCrowd()
    const dataset = await definedCrowd.getDataset()
    const records = []
    let rows = []

    if (process.env.LIMIT) {
      rows = dataset.slice(0, process.env.LIMIT)
    } else {
      rows = dataset
    }

    for (const i in rows) {
      const platform = jobName.replace('ivr-benchmark-', '')
      const record = new Record(dataset[i].transcript)
      const recordingUrl = await definedCrowd.getUrl(dataset[i])
      record.utterance = recordingUrl
      record.meta = {
        platform: platform,
        number: number,
        recordingId: dataset[i].recording,
        index: Number(i) + 1
      }
      records.push(record)
    }

    return records
  }
}

module.exports = BenchmarkSource
