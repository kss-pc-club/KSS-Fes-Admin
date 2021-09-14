//----- admin/chat メインの処理 -----//

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import $ from 'jquery'

import { db, onClassInfoLoaded } from '../../firebase'
import { type_chatAllData } from '../../type'
import { formatDate, log, scrollBtm } from './func'

// クラスごとのWebSocketを保管する場所
const ws: { [key: string]: WebSocket } = {}

window.addEventListener('DOMContentLoaded', () => {
  log('DOMContent Loaded')
  onClassInfoLoaded(async () => {
    log('ClassInfoLoaded')

    // 初期化
    const allDocsData = await getDocs(collection(db, 'chat'))
    allDocsData.forEach((doc) => {
      const saveData = doc.data() as type_chatAllData

      // クラスを表示する
      $('main div.list').append(
        `<div class="clsCont" data-cls=${doc.id}><p class="cls">${saveData.name}</p><p class="msg">0</p></div>`
      )

      // WebSocket初期化
      const w = new WebSocket(
        `wss://kss-pc-club-websocket.herokuapp.com/kss-admin-chat/${doc.id}`
      )

      // 接続をつなげたままにするために、30秒ごとにこのメッセージを送る
      // サーバー側で処理されるので相手には届かない（Ref: https://github.com/kss-pc-club/websocket/blob/main/server.js#L31）
      setInterval(() => {
        w.send('[Keeping Connection... Ignore this message...]')
      }, 30000)

      // WebSocketがつながったとき
      w.addEventListener('open', () => {
        log(`WebSocket for ${saveData.name} Open`)
      })

      // メッセージを受け取ったとき
      w.addEventListener('message', (k) => {
        log(`Message from ${saveData.name} Received`)

        // 「読んでない」通知を+1する
        const list = $(`main div.list .clsCont[data-cls="${doc.id}"]`)
        const unreadNotify = list.find('p.msg')
        unreadNotify.text(Number(unreadNotify.text()) + 1)
        if (list.hasClass('showing')) {
          // すでにクラスを表示していた場合、メッセージを追加
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

      // WebSocket切断
      w.addEventListener('close', () => {
        log(`WebSocket for ${saveData.name} Close`)
      })

      // WebSocketエラー
      w.addEventListener('error', () => {
        log(`WebSocket for ${saveData.name} Error`)
      })

      // WebSocketのデータを保管する
      ws[doc.id] = w
    })

    // クラスリストのクラスをクリックしたとき
    $('.clsCont').on('click', async function () {
      const cls = String($(this).attr('data-cls'))

      // すでに表示されているものを非表示にする
      $('main div.list .clsCont.showing').find('p.msg').text('0')
      $('main div.list .clsCont.showing').removeClass('showing')

      // クリックされたものを表示する
      $(this).addClass('showing')
      $('main .chat .history .msgCont').remove()
      $(this).find('p.msg').text('')

      // チャットのデータを読み込み、表示する
      const chatData = (
        await getDoc(doc(db, 'chat', cls))
      ).data() as type_chatAllData
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

    // 日本語入力の変換時にEnter押しても送信しないが、変換終了後にEnterしたら送信する処理
    const inputField = document.querySelector('.type')?.querySelector('input')
    let composing = false
    inputField?.addEventListener('compositionstart', () => (composing = true))
    inputField?.addEventListener('compositionend', () => (composing = false))
    inputField?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' && !composing) {
        $('.type button').trigger('click')
      }
    })

    // 送信ボタンがクリックされたとき
    $('.type button').on('click', async function () {
      // クラス情報を取得
      const id = $('.clsCont.showing').attr('data-cls')
      const body = String($('.type input').val())
      if (!body || !id) {
        return
      }
      const d = new Date()
      const dateFormat = formatDate(d)

      // データベースを更新
      await updateDoc(doc(db, 'chat', id), {
        lastUpdate: Timestamp.fromDate(d),
        history: arrayUnion({
          fromAdmin: true,
          message: body,
          time: Timestamp.fromDate(d),
        }),
      })

      // チャット履歴に追加
      $('main div.chat div.history').append(
        `<div class="msgCont"><div class="send"><p class="msg">${body}</p><p class="time">${dateFormat}</p></div></div>`
      )

      // WebSocketで送信
      ws[id].send(body)
      scrollBtm()
      $('.type input').val('')
    })
  })
})
window.addEventListener('load', () => {
  log('Content Loaded')
})
