import $ from 'jquery'

import { classInfo } from '../classInfo'
import { firebase } from '../firebase'
import { type_classProceeds, type_forRecord } from '../type'

const sleep = (t: number): Promise<void> => new Promise((r) => setTimeout(r, t))

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const anim = async (before: any, after: any, isR2L = true): Promise<void> => {
  const outW = isR2L ? -window.outerWidth : window.outerWidth
  $(before).animate({ left: outW }, 500)
  $(before).find('footer').fadeOut(500)
  await sleep(500)
  $(before).removeClass('showing')
  await sleep(200)
  $(after).addClass('showing').css({ left: -outW }).animate({ left: 0 }, 500)
  $(after).find('footer').fadeIn(500)
}

const RecordPayment = async (data: type_forRecord): Promise<void> => {
  const db = firebase.firestore()
  await db.collection('payment_log').add(data)
  const db_data = await db.collection('class_proceeds').doc(classInfo.uid).get()
  const db_menu = (db_data.data() as type_classProceeds).menus
  db_menu.forEach((item) => {
    const dt = data.list.filter((l) => l.name === item.name)[0]
    if (dt.amount >= 1) {
      item.customers++
      item.amount += dt.amount
    }
  })
  await db
    .collection('class_proceeds')
    .doc(classInfo.uid)
    .update({
      menus: db_menu,
      total: firebase.firestore.FieldValue.increment(data.sum),
      customers: firebase.firestore.FieldValue.increment(1),
    })
}
export { sleep, anim, RecordPayment }
