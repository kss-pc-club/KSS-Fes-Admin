//----- メニューのデータ更新 -----//

import { doc, getDoc } from 'firebase/firestore'
import $ from 'jquery'

import { classInfo } from '../classInfo'
import { db, onClassInfoChanged } from '../firebase'
import { type_classProceeds } from '../type'
import { ChartFirstDraw } from './chart'

const menuData = {
  name: [] as string[],
  amount: [] as number[],
  proceeds: [] as number[],
  customers: [] as number[],
}
const colors = ['#7e40f2', '#b4f240', '#405af2', '#f240b4', '#f27e40']

window.addEventListener('DOMContentLoaded', () => {
  let isFirstLoad = true
  onClassInfoChanged(async () => {
    // データベースからデータを読み込む
    const data = (
      await getDoc(doc(db, 'class_proceeds', classInfo.uid))
    ).data() as type_classProceeds

    const total = {
      amount: 0,
      proceeds: 0,
      customers: 0,
    }
    menuData.name.splice(0)
    menuData.amount.splice(0)
    menuData.proceeds.splice(0)
    menuData.customers.splice(0)

    // 画面の情報を更新する
    $('p#name').text(`${classInfo.name} ${classInfo.shop_name}`)
    $('p#total').text(Number(data.total).toLocaleString())
    $('div.items').children().remove()
    for (let i = 0; i < data.menus.length; i++) {
      const e = classInfo.menus[i]
      $('div.items').append(`
        <div class="item">
          <div class="color" style="background-color: ${colors[i]};"></div>
          <img src="https://monitor.festival.kss-pc.club/icons/${
            e.icon
          }.png" class="icon">
          <p class="name">${e.name}</p>
          <p class="proc" data-proceeds="${e.amount * e.price}" data-amount="${
        e.amount
      }" data-customers="${e.customers}"></p>
          <p class="percentage"></p>
        </div>
      `)
      menuData.name.push(e.name)
      menuData.amount.push(e.amount)
      menuData.proceeds.push(e.amount * e.price)
      menuData.customers.push(e.customers)

      total.amount += e.amount
      total.proceeds += e.amount * e.price
      total.customers += e.customers
    }
    for (const k in total) {
      if (total.hasOwnProperty(k)) {
        $('p#total').attr(`data-${k}`, (total as { [key: string]: number })[k])
      }
    }

    /**
     * 選択されているデータセットを表示します
     */
    const showData = () => {
      const e = $('input[name=set]:checked').val()
      const total = Number($('p#total').attr(`data-${String(e)}`))

      $('div.item').each(function () {
        const proceeds = Number($(this).find('p.proc').attr('data-proceeds'))
        const amount = Number($(this).find('p.proc').attr('data-amount'))
        const customers = Number($(this).find('p.proc').attr('data-customers'))
        let dataNum = 0,
          dataNum_str = ''
        switch (e) {
          case 'proceeds':
            dataNum = proceeds
            dataNum_str = '￥' + dataNum.toLocaleString()
            break
          case 'amount':
            dataNum = amount
            dataNum_str = dataNum.toLocaleString() + '個'
            break
          case 'customers':
            dataNum = customers
            dataNum_str = dataNum.toLocaleString() + '人'
            break
        }

        const percentage = ((dataNum / total) * 100).toFixed(2)
        $(this).find('p.proc').text(dataNum_str)
        $(this).find('p.percentage').text(percentage)
      })
    }

    $('input[name=set]').on('change', showData)
    showData()
    if (isFirstLoad) {
      isFirstLoad = false
      ChartFirstDraw()
    }
  })
})

export { menuData, colors }
