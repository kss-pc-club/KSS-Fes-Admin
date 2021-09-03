import $ from 'jquery'

import { formatDate, month, scrollBtm } from '../../chat/func'
function log(msg: string) {
  const date = new Date()
  $('div.log').prepend(
    `<p>[${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(
      date.getMilliseconds()
    ).padStart(3, '0')}]<br>${msg}</p>`
  )
}

export { scrollBtm, month, formatDate, log }
