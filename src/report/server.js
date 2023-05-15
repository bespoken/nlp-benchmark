const DataSource = require('./nlp-datasource')
const NLPDataSource = require('./nlp-2023-datasource')
const IVRDataSource = require('./ivr-datasource')
const express = require('express')
const handlebars = require('express-handlebars')

require('dotenv').config()

const app = express()
const port = 3000

app.set('views', './web/views/')
app.set('view engine', 'handlebars')

app.use('/web', express.static('web'))

const nlpDataSource = new DataSource()
const nlpNewDataSource = new NLPDataSource()
const ivrDataSource = new IVRDataSource()

var hbs = handlebars.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    company: () => 'Bespoken'
  }
})
app.engine('handlebars', hbs.engine)

app.get(['/nlp'], (req, res) => res.render('nlp/nlp-reports', {
  helpers: {
    page: () => 'OVERVIEW',
    sponsorLogo: 'ProjectVoiceLogo.png',
    sponsorURL: 'https://projectvoice.ai/',
    title: () => 'NLP Benchmark'
  }
}))

app.get(['/', '/llm'], (req, res) => res.render('llm/llm-report', {
  helpers: {
    description: 'Bespoken LLM/NLP Benchmark - Alexa, ChatGPT and Google Compared',
    //sponsorLogo: 'ProjectVoiceLogo.png',
    //sponsorURL: 'https://projectvoice.ai/',
    title: () => 'LLM/NLP Benchmark'
  }
}))

app.get(['/ivr'], (req, res) => res.render('ivr/ivr-reports', {
  helpers: {
    company: () => 'Bespoken and DefinedCrowd',
    page: () => 'ASR PERFORMANCE',
    pageType: () => 'detail',
    sponsorLogo: 'DefinedCrowd.svg',
    sponsorURL: 'https://definedcrowd.com',
    title: () => 'IVR Benchmark'
  }
}))

app.get('/ivr/summary', (req, res) => res.render('ivr/ivr-reports', {
  helpers: {
    company: () => 'Bespoken and DefinedCrowd',
    page: () => 'ASR PERFORMANCE',
    pageType: () => 'detail',
    sponsorLogo: 'DefinedCrowd.svg',
    sponsorURL: 'https://definedcrowd.com',
    title: () => 'IVR Benchmark'
  }
}))

app.get('/ivr/protocol', (req, res) => res.render('ivr/ivr-protocol', {
  helpers: {
    company: () => 'Bespoken and DefinedCrowd',
    page: () => 'ASR PERFORMANCE',
    pageType: () => 'summary',
    sponsorLogo: 'DefinedCrowd.svg',
    sponsorURL: 'https://definedcrowd.com',
    title: () => 'IVR Benchmark'
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

// NLP new reports
app.get('/llm/results', async (req, res) => {
  res.send(await cache('results', nlpNewDataSource, '2023'))
})

app.get('/llm/topics', (req, res) => res.render('llm/topics', {
    helpers: {
      page: () => 'TOPIC DRILLDOWN',
      //sponsorLogo: 'ProjectVoiceLogo.png',
      //sponsorURL: 'https://projectvoice.ai/',
      title: () => 'LLM Benchmark'
    }
  }))

app.get('/llm/successByTopics', async (req, res) => {
  res.send(await cache('successByTopics', nlpNewDataSource, '2023'))
})

app.get('/llm/successByPlatform', async (req, res) => {
  res.send(await cache('successByPlatform', nlpNewDataSource, '2023'))
})

app.get('/llm/successByComplexity', async (req, res) => {
  res.send(await cache('successByComplexity', nlpNewDataSource, '2023'))
})

app.get('/llm/successByAnnotations', async (req, res) => {
  res.send(await cache('successByAnnotations', nlpNewDataSource, '2023'))
})

app.get('/llm/successByTopics', async (req, res) => {
  res.send(await cache('successByTopics', nlpNewDataSource, '2023'))
})

// IVR reports
app.get('/ivr/werByAgeGroup', async (req, res) => {
  res.send(await cache('werByAgeGroup', ivrDataSource, 'en'))
})

app.get('/ivr/werByAgeGroupSpanish', async (req, res) => {
  res.send(await cache('werByAgeGroup', ivrDataSource, 'es'))
})

app.get('/ivr/werByDomain', async (req, res) => {
  res.send(await cache('werByDomain', ivrDataSource, 'en'))
})

app.get('/ivr/werByDomainSpanish', async (req, res) => {
  res.send(await cache('werByDomain', ivrDataSource, 'es'))
})

app.get('/ivr/werByEthnicity', async (req, res) => {
  res.send(await cache('werByEthnicity', ivrDataSource))
})

app.get('/ivr/werByGender', async (req, res) => {
  res.send(await cache('werByGender', ivrDataSource))
})

app.get('/ivr/werByGenderSpanish', async (req, res) => {
  res.send(await cache('werByGender', ivrDataSource, 'es'))
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
