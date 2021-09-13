//----- KSS Payでの支払い処理 -----//
import $ from 'jquery'

import { classInfo } from '../classInfo'
import { firebase } from '../firebase'
import { type_func_buyPay, type_func_readPay } from '../type'
import { anim, RecordPayment } from './func'
import { data } from './menu'

window.addEventListener('DOMContentLoaded', () => {
  // 「決済」ボタン
  $('.container#pay .childContainer button').on('click', function () {
    // ボタンを無効化
    $('.container#pay .childContainer button').attr('disabled', 'disabled')
    const e = $('.container#pay input')

    // 入力されたバーコードが13文字ではないならreturn
    if (String(e.val()).length !== 13) {
      alert('バーコードの形式が正しくないようです。再読み込みしてください。')
      $('.container#pay .childContainer button').removeAttr('disabled')
      return
    }

    // ReadPayを呼び出し（Ref: /functions/src/index.ts）
    firebase
      .functions()
      .httpsCallable('readPay')({
        barcode: e.val(),
        cost: data.sum,
      })
      .then(async (result: { data: type_func_readPay }) => {
        // エラーを吐いたとき
        if (result.data.error) {
          $('.container#pay .childContainer button').removeAttr('disabled')
          switch (result.data.message) {
            case 'not logged in':
              alert('ログインしていないようです。再度ログインしてください。')
              break
            case 'user not exist':
            case 'multiple users':
              alert('「更新」ボタンを押すようにお願いしてください。')
              break
            case 'cannot buy':
              alert(
                '現金が足りず、支払うことができません。現金で支払ってください。'
              )
              void anim('.container#pay', '.container#cash')
              break
            case 'invalid request':
              alert(
                'メニューの設定に間違いがあるようです。メニュー選択に戻って設定しなおしてください。'
              )
              void anim('.container#pay', '.container#menu', false)
              break
          }
          $('.container#pay .childContainer button').removeAttr('disabled')
        } else {
          // エラーをはかなかった場合
          const userId = result.data.uid!
          const time = new Date()
          await RecordPayment({
            isPay: true,
            payAt: classInfo.name,
            payId: userId,
            sum: data.sum,
            time: time,
            list: data.list,
          })

          firebase
            .functions()
            .httpsCallable('buyPay')({
              name: classInfo.name,
              items: data.list,
              uid: userId,
              cost: data.sum,
              time: time,
            })
            .then((result: { data: type_func_buyPay }) => {
              if (result.data.error) {
                $('.container#pay .childContainer button').removeAttr(
                  'disabled'
                )
                alert('何か問題が発生したようです。もう一度お試しください。')
              } else {
                void anim('.container#pay', '.container#ok')
              }
            })
            .catch(console.error)
        }
      })
      .catch(console.error)
  })
})
