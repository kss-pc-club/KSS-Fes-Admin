import $ from 'jquery'

import { classInfo } from '../classInfo'
import { firebase, ifClassInfoLoaded } from '../firebase'
import { type_chatAllData, type_chatSaveData } from '../type'
import { formatDate, scrollBtm } from './func'

window.addEventListener('DOMContentLoaded', () => {
  ifClassInfoLoaded(async () => {
    const chatDB = firebase.firestore().collection('chat').doc(classInfo.uid)

    const chatData = ((await chatDB.get()).data() as type_chatAllData).history
    chatData.sort((a, b) => a.time.seconds - b.time.seconds)
    $('main div.chat div.history').text('')
    for (let i = 0; i < chatData.length; i++) {
      const e = chatData[i]
      const time = e.time.toDate()
      const dateFormat = formatDate(time)
      $('main div.chat div.history').append(
        `<div class="msgCont"><div class="${
          e.fromAdmin ? 'rec' : 'send'
        }"><p class="msg">${
          e.message
        }</p><p class="time">${dateFormat}</p></div></div>`
      )
    }
    scrollBtm()

    const ws = new WebSocket(
      `wss://kss-pc-club-websocket.herokuapp.com/kss-admin-chat/${classInfo.uid}`
    )

    ws.addEventListener('message', (e) => {
      const d = new Date()
      const dateFormat = formatDate(d)

      $('main div.chat div.history').append(
        `<div class="msgCont"><div class="rec"><p class="msg">${String(
          e.data
        )}</p><p class="time">${dateFormat}</p></div></div>`
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

    const inputField = document.querySelector('.type')?.querySelector('input')
    let composing = false
    inputField?.addEventListener('compositionstart', () => (composing = true))
    inputField?.addEventListener('compositionend', () => (composing = false))
    inputField?.addEventListener('keyup', (ev) => {
      if (ev.key === 'Enter' && !composing) {
        $('.type button').trigger('click')
      }
    })
    $('.type button').on('click', async function () {
      if (!$('.type input').val()) {
        return
      }

      const msg = $('.type input').val()!.toString()
      const d = new Date()
      const dateFormat = formatDate(d)

      const saveData: type_chatSaveData = {
        fromAdmin: false,
        message: msg,
        time: firebase.firestore.Timestamp.fromDate(d),
      }

      await chatDB.update({
        lastUpdate: firebase.firestore.Timestamp.fromDate(d),
        history: firebase.firestore.FieldValue.arrayUnion(saveData),
      })
      $('main div.chat div.history').append(
        `<div class="msgCont"><div class="send"><p class="msg">${msg}</p><p class="time">${dateFormat}</p></div></div>`
      )
      ws.send(msg)
      scrollBtm()
      $('.type input').val('')
    })
  })
})
