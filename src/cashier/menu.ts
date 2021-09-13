import $ from 'jquery'

import { classInfo } from '../classInfo'
import { onClassInfoLoaded } from '../firebase'
import { type_boughtList } from '../type'

const data = {
  sum: 0,
  list: [] as type_boughtList[],
}

window.addEventListener('DOMContentLoaded', () => {
  onClassInfoLoaded(() => {
    for (let i = 0; i < classInfo.menus.length; i++) {
      const e = classInfo.menus[i]
      const item = document.createElement('div')
      item.classList.add('item')
      item.setAttribute('data-itemNum', String(i))
      item.innerHTML = `<img src="https://monitor.festival.kss-pc.club/icons/${e.icon}.png"><p class="name">${e.name}</p><p class="price">${e.price}</p><input type="number" name="amount" value="0" min="0"><p class="total">0</p>`
      document
        .querySelector('.container#menu .childContainer')
        ?.appendChild(item)
      console.log(item)
      data.list.push({ name: e.name, price: e.price, amount: 0 })
    }

    $('.container#menu .childContainer .item').each(function () {
      $(this)
        .find('input')
        .on('change', function () {
          $(this)
            .next('p.total')
            .text(
              Number($(this).prev('p.price').text()) * Number($(this).val())
            )
          const i = Number($(this).parent('div.item').attr('data-itemNum'))
          data.list[i].amount = Number($(this).val())

          let sum = 0
          $('.container#menu .item .total').each(function () {
            sum += Number($(this).text())
          })
          $('.container#menu footer p.sum').text(sum)
          data.sum = sum
        })
    })
  })
})

export { data }
