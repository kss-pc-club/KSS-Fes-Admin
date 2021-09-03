import $ from 'jquery'

import { firebase, ifClassInfoLoaded } from '../../firebase'
import { type_chatAllData } from '../../type'
import { formatDate, log, scrollBtm } from './func'

const ws: { [key: string]: WebSocket } = {}

window.addEventListener('DOMContentLoaded', () => {
  log('DOMContent Loaded')
  ifClassInfoLoaded(async () => {
    log('ClassInfoLoaded')

    const chatDB = firebase.firestore().collection('chat')
    const allDocsData = await chatDB.get()
    console.log(allDocsData)
    allDocsData.forEach((doc) => {
      const saveData = doc.data() as type_chatAllData
      $('main div.list').append(
        `<div class="clsCont" data-cls=${doc.id}><p class="cls">${saveData.name}</p><p class="msg">0</p></div>`
      )

      const w = new WebSocket(
        `wss://kss-pc-club-websocket.herokuapp.com/kss-admin-chat/${doc.id}`
      )

      setInterval(() => {
        w.send('[Keeping Connection... Ignore this message...]')
      }, 30000)
      w.addEventListener('open', () => {
        log(`WebSocket for ${saveData.name} Open`)
      })
      w.addEventListener('message', (k) => {
        log(`Message from ${saveData.name} Received`)
        const list = $(`main div.list .clsCont[data-cls="${doc.id}"]`)
        const unreadNotify = list.find('p.msg')
        unreadNotify.text(Number(unreadNotify.text()) + 1)
        if (list.hasClass('showing')) {
          unreadNotify.text('')
          const d = new Date()
          const dateFormat = formatDate(d)
          $('main div.chat div.history').append(
            `<div class="msgCont"><div class="rec"><p class="msg">${String(
              k.data
            )}</p><p class="time">${dateFormat}</p></div></div>`
          )
          scrollBtm()
        }
      })
      w.addEventListener('close', () => {
        log(`WebSocket for ${saveData.name} Close`)
      })
      w.addEventListener('error', () => {
        log(`WebSocket for ${saveData.name} Error`)
      })

      ws[doc.id] = w
    })

    $('.clsCont').on('click', async function () {
      const cls = $(this).attr('data-cls')
      $('main div.list .clsCont.showing').find('p.msg').text('0')
      $('main div.list .clsCont.showing').removeClass('showing')
      $(this).addClass('showing')
      $('main .chat .history .msgCont').remove()
      $(this).find('p.msg').text('')
      const chatData = (await chatDB.doc(cls).get()).data() as type_chatAllData

      for (let i = 0; i < chatData.history.length; i++) {
        const e = chatData.history[i]
        const time = e.time.toDate()
        const dateFormat = formatDate(time)
        $('main div.chat div.history').append(
          `<div class="msgCont"><div class="${
            e.fromAdmin ? 'send' : 'rec'
          }"><p class="msg">${String(
            e.message
          )}</p><p class="time">${dateFormat}</p></div></div>`
        )
      }
      scrollBtm()
    })

    const inputField = document.querySelector('.type')?.querySelector('input')
    let composing = false
    inputField?.addEventListener('compositionstart', () => (composing = true))
    inputField?.addEventListener('compositionend', () => (composing = false))
    inputField?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' && !composing) {
        $('.type button').trigger('click')
      }
    })

    $('.type button').on('click', async function () {
      const id = $('.clsCont.showing').attr('data-cls')
      const body = $('.type input').val()!.toString()
      if (!body || !id) {
        return
      }
      const d = new Date()
      const dateFormat = formatDate(d)

      await chatDB.doc(id).update({
        lastUpdate: firebase.firestore.Timestamp.fromDate(d),
        history: firebase.firestore.FieldValue.arrayUnion({
          fromAdmin: true,
          message: body,
          time: firebase.firestore.Timestamp.fromDate(d),
        }),
      })

      $('main div.chat div.history').append(
        `<div class="msgCont"><div class="send"><p class="msg">${body}</p><p class="time">${dateFormat}</p></div></div>`
      )

      ws[id].send(body)
      scrollBtm()
      $('.type input').val('')
    })
  })
})
window.addEventListener('load', () => {
  log('Content Loaded')
})
