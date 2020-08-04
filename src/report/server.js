const DataSource = require('./datasource')
const express = require('express')

require('dotenv').config()

const app = express()
const port = 3000

app.use(express.static('static'))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/successByPlatform', async (req, res) => {
  const dataSource = new DataSource()
  const data = await dataSource.successFailureByPlatform()
  res.send(data)
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
