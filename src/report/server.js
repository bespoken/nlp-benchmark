const DataSource = require('./datasource')
const express = require('express')
const handlebars = require('express-handlebars')

require('dotenv').config()

const app = express()
const port = 3000

app.engine('handlebars', handlebars())
app.set('views', './web/views/')
app.set('view engine', 'handlebars')

app.use('/web', express.static('web'))

const dataSource = new DataSource()

app.get('/', (req, res) => res.render('reports', {
  helpers: {
    title: () => 'My Title'
  }
}))

app.get('/successByPlatform', async (req, res) => {
  res.send(await dataSource.successByPlatform())
})

app.get('/successByComplexity', async (req, res) => {
  res.send(await dataSource.successByComplexity())
})

app.get('/successByAnnotations', async (req, res) => {
  res.send(await dataSource.successByAnnotations())
})

app.get('/successByTopics', async (req, res) => {
  res.send(await dataSource.successByTopics())
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
