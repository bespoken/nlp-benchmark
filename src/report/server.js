const DataSource = require('./nlp-datasource')
const IVRDataSource = require('./ivr-datasource')
const express = require('express')
const handlebars = require('express-handlebars')

require('dotenv').config()

const app = express()
const port = 3000

app.engine('handlebars', handlebars())
app.set('views', './web/views/')
app.set('view engine', 'handlebars')

app.use('/web', express.static('web'))

const nlpDataSource = new DataSource()
const ivrDataSource = new IVRDataSource()

app.get('/nlp', (req, res) => res.render('nlp/nlp-reports', {
  helpers: {
    page: () => 'OVERVIEW',
    title: () => 'NLP Benchmark'
  }
}))

app.get(['/', '/ivr'], (req, res) => res.render('ivr/ivr-reports', {
  helpers: {
    page: () => 'ASR BENCHMARK',
    pageType: () => 'detail',
    title: () => 'Modern IVR'
  }
}))

app.get('/ivr/summary', (req, res) => res.render('ivr/ivr-reports', {
  helpers: {
    page: () => 'ASR BENCHMARK',
    pageType: () => 'summary',
    title: () => 'Modern IVR'
  }
}))

app.get('/protocol', (req, res) => res.render('protocol', {
  helpers: {
    page: () => 'TEST PROTOCOL'
  }
}))

app.get('/topics', (req, res) => res.render('topics', {
  helpers: {
    page: () => 'TOPIC DRILLDOWN'
  }
}))

app.get('/details', (req, res) => res.render('results', {
  helpers: {
    page: () => 'DETAILED RESULTS'
  }
}))

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

// IVR reports
app.get('/ivr/werByAgeGroup', async (req, res) => {
  res.send(await cache('werByAgeGroup', ivrDataSource))
})

app.get('/ivr/werByDomain', async (req, res) => {
  res.send(await cache('werByDomain', ivrDataSource))
})

app.get('/ivr/werByEthnicity', async (req, res) => {
  res.send(await cache('werByEthnicity', ivrDataSource))
})

app.get('/ivr/werByGender', async (req, res) => {
  res.send(await cache('werByGender', ivrDataSource))
})

app.get('/ivr/werByPlatform', async (req, res) => {
  res.send(await cache('werByPlatform', ivrDataSource))
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

// simple routine to cache data so we don't keep reloading it
const cachedData = {}
async function cache (routine, dataSource) {
  if (!dataSource) {
    dataSource = nlpDataSource
  }
  if (!cachedData[routine]) {
    console.info('Missed data from cache: ' + routine)
    cachedData[routine] = await dataSource[routine]()
  }

  return cachedData[routine]
}
