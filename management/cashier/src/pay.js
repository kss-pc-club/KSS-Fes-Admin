const $ = require('jquery')
import { anim, FetchPOST } from './func'
import { data } from './menu'

window.addEventListener('DOMContentLoaded', () => {
  $('.container#pay div.material input').on('change', function () {
    $('.container#pay button.material').attr('disabled', 'disabled')
    const e = $('.container#pay div.material input')
    if (e.val().length > 13) {
      e.val(e.val().slice(13))
    }
    if (e.val().length === 13) {
      FetchPOST('/pay/checkMoney', {
        barcode: e.val(),
        cost: data.sum,
        cls: data.cls,
        items: data.list,
      })
        .then((r) => r.json())
        .then(async (j) => {
          console.log(j)
          if (!j.canBuy) {
            alert(
              '残金が足りず、支払うことができませんでした。現金で支払ってください。'
            )
            return
          }
          FetchPOST('/pay/recordPay', {
            name: data.cls,
            list: data.list,
            barcode: e.val(),
            sum: data.sum,
          })
          anim('.container#pay', '.container#ok')
        })
    }
  })
})
