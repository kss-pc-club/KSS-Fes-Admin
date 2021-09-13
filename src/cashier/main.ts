//----- メインの処理 -----//

import './cash'
import './method'
import './pay'

import $ from 'jquery'

import { anim } from './func'
import { data } from './menu'

window.addEventListener('load', () => {
  // 「次へ」ボタン
  $('.container button#next').on('click', function () {
    if (data.sum === 0) {
      alert('メニューを選択してください')
      return
    }
    void anim(
      $(this).parents('div.container'),
      `.container#${$(this).attr('data-next')!}`
    )
  })

  // 「前へ」ボタン
  $('.container button#prev').on('click', function () {
    void anim(
      $(this).parents('div.container'),
      `.container#${$(this).attr('data-next')!}`,
      false
    )
  })
})

// ブラウザ「戻る」ボタンを押したとき
window.onpopstate = (e) => {
  e.preventDefault()
  return false
}
