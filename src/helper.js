const fs = require('fs')
const parse = require('csv-parse/lib/sync')

const fetchDataset = () => {
  const sourceFile = process.env.DATASET_PATH
  const data = fs.readFileSync(sourceFile, 'utf8')
  const dataset = parse(data, {
    delimiter: '\t',
    columns: true
  })
  return dataset
}

module.exports = {
  fetchDataset
}
