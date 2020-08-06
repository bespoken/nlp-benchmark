const DataSource = require('./datasource')
const express = require('express')
const handlebars = require('express-handlebars')

require('dotenv').config()

const app = express()
const port = 3000

app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')

app.use('/static', express.static('static'))

app.get('/', (req, res) => res.render('home', {
  helpers: {
    title: () => 'My Title'
  }
}))

app.get('/successByPlatform', async (req, res) => {
  const dataSource = new DataSource()
  const data = await dataSource.successByPlatform()
  res.send(data)
})

app.get('/successByComplexity', async (req, res) => {
  const dataSource = new DataSource()
  const data = await dataSource.successByComplexity()
  res.send(data)
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
