//----- レジシステムで使う関数 -----//
import $ from 'jquery'

import { classInfo } from '../classInfo'
import { firebase } from '../firebase'
import { type_classProceeds, type_forRecord } from '../type'

/**
 * 指定時間待機します
 * @param t - 待機時間(ms)
 * @returns Promise
 */
const sleep = (t: number): Promise<void> => new Promise((r) => setTimeout(r, t))

/**
 * ページ遷移みたいなアニメーションします
 * @param before - 遷移前のコンテナ
 * @param after - 遷移後のコンテナ
 * @param isR2L - 右から左（←）にアニメーションするか
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const anim = async (before: any, after: any, isR2L = true): Promise<void> => {
  // 今表示しているものを移動する
  const outW = isR2L ? -window.outerWidth : window.outerWidth
  $(before).animate({ left: outW }, 500)
  $(before).find('footer').fadeOut(500)
  await sleep(500)

  // 移動後消す
  $(before).removeClass('showing')
  await sleep(200)

  // 次に表示するものを移動する
  $(after).addClass('showing').css({ left: -outW }).animate({ left: 0 }, 500)
  $(after).find('footer').fadeIn(500)
}

/**
 * 決済をデータベースに保存します
 * @param data - 保存するデータ
 */
const RecordPayment = async (data: type_forRecord): Promise<void> => {
  const db = firebase.firestore()

  // payment_logに保存
  await db.collection('payment_log').add(data)

  // クラスの売り上げに保存
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
