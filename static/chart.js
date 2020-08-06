/* global Chart */

const ChartHelper = {
  bar: (title, datasets) => {
    const options = {
      data: datasets,
      options: {
        legend: {
          display: datasets.length > 1, // Show the legend if there is more than one dataset
          position: 'top'
        },
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
        responsive: false,
        scales: {
          yAxes: [{
            display: true,
            gridLines: {
              color: 'rgb(0,0,0)',
              display: true,
              drawOnChartArea: false,
              drawTicks: false
            },
            ticks: {
              beginAtZero: true,
              padding: 10,
              max: 100,
              stepSize: 50
            }
          }],
          xAxes: [{
            gridLines: {
              color: 'rgb(0,0,0)',
              display: true,
              drawOnChartArea: false,
              drawTicks: false
            },
            ticks: {
              padding: 10
            }
          }]
        },
        title: {
          display: true,
          fontFamily: 'Khand',
          fontSize: 20,
          text: title
        }
      },
      type: 'bar'
    }

    Chart.defaults.global.defaultFontFamily = 'Roboto Condensed'
    Chart.defaults.global.defaultFontSize = 16
    Chart.defaults.global.defaultFontColor = 'rgb(0,0,0)'
    return options
  },

  colorAlexa: () => 'rgba(93, 188, 210, 1.0)',
  colorGoogle: () => 'rgba(250, 189, 3, 1.0)'
}

window.ChartHelper = ChartHelper
