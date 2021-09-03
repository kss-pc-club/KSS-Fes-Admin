//----- メインの処理 -----//

import 'bootstrap'
import './commonFilesLoad'
import './login'
import './style'

import $ from 'jquery'

import { classInfo } from './classInfo'
import { firebase, ifClassInfoLoaded } from './firebase'
import { sleep } from './functions'

if (location.pathname === '/cashier/') {
  import('./cashier/main')
} else if (location.pathname === '/proceeds/') {
  import('./proceeds/main')
} else if (location.pathname === '/chat/') {
  import('./chat/main')
} else if (location.pathname === '/admin/chat/') {
  import('./admin/chat/main')
}

window.addEventListener('DOMContentLoaded', () => {
  ifClassInfoLoaded(() => {
    $('header span#cls').text(classInfo.name)
  })

  if (location.pathname === '/') {
    document.querySelector('a#logout')?.addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) {
        firebase.auth().signOut().catch(console.error)
      }
    })
  }
})

window.addEventListener('load', async () => {
  await sleep(1000)

  // 読み込み終了したらメインコンテンツを表示&ローダーを消す
  $('header,main,footer').fadeIn(700)
  $('div.loader_container').fadeOut(700)
  await sleep(700)
  $('div.loader_container').remove()
})
