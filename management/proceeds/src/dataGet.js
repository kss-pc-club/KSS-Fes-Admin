import { formatNum } from './func'
const $ = require('jquery')
var menuData = {
  name: [],
  amount: [],
  proceed: [],
  people: [],
}
var colors = ['#7e40f2', '#b4f240', '#405af2', '#f240b4', '#f27e40']

window.addEventListener('DOMContentLoaded', () => {
  fetch('../clsdata.json', {
    credentials: 'same-origin',
  })
    .then((r) => r.json())
    .then((j) => {
      $('p#name').text(`${j.class} ${j.name}`)
      $('p#total').text(formatNum(j.proceeds))
      let total = {
        amount: 0,
        proceed: 0,
        people: 0,
      }
      for (let i = 0; i < j.menus.length; i++) {
        const e = j.menus[i]
        $('div.items').append(`
			<div class="item">
				<div class="color" style="background-color: ${colors[i]};"></div>
				<img src="../../monitor/icons/${e.icon}.png" class="icon">
				<p class="name">${e.name}</p>
				<p class="proc" data-money="${e.price}" data-amount="${e.proceed}" data-people="${e.people}"></p>
				<p class="percentage"></p>
			</div>
		`)

        menuData.name.push(e.name)
        menuData.amount.push(e.proceed)
        menuData.proceed.push(e.proceed * e.price)
        menuData.people.push(e.people)

        total.amount += e.proceed
        total.proceed += e.proceed * e.price
        total.people += e.people
      }

      for (const k in total) {
        if (total.hasOwnProperty(k)) {
          $('p#total').attr(`data-${k}`, total[k])
        }
      }

      const showData = function (self, isfirst = false) {
        const e = isfirst ? 'proceed' : $(self).val()
        const total = Number($('p#total').attr(`data-${e}`))
        $('div.item').each(function () {
          const price = Number($(this).find('p.proc').attr('data-money'))
          const amount = Number($(this).find('p.proc').attr('data-amount'))
          const people = Number($(this).find('p.proc').attr('data-people'))
          let _, __
          switch (e) {
            case 'proceed':
              _ = price * amount
              __ = '￥' + formatNum(_)
              break
            case 'amount':
              _ = amount
              __ = formatNum(_) + '個'
              break
            case 'people':
              _ = people
              __ = formatNum(_) + '人'
              break
          }

          let percentage = _ / total
          percentage *= 10000
          percentage = Math.round(percentage)
          percentage = String(percentage)
          percentage = percentage.slice(0, -2) + '.' + percentage.slice(-2)
          if (percentage[0] === '.') {
            percentage = '0' + percentage
          }

          $(this).find('p.proc').text(__)
          $(this).find('p.percentage').text(percentage)
        })
      }

      $('input[name=set]').on('change', function () {
        showData(this)
      })
      showData(undefined, true)
    })
})

export { menuData, colors }
