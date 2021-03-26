const $ = require('jquery')
import { log, month } from './main'
var ws = {}

function scrollBtm() {
  const e = document.querySelector('main .chat .history')
  e.scrollTo(0, e.scrollHeight - e.clientHeight)
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('./data?mode=init')
    .then((r) => r.json())
    .then((j) => {
      for (let i = 0; i < j.length; i++) {
        const e = j[i]
        $('main div.list').append(
          `<div class="clsCont" data-cls=${e.ws}><p class="cls">${e.name}</p><p class="msg">0</p></div>`
        )

        const w = new WebSocket(
          `wss://${location.host}/ws/kss-chat-${e.ws.replace('-', '')}`
        )
        w.addEventListener('open', () => {
          log(`WebSocket${e.ws} Open`)
        })
        w.addEventListener('message', (k) => {
          log(`Message from ${e.ws} Received`)
          const _ = $(`main div.list .clsCont[data-cls="${e.ws}"]`)
          const __ = _.find('p.msg')
          __.text(Number(__.text()) + 1)
          if (_.hasClass('showing')) {
            __.text('')
            const d = new Date()
            let dateFormat = `${
              month[d.getMonth()]
            } ${d.getDate()} | ${d.getHours()}:${d.getMinutes()}`
            $('main div.chat div.history').append(
              `<div class="msgCont"><div class="rec"><p class="msg">${k.data}</p><p class="time">${dateFormat}</p></div></div>`
            )
            scrollBtm()
          }
        })
        w.addEventListener('close', () => {
          log(`WebSocket${e.ws} Close`)
        })
        w.addEventListener('error', () => {
          log(`WebSocket${e.ws} Error`)
        })

        ws[e.ws] = w
      }
    })
    .then(() => {
      $('.clsCont').on('click', function () {
        const cls = $(this).attr('data-cls')
        $('main div.list .clsCont.showing').find('p.msg').text('0')
        $('main div.list .clsCont.showing').removeClass('showing')
        $(this).addClass('showing')
        $('main .chat .history .msgCont').remove()
        $(this).find('p.msg').text('')
        fetch('./data?mode=data&id=' + cls)
          .then((r) => r.json())
          .then((j) => {
            for (let i = 0; i < j.length; i++) {
              const e = j[i]
              $('main div.chat div.history').append(
                `<div class="msgCont"><div class="${
                  e.sender === 'B' ? 'rec' : 'send'
                }"><p class="msg">${decodeURIComponent(
                  e.body
                )}</p><p class="time">${decodeURIComponent(
                  e.time
                )}</p></div></div>`
              )
            }
            scrollBtm()
          })
      })
    })
})

export { ws, scrollBtm }
