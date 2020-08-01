const Reporter = require('../src/report/reporter')

require('dotenv').config()

describe('reporter works correctly', () => {
  test('creates a bar chart image', async () => {
    const reporter = new Reporter()
    await reporter.successFailureByPlatform()
  })
})
