/* global Chart */

const ChartHelper = {
  bar: (title, data) => {
    const options = {
      data: data,
      options: {
        layout: {
          padding: {
            top: 0
          }
        },
        legend: {
          display: (data.datasets.length > 1), // Show the legend if there is more than one dataset
          labels: {
            padding: 10
          },
          position: 'top'
        },
        maintainAspectRatio: false,
        plugins: {
          // Change options for ALL labels of THIS CHART
          datalabels: {
            align: 'top',
            anchor: 'end',
            font: {
              family: 'Roboto Condensed',
              size: 14,
              weight: 'bold'
            },
            formatter: (s) => {
              return s + '%'
            },
            textAlign: 'top'
          }
        },
        responsive: true,
        scales: {
          offset: false,
          xAxes: [{
            gridLines: {
              color: 'rgb(0,0,0)',
              display: false,
              drawOnChartArea: false,
              drawTicks: false
            },
            ticks: {
              padding: 10
            }
          }],
          yAxes: [{
            display: false,
            gridLines: {
              color: 'rgb(0,0,0)',
              display: true,
              drawOnChartArea: false,
              drawTicks: false
            },
            ticks: {
              beginAtZero: true,
              display: false,
              padding: 10,
              max: 100,
              stepSize: 50
            }
          }]
        },
        title: {
          display: true,
          fontFamily: ChartHelper.titleFont(),
          fontSize: ChartHelper.titleFontSize(),
          text: title
        }
      },
      type: 'bar'
    }

    Chart.defaults.global.defaultFontFamily = ChartHelper.defaultFont()
    Chart.defaults.global.defaultFontSize = ChartHelper.defaultFontSize()
    Chart.defaults.global.defaultFontColor = 'rgb(0,0,0)'
    return options
  },

  colorAlexa: () => 'rgba(93, 188, 210, 1.0)',
  colorGoogle: () => 'rgba(250, 189, 3, 1.0)',
  colorSiri: () => 'rgb(193, 193, 193)',
  defaultFont: () => 'Roboto Condensed',
  defaultFontSize: () => 16,
  titleFont: () => 'Khand',
  titleFontSize: () => 20,

  createNewLegendAndAttach: (chartInstance, legendOpts) => {
    var legend = new Chart.NewLegend({
      ctx: chartInstance.chart.ctx,
      options: legendOpts,
      chart: chartInstance
    })

    if (chartInstance.legend) {
      Chart.layoutService.removeBox(chartInstance, chartInstance.legend)
      delete chartInstance.newLegend
    }

    chartInstance.newLegend = legend
    Chart.layoutService.addBox(chartInstance, legend)
  }

}

// Got this code from here:
// https://stackoverflow.com/questions/42585861/chart-js-increase-spacing-between-legend-and-chart
// To increase the distance between the chart area and the legend
Chart.NewLegend = Chart.Legend.extend({
  afterFit: function () {
    this.height = this.height + 10
  }
})

// Register the legend plugin
Chart.plugins.register({
  beforeInit: function (chartInstance) {
    var legendOpts = chartInstance.options.legend

    if (legendOpts) {
      ChartHelper.createNewLegendAndAttach(chartInstance, legendOpts)
    }
  },
  beforeUpdate: function (chartInstance) {
    var legendOpts = chartInstance.options.legend

    if (legendOpts) {
      legendOpts = Chart.helpers.configMerge(Chart.defaults.global.legend, legendOpts)

      if (chartInstance.newLegend) {
        chartInstance.newLegend.options = legendOpts
      } else {
        ChartHelper.createNewLegendAndAttach(chartInstance, legendOpts)
      }
    } else {
      Chart.layoutService.removeBox(chartInstance, chartInstance.newLegend)
      delete chartInstance.newLegend
    }
  },
  afterEvent: function (chartInstance, e) {
    var legend = chartInstance.newLegend
    if (legend) {
      legend.handleEvent(e)
    }
  }
})

window.ChartHelper = ChartHelper
