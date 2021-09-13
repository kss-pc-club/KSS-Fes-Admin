import $ from 'jquery'

import { classInfo } from '../../classInfo'
import { firebase, onClassInfoLoaded } from '../../firebase'
import { type_func_buyPay } from '../../type'

window.addEventListener('DOMContentLoaded', () => {
  onClassInfoLoaded(() => {
    $('button').on('click', () => {
      const $barcode = $('input[type=text]')
      const $chargeAmount = $('input[type=number]')
      const $btn = $('button')

      $btn.attr('disabled', 'disabled')
      $barcode.attr('readonly', 'readonly')
      $chargeAmount.attr('readonly', 'readonly')

      if (!classInfo.admin) {
        alert('権限がありません')
        location.pathname = '/'
        return
      } else {
        if (String($barcode.val()).length !== 13) {
          alert('バーコードの形式が正しくありません')
        } else {
          const chargeAmount = Number($chargeAmount.val())
          firebase
            .functions()
            .httpsCallable('chargePay')({
              barcode: String($barcode.val()),
              chargeAmount: chargeAmount,
              time: new Date(),
            })
            .then((result: { data: type_func_buyPay }) => {
              if (result.data.error) {
                switch (result.data.message) {
                  case 'invalid request':
                    alert('リクエストが無効です')
                    break
                  case 'user not exist':
                  case 'multiple users':
                    alert('バーコードを再読み込みさせてください')
                    break
                }
                $barcode.removeAttr('readonly').val('')
                $chargeAmount.removeAttr('readonly')
                $btn.removeAttr('disabled')
                return
              } else {
                alert('チャージしました')
                $barcode.removeAttr('readonly').val('')
                $chargeAmount.removeAttr('readonly').val('')
                $btn.removeAttr('disabled')
              }
            })
            .catch(console.error)
        }
      }
    })
  })
})
