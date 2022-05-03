//----- クラスのメニュー表示 -----//

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
      // メニューの内部divを構築
      const item = document.createElement('div')
      item.classList.add('item')
      item.setAttribute('data-itemNum', String(i))
      item.innerHTML = `<img src="https://monitor.festival.kss-pc.club/icons/${e.icon}.png"><p class="name">${e.name}</p><p class="price">${e.price}</p><input type="number" name="amount" value="0" min="0"><p class="total">0</p>`

      // メニュー追加
      document
        .querySelector('.container#menu .child-container')
        ?.appendChild(item)

      // データのほうにも追加
      data.list.push({ name: e.name, price: e.price, amount: 0 })
    }

    // メニューの個数が変更されたときの処理
    $('.container#menu .child-container .item').each(function () {
      $(this)
        .find('input')
        .on('change', function () {
          $(this)
            .next('p.total')
            .text(
              // 値段 × 個数
              Number($(this).prev('p.price').text()) * Number($(this).val())
            )

          // データリストのindex番号を取得し、個数を更新
          const i = Number($(this).parent('div.item').attr('data-itemNum'))
          data.list[i].amount = Number($(this).val())

          // 合計金額を更新
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
