//----- メインの処理 -----//

import 'bootstrap'
import './commonFilesLoad'
import './login'
import './style'

import $ from 'jquery'

import { firebase } from './firebase'
import { sleep } from './functions'

window.addEventListener('DOMContentLoaded', () => {
  if (location.pathname !== '/login') {
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
