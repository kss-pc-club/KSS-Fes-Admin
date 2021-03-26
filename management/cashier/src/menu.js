const $ = require('jquery')

var data = {
  list: [],
  sum: 0,
  cls: '',
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('../clsdata.json', { credentials: 'same-origin' })
    .then((r) => r.json())
    .then((j) => {
      for (let i = 0; i < j.menus.length; i++) {
        const e = j.menus[i]
        const item = document.createElement('div')
        item.classList.add('item')
        item.setAttribute('data-itemNum', i)
        item.innerHTML = `<img src="/monitor/icons/${e.src}.png"><p class="name">${e.name}</p><p class="price">${e.price}</p><input type="number" name="amount" value="0" min="0"><p class="total">0</p>`
        document.querySelector('.container#menu').appendChild(item)
        data.list.push({ name: e.name, price: e.price, amount: 0 })
      }
    })
    .then(() => {
      $('.container#menu .item').each(function () {
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
