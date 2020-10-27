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
      const clipUrl = dataset[row].path.replace(/.\/input\/audio\/|.mp3/ig, '')
      const utterance = S3.getUrl(clipUrl)
      const record = new Record(utterance)
      record.meta = {
        platform: jobName.replace('ivr-benchmark-', ''),
        number: number,
        clipUrl: clipUrl
      }
      const prefix = `Number: ${Number(row) + 1}. Expected Phrase:`
      record.utterance = `${prefix} ${dataset[row].sentence}`
      records.push(record)
    }

    return records
  }
}

module.exports = BenchmarkSource
