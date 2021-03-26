import './chart'
import './dataGet'

import { formatNum } from './func'
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
})

window.onpopstate = (e) => {
  e.preventDefault()
  return false
}

window.oncontextmenu = () => false

window.format = formatNum
