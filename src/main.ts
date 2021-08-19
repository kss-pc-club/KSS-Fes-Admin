import 'bootstrap'
import './commonFilesLoad'
import './login'

import { firebase } from './firebase'

window.addEventListener('DOMContentLoaded', () => {
  if (location.pathname !== '/login') {
    document.querySelector('a#logout')?.addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) {
        firebase.auth().signOut().catch(console.error)
      }
    })
  }
})
