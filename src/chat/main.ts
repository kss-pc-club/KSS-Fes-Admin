//----- チャットシステムの処理 -----//

import $ from 'jquery'

import { classInfo } from '../classInfo'
import { firebase, onClassInfoLoaded } from '../firebase'
import { type_chatAllData, type_chatSaveData } from '../type'
import { formatDate, scrollBtm } from './func'

window.addEventListener('DOMContentLoaded', () => {
  onClassInfoLoaded(async () => {
    // データベースから履歴を読み込む
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

    // WebSocketに接続
    const ws = new WebSocket(
      `wss://kss-pc-club-websocket.herokuapp.com/kss-admin-chat/${classInfo.uid}`
    )

    // メッセージを受け取ったとき
    ws.addEventListener('message', (e) => {
      const d = new Date()
      const dateFormat = formatDate(d)

      // チャットの履歴に追加
      $('main div.chat div.history').append(
        `<div class="msgCont"><div class="rec"><p class="msg">${String(
          e.data
        )}</p><p class="time">${dateFormat}</p></div></div>`
      )
      scrollBtm()
    })

    // 接続をつなげたままにするために、30秒ごとにこのメッセージを送る
    // サーバー側で処理されるので相手には届かない（Ref: https://github.com/kss-pc-club/websocket/blob/main/server.js#L31）
    setInterval(() => {
      ws.send('[Keeping Connection... Ignore this message...]')
    }, 30000)

    // WebSocketが切断されたとき、再読み込みする
    ws.addEventListener('close', () => {
      alert('接続が切断されました。「OK」を押すと再読み込みします。')
      location.reload()
    })

    // 日本語入力の変換時にEnter押しても送信しないが、変換終了後にEnterしたら送信する処理
    const inputField = document.querySelector('.type')?.querySelector('input')
    let composing = false
    inputField?.addEventListener('compositionstart', () => (composing = true))
    inputField?.addEventListener('compositionend', () => (composing = false))
    inputField?.addEventListener('keyup', (ev) => {
      if (ev.key === 'Enter' && !composing) {
        $('.type button').trigger('click')
      }
    })

    // 送信ボタンを押したときの処理
    $('.type button').on('click', async function () {
      if (!$('.type input').val()) {
        return
      }

      const msg = String($('.type input').val())
      const d = new Date()
      const dateFormat = formatDate(d)

      const saveData: type_chatSaveData = {
        fromAdmin: false,
        message: msg,
        time: firebase.firestore.Timestamp.fromDate(d),
      }

      // データベースを更新
      await chatDB.update({
        lastUpdate: firebase.firestore.Timestamp.fromDate(d),
        history: firebase.firestore.FieldValue.arrayUnion(saveData),
      })

      // チャット履歴に追加
      $('main div.chat div.history').append(
        `<div class="msgCont"><div class="send"><p class="msg">${msg}</p><p class="time">${dateFormat}</p></div></div>`
      )

      // WebSocketで送信
      ws.send(msg)
      scrollBtm()
      $('.type input').val('')
    })
  })
})
