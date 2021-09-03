import { Chart, registerables } from 'chart.js'
import $ from 'jquery'

import { colors, menuData } from './dataGet'

Chart.register(...registerables)

const ChartFirstDraw = (): void => {
  const ctx = document.querySelector('canvas')?.getContext('2d')
  if (ctx) {
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: menuData.name,
        datasets: [
          {
            data: menuData.proceeds,
            backgroundColor: colors,
            borderColor: 'white',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })
    $('input[name=set]').on('change', function () {
      switch ($(this).val()) {
        case 'proceeds':
          chart.data.datasets[0].data = menuData.proceeds
          break
        case 'amount':
          chart.data.datasets[0].data = menuData.amount
          break
        case 'customers':
          chart.data.datasets[0].data = menuData.customers
          break
      }
      chart.update()
    })
  }
}

export { ChartFirstDraw }
