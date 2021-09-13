//----- 支払方法選択 -----//
import $ from 'jquery'

import { anim } from './func'
import { data } from './menu'

window.addEventListener('DOMContentLoaded', () => {
  const $e = $('.container#method')

  // 現金支払い
  $e.find('button#cash').on('click', () => {
    void anim($e, '.container#cash')
    $('.container#cash p#sum').text(data.sum)
  })

  // KSS Pay支払い
  $e.find('button#pay').on('click', () => {
    void anim($e, '.container#pay')
    $('.container#pay p#sum').text(data.sum)
    alert(
      '読み込む前に、KSSPayユーザーに更新ボタンを押させてください。\n画面上部[：]->[更新]'
    )
  })
})
