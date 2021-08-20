import { Toast } from 'bootstrap'
import $ from 'jquery'

import { firebase } from './firebase'

window.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/login') {
    const toastElem = [].slice
      .call(document.querySelectorAll('.toast'))
      .map(
        (e) => new Toast(e, { animation: true, autohide: true, delay: 3000 })
      )[0]
    $('form').on('submit', function (e) {
      e.preventDefault()
      $('form button').attr('disabled', 'disabled')
      const email = $('#inputEmail').val() as string
      const pass = $('#inputPassword').val() as string
      firebase
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then((cred) => {
          console.log(cred)
        })
        .catch((err) => {
          console.error(err)
          $('.toast').removeClass('visually-hidden')
          toastElem.show()
          $('form button').removeAttr('disabled')
        })
    })
  }
})
