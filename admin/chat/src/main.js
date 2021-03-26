import { scrollBtm, ws } from './get'
const $ = require('jquery')

function log(msg) {
  const date = new Date()
  $('div.log').prepend(
    `<p>[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}]<br>${msg}</p>`
  )
}
const month = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

window.addEventListener('DOMContentLoaded', () => {
  log('DOMContent Loaded')
  document.querySelector('.type input').addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      $('.type button').trigger('click')
    }
  })
  $('.type button').on('click', function () {
    if (!$('.type input').val()) {
      return
    }
    const id = $('.clsCont.showing').attr('data-cls')
    const body = $('.type input').val()
    let data = 'A '
    const d = new Date()
    let dateFormat = `${
      month[d.getMonth()]
    } ${d.getDate()} | ${d.getHours()}:${d.getMinutes()}`
    data += encodeURIComponent(`${dateFormat}`)
    data += ' '
    data += body

    fetch('./write', {
      method: 'POST',
      body: JSON.stringify({ data: data, id: id }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    })
      .then((r) => r.json())
      .then((j) => {
        console.log(j)
        $('main div.chat div.history').append(
          `<div class="msgCont"><div class="send"><p class="msg">${body}</p><p class="time">${dateFormat}</p></div></div>`
        )
        scrollBtm()
        ws[id].send(body)
        msg(`Sent Message to ${id}`)
      })

    $('.type input').val('')
  })
})
window.addEventListener('load', () => {
  log('Content Loaded')
})

export { log, month }
