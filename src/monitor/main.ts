import $ from 'jquery'

import { classInfo } from '../classInfo'
import { firebase, onClassInfoChanged, onClassInfoLoaded } from '../firebase'
import {
  type_FestivalDuration,
  type_FestivalDuration_date,
  type_menu,
} from '../type'
import { itemElem, previewItemElem } from './itemsMenu'

window.addEventListener('DOMContentLoaded', () => {
  let menu_changes: type_menu[] = []
  const festival_duration: type_FestivalDuration_date = {
    start: new Date(),
    end: new Date(),
  }

  firebase
    .firestore()
    .collection('festival_duration')
    .doc('time')
    .onSnapshot((snapshot) => {
      const data = snapshot.data() as type_FestivalDuration
      festival_duration.start = data.start.toDate()
      festival_duration.end = data.end.toDate()
    })

  const isNowFestivalBefore = () => {
    const d = new Date()
    return festival_duration.start > d
  }

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

  const ItemsAddEventListeners = () => {
    console.log('hogehoge')
    console.log(
      $('.itemsContainer'),
      $('.itemsContainer .input-group'),
      $('.itemsContainer .input-group .dropdown-icon'),
      $('.itemsContainer .input-group .dropdown-icon li'),
      $('.itemsContainer .input-group .dropdown-icon li a')
    )
    $('.itemsContainer .input-group .dropdown-icon li a')
      .off('click')
      .on('click', function () {
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
    $('.itemsContainer .input-group input[type=text]')
      .off('change')
      .on('change', function () {
        if (!isNowFestivalBefore()) {
          alert('商品名の変更は文化祭開始前のみ可能です。')
          return
        }
        const idx = Number($(this).parents('.input-group').attr('data-idx'))
        menu_changes[idx].name = String($(this).val())
      })
    $('.itemsContainer .input-group input[type=number]')
      .off('change')
      .on('change', function () {
        if (!isNowFestivalBefore()) {
          alert('値段の変更は文化祭開始前のみ可能です。')
          return
        }
        const idx = Number($(this).parents('.input-group').attr('data-idx'))
        menu_changes[idx].price = Number($(this).val())
      })
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
    $('.itemsContainer .input-group button#removeItem')
      .off('click')
      .on('click', function () {
        if (!isNowFestivalBefore()) {
          alert('削除は文化祭開始前のみ可能です。')
          return
        }
        if (confirm('削除しますか？')) {
          const idx = Number($(this).parents('.input-group').attr('data-idx'))
          $(this).parents('.input-group').remove()
          menu_changes.splice(idx, 1)
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
    const info_db = firebase
      .firestore()
      .collection('class_info')
      .doc(classInfo.uid)
    const proc_db = firebase
      .firestore()
      .collection('class_proceeds')
      .doc(classInfo.uid)

    menu_changes = classInfo.menus

    $('input[name=shop]').on('input', function () {
      classInfo.shop_name = String($(this).val())
      generatePreview()
    })
    $('select[name=time]').on('change', function () {
      classInfo.time = String($(this).val())
      generatePreview()
    })
    $('input[name=isFood]').on('change', function () {
      classInfo.isFood = Boolean($(this).prop('checked'))
      generatePreview()
    })

    $('.leftContainer button#add').on('click', function () {
      if (!isNowFestivalBefore()) {
        alert('追加は文化祭開始前のみ可能です。')
        return
      }
      if (menu_changes.length >= 5) {
        return
      }
      menu_changes.push({
        name: '不明なアイテム',
        icon: 'unknown',
        status: 0,
        amount: 0,
        customers: 0,
        price: 0,
      })
      $('.itemsContainer').append(
        itemElem(menu_changes[menu_changes.length - 1], menu_changes.length - 1)
      )
      if (menu_changes.length >= 5) {
        $('button#add').attr('disabled', 'disabled')
      }
      ItemsAddEventListeners()
      generatePreview()
    })
    $('button[type=submit]').on('click', async function () {
      $(this).attr('disabled', 'disabled')
      try {
        await info_db.update({
          isFood: classInfo.isFood,
          menus: menu_changes.map((item) => ({
            icon: item.icon,
            name: item.name,
            status: item.status,
          })),
          name: classInfo.shop_name,
          time: classInfo.time,
        })
        if (isNowFestivalBefore()) {
          await proc_db.update({
            menus: menu_changes.map((item) => ({
              amount: 0,
              customers: 0,
              icon: item.icon,
              name: item.name,
              price: item.price,
            })),
          })
        }
        classInfo.menus = menu_changes
        alert('更新しました')
      } catch (e) {
        console.error(e)
        alert('更新に失敗しました')
      }
      $(this).removeAttr('disabled')
    })

    $('button[type=reset]').on('click', () => location.reload())
    generatePreview()
  })

  onClassInfoChanged(() => {
    $('h1').text(classInfo.name)
    $('input[name=shop]').val(classInfo.shop_name)
    $('select[name=type]').val(classInfo.time)
    if (classInfo.isFood) {
      $('input[name=isFood]').val('true').attr('checked', 'checked')
    }
    $('.itemsContainer').children().remove()
    for (let i = 0; i < menu_changes.length; i++) {
      $('.itemsContainer').append(itemElem(menu_changes[i], i))
    }

    if (menu_changes.length >= 5) {
      $('button#add').attr('disabled', 'disabled')
    }
    ItemsAddEventListeners()
    generatePreview()
  })

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
