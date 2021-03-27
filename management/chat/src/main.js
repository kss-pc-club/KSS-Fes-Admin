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
    `wss://kss-pc-club-websocket.herokuapp.com/kss-admin-chat/${cls}`
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

  setInterval(() => {
    ws.send('[Keeping Connection... Ignore this message...]')
  }, 30000)

  ws.addEventListener('close', () => {
    alert('接続が切断されました。「OK」を押すと再読み込みします。')
    location.reload()
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
    let dateFormat = `${month[d.getMonth()]} ${d.getDate()} | ${String(
      d.getHours()
    ).padEnd(2, '0')}:${String(d.getMinutes()).padEnd(2, '0')}`
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
