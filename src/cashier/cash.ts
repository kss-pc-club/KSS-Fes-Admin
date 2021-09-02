import $ from 'jquery'

import { classInfo } from '../classInfo'
import { anim, RecordPayment } from './func'
import { data } from './menu'

window.addEventListener('DOMContentLoaded', () => {
  $('.container#cash div.rec input').on('change', function () {
    const c = data.sum - Number($(this).val())
    $(this).parent('div.rec').next().find('input').val(Math.abs(c))
    if (c > 0) {
      $('.container#cash .childContainer button').attr('disabled', 'disabled')
    } else {
      $('.container#cash .childContainer button').removeAttr('disabled')
    }
    $(this)
      .parent('div.rec')
      .next()
      .find('span')
      .text(c <= 0 ? '円のおつり' : '円不足')
  })
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
