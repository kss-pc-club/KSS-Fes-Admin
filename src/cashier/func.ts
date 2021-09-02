import $ from 'jquery'

import { classInfo } from '../classInfo'
import { firebase } from '../firebase'
import { listType } from './menu'

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

type RecordType = {
  isPay: boolean
  payAt: string
  payId: string | null
  sum: number
  time: Date
  list: listType[]
}

type classProceedsType = {
  customers: number
  menus: {
    amount: number
    customers: number
    icon: string
    name: string
    price: number
  }[]
  total: number
}

const RecordPayment = async (data: RecordType): Promise<void> => {
  const db = firebase.firestore()
  await db.collection('payment_log').add(data)
  const db_data = await db.collection('class_proceeds').doc(classInfo.uid).get()
  const db_menu = (db_data.data() as classProceedsType).menus
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
