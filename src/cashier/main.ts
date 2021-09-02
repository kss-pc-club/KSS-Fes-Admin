import './cash'
import './method'
import './pay'

import $ from 'jquery'

import { anim } from './func'
import { data } from './menu'

window.addEventListener('load', () => {
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
  $('.container button#prev').on('click', function () {
    void anim(
      $(this).parents('div.container'),
      `.container#${$(this).attr('data-next')!}`,
      false
    )
  })
})

window.addEventListener('popstate', (e) => {
  e.preventDefault()
  return false
})
