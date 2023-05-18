const Utils = {
    getImage: function (url) {
        const img = new Image();
        img.id = 'Test IMage' + Math.random()
        img.loading = 'eager'
        img.src = url
        //img.width = '100px'
        //img.height = '100px'
        return img;
    }
}
/* global Chart */
const ChartHelper = {
  bar: (title, data, percentage = true, precision = 2) => {
    const options = {
      data: data,
      options: {
        //animation: false,
        layout: {
          padding: {
            top: 0
          }
        },
        maintainAspectRatio: false,
        plugins: {
          annotation: {
            annotations: addAnnotations(data),
            clip: false
          },
          // Change options for ALL labels of THIS CHART
          datalabels: {
            align: 'top',
            anchor: 'end',
            display: true,
            font: {
              family: 'Poppins',
              size: 16,
              weight: 'bold'
            },
            formatter: (s) => {
              if (percentage) {
                return s.toFixed(precision) + '%'
              } else {
                return s.toFixed(precision)
              }
            },
            textAlign: 'top'
          },
          legend: {
            display: (data.datasets.length > 1), // Show the legend if there is more than one dataset
            labels: {
              padding: 10
            },
            position: 'top'
          },
        },
        resizeDelay: 1,
        responsive: true,
        scales: {
          x: {
            border: {
                color: 'black',
                width: 2,
                z: 1
            },
            display: true,
            grid: {
              color: 'rgb(0,0,0)',
              display: false,
              drawOnChartArea: false,
              drawTicks: false
            },
            ticks: {
              font: {
                color: 'black',
                family: 'Poppins',
                size: '16 pt',
                weight: 'bold',
              },
              padding: 10
            }
          },
          y: {
            display: false,
            grid: {
              color: 'rgb(0,0,0)',
              display: false,
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
          }
        },
        title: {
          display: false,
          fontFamily: ChartHelper.titleFont(),
          fontSize: ChartHelper.titleFontSize(),
          text: title
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label || ''
              const value = percentage ? `${tooltipItem.value}%` : tooltipItem.value
              if (label) {
                label += `: ${value}`
              } else {
                label = `${tooltipItem.label}: ${value}`
              }
              return label
            }
          }
        },
        watermark: {
          // the image you would like to show
          // alternatively, this can be of type "Image"
          image: '/web/images/Logo-BlackText.png',

          // x and y offsets of the image
          x: 50,
          y: 50,

          // width and height to resize the image to
          // image is not resized if these values are not set
          width: 80,
          height: 29,

          // opacity of the image, from 0 to 1 (default: 1)
          opacity: 0.8,

          // x-alignment of the image (default: "left")
          // valid values: "left", "middle", "right"
          alignX: 'left',
          // y-alignment of the image (default: "top")
          // valid values: "top", "middle", "bottom"
          alignY: 'top',

          // if true, aligns the watermark to the inside of the chart area (where the lines are)
          // (where the lines are)
          // if false, aligns the watermark to the inside of the canvas
          // see samples/alignToChartArea.html
          alignToChartArea: false,

          // determines whether the watermark is drawn on top of or behind the chart
          // valid values: "front", "back"
          position: 'back'
        }
      },
      //plugins: [ChartDataLabels],
      type: 'bar'
    }

    Chart.defaults.plugins.legend.display = false
    Chart.defaults.color = 'black'
    //Chart.defaults.global.defaultFontFamily = ChartHelper.defaultFont()
    //Chart.defaults.global.defaultFontSize = ChartHelper.defaultFontSize()
    //Chart.defaults.global.defaultFontColor = 'rgb(0,0,0)'
    //Chart.defaults.global.animation.duration = 2000
    return options
  },

  colorAlexa: () => 'rgb(66, 133, 243)',
  colorAmazon: () => 'rgb(0, 171, 186)',
  colorDialogflow: () => 'rgb(239, 108, 0)',
  colorGoogle: () => 'rgb(255, 215, 0)',
  colorOpenAI: () => 'rgb(75, 213, 159)',
  colorSiri: () => 'rgb(193, 193, 193)',
  colorTwilio: () => 'rgb(242, 47, 70)',
  defaultFont: () => 'Roboto Condensed',
  defaultFontSize: () => 16,
  titleFont: () => 'Poppins',
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

function addAnnotations(data) {
    if (!data.labels.includes('OpenAI ChatGPT')) {
        return
    }

    return {
        alexa: addImage('Amazon Alexa', 50, '/web/images/Alexa-inverted.png'),
        google: addImage('Google Assistant', 55, '/web/images/GoogleAssistant-inverted.png'),
        chatGPT: addImage('OpenAI ChatGPT', 60, '/web/images/OpenAI-inverted.png')      
    }
}
function addImage(dataPoint, y, url) {
    return {
        type: 'label',
        //drawTime: 'afterDraw',
        //borderColor: (ctx) => ctx.chart.data.datasets[0].backgroundColor,
        width: 80,
        height: 80,
        borderRadius: 1,
        borderWidth: 0,
        content: Utils.getImage(url),
        opacity: 1.0,
        // position: {
        //     x: 'center',
        //     y: 'end'
        // },
        xValue: dataPoint,
        //yOffset: 30,
        yValue: y,
        z: 100
    }
}
// Got this code from here:
// https://stackoverflow.com/questions/42585861/chart-js-increase-spacing-between-legend-and-chart
// To increase the distance between the chart area and the legend
// Chart.NewLegend = Chart.Legend.extend({
//   afterFit: function () {
//     this.height = this.height + 10
//   }
// })

//Chart.register(ChartDataLabels)
Chart.register(ChartDataLabels)

// Register the legend plugin
// Chart.plugins.register({
//   beforeInit: function (chartInstance) {
//     var legendOpts = chartInstance.options.legend

//     if (legendOpts) {
//       ChartHelper.createNewLegendAndAttach(chartInstance, legendOpts)
//     }
//   },
//   beforeUpdate: function (chartInstance) {
//     var legendOpts = chartInstance.options.legend

//     if (legendOpts) {
//       legendOpts = Chart.helpers.configMerge(Chart.defaults.global.legend, legendOpts)

//       if (chartInstance.newLegend) {
//         chartInstance.newLegend.options = legendOpts
//       } else {
//         ChartHelper.createNewLegendAndAttach(chartInstance, legendOpts)
//       }
//     } else {
//       Chart.layoutService.removeBox(chartInstance, chartInstance.newLegend)
//       delete chartInstance.newLegend
//     }
//   },
//   afterEvent: function (chartInstance, e) {
//     var legend = chartInstance.newLegend
//     if (legend) {
//       legend.handleEvent(e)
//     }
//   }
// })

window.ChartHelper = ChartHelper