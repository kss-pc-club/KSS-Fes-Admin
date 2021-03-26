import './cash'
import './method'
import './pay'

import { anim } from './func'
import { data } from './menu'
const $ = require('jquery')

window.addEventListener('DOMContentLoaded', () => {
  const cls = document.cookie
    .split('; ')
    .filter((t) => t.split('=')[0] === 'id')[0]
    .split('=')[1]
  if (!cls) {
    location.href = '../'
  }
  $('header p#cls').text(cls)
  data.cls = cls
})
window.addEventListener('load', () => {
  $('.container button#next').on('click', function () {
    if (data.sum === 0) {
      alert('メニューを選択してください')
      return
    }
    anim(
      $(this).parents('div.container'),
      '.container#' + $(this).attr('data-next')
    )
  })
  $('.container button#prev').on('click', function () {
    anim(
      $(this).parents('div.container'),
      '.container#' + $(this).attr('data-next'),
      false
    )
  })
})

window.addEventListener('popstate', (e) => {
  e.preventDefault()
  return false
})
