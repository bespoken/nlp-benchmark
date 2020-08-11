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
    page: () => 'OVERVIEW'
  }
}))

app.get('/protocol', (req, res) => res.render('protocol', {
  helpers: {
    page: () => 'TEST PROTOCOL'
  }
}))

app.get('/details', (req, res) => res.render('results'))

app.get('/results', async (req, res) => {
  res.send(await cache('results'))
})

app.get('/successByTopics', async (req, res) => {
  res.send(await cache('successByTopics'))
})

app.get('/successByPlatform', async (req, res) => {
  res.send(await cache('successByPlatform'))
})

app.get('/successByComplexity', async (req, res) => {
  res.send(await cache('successByComplexity'))
})

app.get('/successByAnnotations', async (req, res) => {
  res.send(await cache('successByAnnotations'))
})

app.get('/successByTopics', async (req, res) => {
  res.send(await cache('successByTopics'))
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

// simple routine to cache data so we don't keep reloading it
const cachedData = {}
async function cache (routine) {
  if (!cachedData[routine]) {
    console.info('Missed data from cache: ' + routine)
    cachedData[routine] = await dataSource[routine]()
  } else {
    console.info('Loading data from cache: ' + routine)
  }

  return cachedData[routine]
}
