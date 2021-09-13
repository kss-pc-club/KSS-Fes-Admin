//----- レジシステム、現金支払いの処理 -----//

import $ from 'jquery'

import { classInfo } from '../classInfo'
import { anim, RecordPayment } from './func'
import { data } from './menu'

window.addEventListener('DOMContentLoaded', () => {
  // 受取金額の更新時
  $('.container#cash div.rec input').on('input', function () {
    // c = 合計支払金額 - 受取金額
    const c = data.sum - Number($(this).val())
    $(this).parent('div.rec').next().find('input').val(Math.abs(c))
    if (c <= 0) {
      $('.container#cash .childContainer button').removeAttr('disabled')
    } else {
      $('.container#cash .childContainer button').attr('disabled', 'disabled')
    }
    $(this)
      .parent('div.rec')
      .next()
      .find('span')
      .text(c <= 0 ? '円のおつり' : '円不足')
  })

  // 決済保存ボタン
  $('.container#cash .childContainer button').on('click', async function () {
    $(this).attr('disabled', 'disabled')
    await RecordPayment({
      isPay: false,
      payAt: classInfo.name,
      payId: null,
      sum: data.sum,
      time: new Date(),
      list: data.list,
    })
    void anim('.container#cash', '.container#ok')
  })
})
