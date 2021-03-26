const $ = require('jquery')
import { scrollBtm } from './get'

window.addEventListener('DOMContentLoaded', () => {
  const cls = document.cookie
    .split('; ')
    .filter((t) => t.split('=')[0] === 'id')[0]
    .split('=')[1]
  if (!cls) {
    location.href = '../'
  }
  $('main .logo p span.cls').text(cls)

  const ws = new WebSocket(
    `wss://${location.host}/ws/kss-chat-${cls.replace('-', '')}`
  )

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

  ws.addEventListener('message', (e) => {
    const d = new Date()
    let dateFormat = `${
      month[d.getMonth()]
    } ${d.getDate()} | ${d.getHours()}:${d.getMinutes()}`

    $('main div.chat div.history').append(
      `<div class="msgCont"><div class="rec"><p class="msg">${e.data}</p><p class="time">${dateFormat}</p></div></div>`
    )
    scrollBtm()
  })

  document.querySelector('.type input').addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      $('.type button').trigger('click')
    }
  })
  $('.type button').on('click', function () {
    if (!$('.type input').val()) {
      return
    }
    const body = $('.type input').val()
    let data = 'B '
    const d = new Date()
    let dateFormat = `${
      month[d.getMonth()]
    } ${d.getDate()} | ${d.getHours()}:${d.getMinutes()}`
    data += encodeURIComponent(`${dateFormat}`) + ' ' + encodeURIComponent(body)

    fetch('./data/write', {
      method: 'POST',
      body: JSON.stringify({ data: data }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    })
      .then((r) => r.json())
      .then((j) => {
        console.log(j)
        $('main div.chat div.history').append(
          `<div class="msgCont"><div class="send"><p class="msg">${body}</p><p class="time">${dateFormat}</p></div></div>`
        )
        ws.send(body)
        scrollBtm()
      })

    $('.type input').val('')
  })
})
