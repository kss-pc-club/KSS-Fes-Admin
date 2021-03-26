const $ = require('jquery')
import { anim, FetchPOST } from './func'
import { data } from './menu'

window.addEventListener('DOMContentLoaded', () => {
  $('.container#cash div.rec input').on('change', function () {
    const c = data.sum - Number($(this).val())
    $(this).parent('div.rec').next().find('input').val(Math.abs(c))
    if (c > 0) {
      $('.container#cash button').attr('disabled', 'disabled')
    } else {
      $('.container#cash button').removeAttr('disabled')
    }
    $(this)
      .parent('div.rec')
      .next()
      .find('p')
      .text(c <= 0 ? '円のおつり' : '円不足')
  })
  $('.container#cash button.material').on('click', function () {
    $(this).attr('disabled', 'disabled')
    FetchPOST('/pay/cashPay', {
      name: data.cls,
      list: data.list,
      sum: data.sum,
    })
      .then((r) => r.json())
      .then((j) => {
        console.log(j)
      })
    anim('.container#cash', '.container#ok')
  })
})
