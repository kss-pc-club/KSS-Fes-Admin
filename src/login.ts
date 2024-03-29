//----- ログインの処理 -----//

import { Toast } from 'bootstrap'
import { signInWithEmailAndPassword } from 'firebase/auth'
import $ from 'jquery'

import { auth } from './firebase'

window.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/login') {
    // Toast要素の初期化
    // Ref: https://getbootstrap.jp/docs/5.0/components/toasts/#javascript-behavior
    const toastElem = [].slice
      .call(document.querySelectorAll('.toast'))
      .map(
        (e) => new Toast(e, { animation: true, autohide: true, delay: 3000 })
      )[0]

    // 送信時にログイン処理をする
    $('form').on('submit', function (e) {
      e.preventDefault()
      $('form button').attr('disabled', 'disabled')
      const email = $('#inputEmail').val() as string
      const pass = $('#inputPassword').val() as string
      signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
          // ログイン成功時（勝手に /index.html に飛ばされる）
        })
        .catch((err) => {
          // ログイン失敗時、Toast要素を表示して失敗したことを伝える
          console.error(err)
          $('.toast').removeClass('visually-hidden')
          toastElem.show()
          $('form button').removeAttr('disabled')
        })
    })
  }
})
