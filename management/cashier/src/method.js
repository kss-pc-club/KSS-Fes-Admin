const $ = require('jquery')
import { anim } from './func'
import { data } from './menu'

window.addEventListener('DOMContentLoaded', () => {
  const $e = $('.container#method')
  $e.find('div.select#cash').on('click', () => {
    anim($e, '.container#cash')
    $('.container#cash p#sum').text(data.sum)
  })
  $e.find('div.select#pay').on('click', () => {
    anim($e, '.container#pay')
    $('.container#pay p#sum').text(data.sum)
    alert(
      '読み込む前に、KSSPayユーザーに更新ボタンを押させてください。\n画面上部[：]->[更新]'
    )
  })
})
