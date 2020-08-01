const _ = require('lodash')
const { CanvasRenderService } = require('chartjs-node-canvas')
const DataSource = require('./datasource')
const fs = require('fs')

class Reporter {
  async successFailureByPlatform () {
    const dataSource = new DataSource()

    const rawData = await dataSource.successFailureByPlatform()
    console.info('rawdata: ' + JSON.stringify(rawData))
    const width = 400
    const height = 400
    const chartCallback = (ChartJS) => {
      console.info('chartjs: ' + JSON.stringify(ChartJS))
      // Global config example: https://www.chartjs.org/docs/latest/configuration/
      ChartJS.defaults.global.elements.rectangle.borderWidth = 2
      // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
      ChartJS.plugins.register({
        // plugin implementation
      })
      // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
      ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
        // chart implementation
      })
    }
    const canvasRenderService = new CanvasRenderService(width, height, chartCallback)

    const renderChart = async () => {
      const chartData = {
        labels: ['Success By Platform'],
        datasets: [{
          label: ['Amazon Alexa', 'Google Assistant'],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)'
          ],
          borderWidth: 1,
          data: [rawData.alexa.successPercentage, rawData.google.successPercentage]
        }]
      }

      const options = {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Chart.js Bar Chart'
          }
        }
      }

      const imageBuffer = await canvasRenderService.renderToBuffer(options)

      fs.writeFileSync('output/chart.png', imageBuffer, 'image/png')
    }
    await renderChart()
  }
}

module.exports = Reporter
