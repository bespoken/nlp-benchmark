const _ = require('lodash')
const fs = require('fs')
const stringify = require('csv-stringify/lib/sync')
class QueryParser {
  async run () {
    const dataString = fs.readFileSync('datasets/snips/2016-12-built-in-intents/benchmark_data.json')
    const json = JSON.parse(dataString)
    console.log('Domains: ' + json.domains.length)
    const records = []
    for (const domain of json.domains) {
      const domainName = domain.name
      console.log(`${domainName} Intents: ${domain.intents.length}`)

      for (const intent of domain.intents) {
        const intentName = intent.name
        console.log(`${intentName} Queries: ${intent.queries.length}`)

        for (const query of intent.queries) {
          const text = query.text
          if (text.toLowerCase().includes('lori') || text.toLowerCase().includes('steve') || text.toLowerCase().includes('jo')) {
            continue
          }
          const record = [text, intentName, domainName]
          records.push(record)
        }
      }
    }

    const randomizedRecords = this.randomize(records)
    let finalRecords = [['utterance', 'intent', 'domain']]
    finalRecords = finalRecords.concat(randomizedRecords)
    const recordsString = stringify(finalRecords)
    console.log('Records:' + records)
    fs.writeFileSync('input/benchmark.csv', recordsString)
    return Promise.resolve()
  }

  randomize (records) {
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const swapWith = Math.floor(Math.random() * records.length)
      records[i] = records[swapWith]
      records[swapWith] = record
    }
    return records
  }
}

if (_.nth(process.argv, 2) === 'parse') {
  const parser = new QueryParser()
  parser.run().then(() => {
    console.log('Parsed')
  })
}
