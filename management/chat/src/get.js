const $ = require('jquery')

function scrollBtm() {
  const e = document.querySelector('main .chat .history')
  e.scrollTo(0, e.scrollHeight - e.clientHeight)
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('./data/get', { credentials: 'same-origin' })
    .then((r) => r.json())
    .then((j) => {
      for (let i = 0; i < j.length; i++) {
        const e = j[i]
        $('main div.chat div.history').append(
          `<div class="msgCont"><div class="${
            e.sender === 'A' ? 'rec' : 'send'
          }"><p class="msg">${decodeURIComponent(
            e.body
          )}</p><p class="time">${decodeURIComponent(e.time)}</p></div></div>`
        )
      }
      scrollBtm()
    })
})

export { scrollBtm }
