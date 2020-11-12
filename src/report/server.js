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

app.get(['/', '/nlp'], (req, res) => res.render('nlp/nlp-reports', {
  helpers: {
    page: () => 'OVERVIEW',
    sponsorLogo: 'ProjectVoiceLogo.png',
    sponsorURL: 'https://projectvoice.ai/',
    title: () => 'NLP Benchmark'
  }
}))

app.get(['/ivr'], (req, res) => res.render('ivr/ivr-reports', {
  helpers: {
    page: () => 'ASR BENCHMARK',
    pageType: () => 'detail',
    sponsorLogo: 'DefinedCrowd.svg',
    sponsorURL: 'https://definedcrowd.com',
    title: () => 'Modern IVR'
  }
}))

app.get('/ivr/summary', (req, res) => res.render('ivr/ivr-reports', {
  helpers: {
    page: () => 'ASR BENCHMARK',
    pageType: () => 'summary',
    sponsorLogo: 'DefinedCrowd.svg',
    sponsorURL: 'https://definedcrowd.com',
    title: () => 'Modern IVR'
  }
}))

app.get('/nlp/protocol', (req, res) => res.render('nlp/nlp-protocol', {
  helpers: {
    page: () => 'TEST PROTOCOL',
    sponsorLogo: 'ProjectVoiceLogo.png',
    sponsorURL: 'https://projectvoice.ai/',
    title: () => 'NLP Benchmark'
  }
}))

app.get('/nlp/topics', (req, res) => res.render('nlp/topics', {
  helpers: {
    page: () => 'TOPIC DRILLDOWN',
    sponsorLogo: 'ProjectVoiceLogo.png',
    sponsorURL: 'https://projectvoice.ai/',
    title: () => 'NLP Benchmark'
  }
}))

app.get('/nlp/details', (req, res) => res.render('nlp/results', {
  helpers: {
    page: () => 'DETAILED RESULTS',
    sponsorLogo: 'ProjectVoiceLogo.png',
    sponsorURL: 'https://projectvoice.ai/',
    title: () => 'NLP Benchmark'
  }
}))

app.get('/nlp/results', async (req, res) => {
  res.send(await cache('results'))
})

app.get('/nlp/successByTopics', async (req, res) => {
  res.send(await cache('successByTopics'))
})

app.get('/nlp/successByPlatform', async (req, res) => {
  res.send(await cache('successByPlatform'))
})

app.get('/nlp/successByComplexity', async (req, res) => {
  res.send(await cache('successByComplexity'))
})

app.get('/nlp/successByAnnotations', async (req, res) => {
  res.send(await cache('successByAnnotations'))
})

app.get('/nlp/successByTopics', async (req, res) => {
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

app.get('/ivr/werByNoisy', async (req, res) => {
  res.send(await cache('werByNoisy', ivrDataSource))
})

app.get('/ivr/werByPlatformEnglish', async (req, res) => {
  res.send(await cache('werByPlatform', ivrDataSource, 'en'))
})

app.get('/ivr/werByPlatformSpanish', async (req, res) => {
  res.send(await cache('werByPlatform', ivrDataSource, 'es'))
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

// simple routine to cache data so we don't keep reloading it
const cachedData = {}
async function cache (routine, dataSource, parameter = undefined) {
  if (!dataSource) {
    dataSource = nlpDataSource
  }
  const key = routine + parameter
  if (!cachedData[key]) {
    console.info('Missed data from cache: ' + key)
    cachedData[key] = await dataSource[routine](parameter)
  }

  return cachedData[key]
}
