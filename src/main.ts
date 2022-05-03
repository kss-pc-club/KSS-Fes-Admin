//----- メインの処理 -----//

import 'bootstrap'
import './commonFilesLoad'
import './login'
import './style'

import { signOut } from 'firebase/auth'
import $ from 'jquery'

import { classInfo } from './classInfo'
import { auth, onClassInfoLoaded } from './firebase'
import { sleep } from './functions'

if (location.pathname === '/cashier/') {
  import('./cashier/main')
} else if (location.pathname === '/proceeds/') {
  import('./proceeds/main')
} else if (location.pathname === '/chat/') {
  import('./chat/main')
} else if (location.pathname === '/monitor/') {
  import('./monitor/main')
} else if (location.pathname === '/admin/chat/') {
  import('./admin/chat/main')
} else if (location.pathname === '/admin/pay_charge/') {
  import('./admin/pay_charge/main')
}
window.addEventListener('DOMContentLoaded', () => {
  onClassInfoLoaded(() => {
    $('header span#cls').text(classInfo.name)
  })

  if (location.pathname === '/') {
    document.querySelector('a#logout')?.addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) {
        signOut(auth).catch(console.error)
      }
    })
  }
  if (location.pathname === '/admin/') {
    document.querySelector('a#logout')?.addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) {
        signOut(auth).catch(console.error)
      }
    })
  }
})

window.addEventListener('load', async () => {
  await sleep(3000)
  // 読み込み終了したらメインコンテンツを表示&ローダーを消す
  $('header,main,footer').fadeIn(700)
  $('div.loader-container').fadeOut(700)
  await sleep(700)
  $('div.loader-container').remove()
})
