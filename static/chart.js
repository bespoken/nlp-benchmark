const ChartHelper = {
  bar: () => {
    const options = {
      type: 'bar',
      options: {
        legend: {
          display: false,
          position: 'end'
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
          text: 'Success By Platform'
        }
      }
    }

    Chart.defaults.global.defaultFontFamily = 'Roboto Condensed'
    Chart.defaults.global.defaultFontSize = 16
    Chart.defaults.global.defaultFontColor = 'rgb(0,0,0)'
    return options
  },

  colorAlexa: 'rgba(93, 188, 210, 1.0)',
  colorGoogle: ''
}

window.ChartHelper = ChartHelper
