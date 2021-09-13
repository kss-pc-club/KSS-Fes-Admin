//----- admin/pay_charge メインの処理 -----//

import $ from 'jquery'

import { classInfo } from '../../classInfo'
import { firebase, onClassInfoLoaded } from '../../firebase'
import { type_func_buyPay } from '../../type'

window.addEventListener('DOMContentLoaded', () => {
  onClassInfoLoaded(() => {
    // チャージするボタンがクリックされたとき
    $('button').on('click', () => {
      const $barcode = $('input[type=text]')
      const $chargeAmount = $('input[type=number]')
      const $btn = $('button')

      // チャージボタン・バーコード入力欄・チャージ金額入力欄を押せなくする
      $btn.attr('disabled', 'disabled')
      $barcode.attr('readonly', 'readonly')
      $chargeAmount.attr('readonly', 'readonly')

      // 管理者ではない場合、Topへ戻る
      if (!classInfo.admin) {
        alert('権限がありません')
        location.pathname = '/'
        return
      } else {
        // バーコードは13桁
        if (String($barcode.val()).length !== 13) {
          alert('バーコードの形式が正しくありません')
          $barcode.removeAttr('readonly')
          $chargeAmount.removeAttr('readonly')
          $btn.removeAttr('disabled')
        } else {
          // チャージ金額を取得
          const chargeAmount = Number($chargeAmount.val())

          // Cloud Functionsにリクエストを送信（Ref: /functions/src/index.ts）
          firebase
            .functions()
            .httpsCallable('chargePay')({
              barcode: String($barcode.val()),
              chargeAmount: chargeAmount,
              time: new Date(),
            })
            .then((result: { data: type_func_buyPay }) => {
              if (result.data.error) {
                // エラーを吐いた場合
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
                // エラーを吐かなかった
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
