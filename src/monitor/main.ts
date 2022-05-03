//----- メインの処理 -----//

import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import $ from 'jquery'

import { classInfo } from '../classInfo'
import { db, onClassInfoChanged, onClassInfoLoaded } from '../firebase'
import {
  type_FestivalDuration,
  type_FestivalDuration_date,
  type_menu,
} from '../type'
import { itemElem, previewItemElem } from './itemsMenu'

window.addEventListener('DOMContentLoaded', () => {
  // メニューの変更と文化祭の開始・終了時刻をここに保管しておく
  let menu_changes: type_menu[] = []
  const festival_duration: type_FestivalDuration_date = {
    start: new Date(),
    end: new Date(),
  }

  // 文化祭の開始・終了時刻を取得し、変更があれば自動で更新
  onSnapshot(doc(db, 'festival_duration', 'time'), (snapshot) => {
    const data = snapshot.data() as type_FestivalDuration
    festival_duration.start = data.start.toDate()
    festival_duration.end = data.end.toDate()
  })

  /**
   * 今は文化祭が始まる前か返します
   */
  const isNowFestivalBefore = () => {
    const d = new Date()
    return festival_duration.start > d
  }

  /**
   * 待ち時間モニターのプレビューを表示します
   */
  const generatePreview = () => {
    $('.previewsection p.cls').text(classInfo.name)
    $('.previewsection p.shop').text(classInfo.shop_name)
    $('.previewsection p.time').text(classInfo.time)
    $('.previewsection .iconContainer .icons').attr(
      'data-num',
      menu_changes.length
    )
    $('.previewsection .iconContainer .icons').children().remove()
    for (let i = 0; i < menu_changes.length; i++) {
      $('.previewsection .iconContainer .icons').append(
        previewItemElem(menu_changes[i], classInfo.isFood)
      )
    }
  }

  /**
   * メニュー項目が変更されたかどうかのEventListenerを加えます
   */
  const ItemsAddEventListeners = () => {
    // アイコン変更
    $('.itemsContainer .input-group .dropdown-icon li a')
      .off('click') // 一度EventListenerを解除しないと、ItemsAddEventListeners関数がまた呼び出された際に二重で以下の処理が行われてしまう
      .on('click', function () {
        // 文化祭が始まる前のみ変更可能
        if (!isNowFestivalBefore()) {
          alert('アイコンの変更は文化祭開始前のみ可能です。')
          return
        }

        const iconName = String($(this).attr('data-icon'))
        const idx = Number($(this).parents('.input-group').attr('data-idx'))
        $(this)
          .parents('.input-group')
          .children('button#iconSelect')
          .html(
            `アイコン <img src="https://monitor.festival.kss-pc.club/icons/${iconName}.png">`
          )
        menu_changes[idx].icon = iconName
        generatePreview()
      })

    // 商品名変更
    $('.itemsContainer .input-group input[type=text]')
      .off('change')
      .on('change', function () {
        // 文化祭が始まる前のみ変更可能
        if (!isNowFestivalBefore()) {
          alert('商品名の変更は文化祭開始前のみ可能です。')
          return
        }

        const idx = Number($(this).parents('.input-group').attr('data-idx'))
        menu_changes[idx].name = String($(this).val())
      })

    // 値段変更
    $('.itemsContainer .input-group input[type=number]')
      .off('change')
      .on('change', function () {
        // 文化祭が始まる前のみ変更可能
        if (!isNowFestivalBefore()) {
          alert('値段の変更は文化祭開始前のみ可能です。')
          return
        }

        const idx = Number($(this).parents('.input-group').attr('data-idx'))
        menu_changes[idx].price = Number($(this).val())
      })

    // ステータス変更
    $('.itemsContainer .input-group .dropdown-status li a')
      .off('click')
      .on('click', function () {
        const status = Number($(this).attr('data-statusId'))
        const idx = Number($(this).parents('.input-group').attr('data-idx'))
        const statusColor = ['green', 'yellow', 'red']
        $(this)
          .parents('.input-group')
          .children('button#statusSelect')
          .html(
            `ステータス <span class="circle ${statusColor[status]}-circle"></span>`
          )
        menu_changes[idx].status = status
        generatePreview()
      })

    // メニュー削除
    $('.itemsContainer .input-group button#removeItem')
      .off('click')
      .on('click', function () {
        // 文化祭が始まる前のみ変更可能
        if (!isNowFestivalBefore()) {
          alert('削除は文化祭開始前のみ可能です。')
          return
        }

        if (confirm('削除しますか？')) {
          const idx = Number($(this).parents('.input-group').attr('data-idx'))
          $(this).parents('.input-group').remove()
          menu_changes.splice(idx, 1)

          // 何もなくなるなら「不明なアイテム」を追加
          if (menu_changes.length === 0) {
            menu_changes.push({
              name: '不明なアイテム',
              icon: 'unknown',
              status: 0,
              amount: 0,
              customers: 0,
              price: 0,
            })
          } else {
            $('button#add').removeAttr('disabled')
          }
          $('.itemsContainer').children().remove()
          for (let i = 0; i < menu_changes.length; i++) {
            $('.itemsContainer').append(itemElem(menu_changes[i], i))
          }
          ItemsAddEventListeners()
          generatePreview()
        }
      })
  }

  onClassInfoLoaded(() => {
    const info_db = doc(db, 'class_info', classInfo.uid)
    const proc_db = doc(db, 'class_proceeds', classInfo.uid)

    // 取りあえず現時点でのメニューを保存しておく
    menu_changes = classInfo.menus

    // 初回クラス情報読み込み時のみ、メニュー情報を更新する
    $('.itemsContainer').children().remove()
    for (let i = 0; i < menu_changes.length; i++) {
      $('.itemsContainer').append(itemElem(menu_changes[i], i))
    }

    // 店名変更時
    $('input[name=shop]').on('input', function () {
      classInfo.shop_name = String($(this).val())
      generatePreview()
    })

    // 待ち時間変更時
    $('select[name=time]').on('change', function () {
      classInfo.time = String($(this).val())
      generatePreview()
    })

    // 食販かどうか変更
    $('input[name=isFood]').on('change', function () {
      classInfo.isFood = Boolean($(this).prop('checked'))
      generatePreview()
    })

    // メニュー追加
    $('.left-container button#add').on('click', function () {
      // 文化祭が始まる前のみ変更可能
      if (!isNowFestivalBefore()) {
        alert('追加は文化祭開始前のみ可能です。')
        return
      }
      // メニューは5つまで追加可能
      if (menu_changes.length >= 5) {
        alert('メニューは5つまで追加できます')
        return
      }

      // 初期状態は「不明なアイテム」
      menu_changes.push({
        name: '不明なアイテム',
        icon: 'unknown',
        status: 0,
        amount: 0,
        customers: 0,
        price: 0,
      })

      // 画面に表示
      $('.itemsContainer').append(
        itemElem(menu_changes[menu_changes.length - 1], menu_changes.length - 1)
      )

      // 5つ目なら、もう追加できなくする
      if (menu_changes.length >= 5) {
        $('button#add').attr('disabled', 'disabled')
      }
      ItemsAddEventListeners()
      generatePreview()
    })

    // 更新ボタンが押された
    $('button[type=submit]').on('click', async function () {
      $(this).attr('disabled', 'disabled')
      try {
        // データベース更新
        await updateDoc(info_db, {
          isFood: classInfo.isFood,
          menus: menu_changes.map((item) => ({
            icon: item.icon,
            name: item.name,
            status: item.status,
          })),
          name: classInfo.shop_name,
          time: classInfo.time,
        })

        // 文化祭前なら、文化祭前にしか更新できないほうも更新する
        if (isNowFestivalBefore()) {
          await updateDoc(proc_db, {
            menus: menu_changes.map((item) => ({
              amount: 0,
              customers: 0,
              icon: item.icon,
              name: item.name,
              price: item.price,
            })),
          })
        }

        // メニュー上書き
        classInfo.menus = menu_changes
        alert('更新しました')
      } catch (e) {
        // 何かエラーを吐いた時
        console.error(e)
        alert('更新に失敗しました')
      }
      $(this).removeAttr('disabled')
    })

    // リセットボタン = 再読み込み
    $('button[type=reset]').on('click', () => location.reload())
    generatePreview()
  })

  // クラス情報が更新されたとき、メニュー以外の情報を更新
  onClassInfoChanged(() => {
    $('h1').text(classInfo.name)
    $('input[name=shop]').val(classInfo.shop_name)
    $('select[name=type]').val(classInfo.time)
    if (classInfo.isFood) {
      $('input[name=isFood]').val('true').attr('checked', 'checked')
    }
    if (menu_changes.length >= 5) {
      $('button#add').attr('disabled', 'disabled')
    }
    ItemsAddEventListeners()
    generatePreview()
  })

  // 文化祭前チェックを毎秒しろ()
  setInterval(() => {
    if (!isNowFestivalBefore()) {
      $('.itemsContainer input[type=text]').attr('readonly', 'readonly')
      $('input[type=number]').attr('readonly', 'readonly')
      $('button#add').attr('disabled', 'disabled')
      $('button#iconSelect').attr('disabled', 'disabled')
      $('button#removeItem').attr('disabled', 'disabled')
      $('ul.dropdown-icon li').addClass('d-none')
    } else {
      $('.input-group input[type=text]').removeAttr('readonly')
      $('input[type=number]').removeAttr('readonly')
      $('button#add').removeAttr('disabled')
      $('button#iconSelect').removeAttr('disabled')
      $('button#removeItem').removeAttr('disabled')
      $('ul.dropdown-icon li').removeClass('d-none')
    }
  }, 1000)
})
