const $ = require('jquery')
const Chart = require('chart.js')
import { colors, menuData } from './dataGet'

window.addEventListener('load', () => {
  const ctx = document.querySelector('canvas').getContext('2d')
  let chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: menuData.name,
      datasets: [
        {
          data: menuData.proceed,
          backgroundColor: colors,
          borderColor: 'white',
          borderWidth: 1,
        },
      ],
    },
    options: {
      legend: {
        display: false,
      },
    },
  })

  $('input[name=set]').change(async function () {
    console.log($(this).val())
    switch ($(this).val()) {
      case 'proceed':
        chart.data.datasets[0].data = menuData.proceed
        break
      case 'amount':
        chart.data.datasets[0].data = menuData.amount
        break
      case 'people':
        chart.data.datasets[0].data = menuData.people
        break
    }
    chart.update({
      duration: 800,
      easing: 'easeOutBounce',
    })
  })
})
