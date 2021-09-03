//----- Firebase関連の処理 -----//

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

import firebase from 'firebase/app'

import { classInfo } from './classInfo'
import { firebaseConfig } from './firebaseConfig'
import { type_classInfo, type_classProceeds, type_VoidFunc } from './type'

// Firebaseを初期化
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const db = firebase.firestore()
firebase.functions().useEmulator('localhost', 5001)

let isClassInfoLoaded = false
const classInfoLoadedList: type_VoidFunc[] = []
const ifClassInfoLoaded = (fn: type_VoidFunc) => {
  // console.log(fn)
  if (isClassInfoLoaded) {
    fn()
  } else {
    classInfoLoadedList.push(fn)
  }
}

// ログイン状態が変更されたときの処理
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // ログイン状態

    classInfo.uid = user.uid
    const info = await db.collection('class_info').doc(user.uid).get()
    const proceeds = await db.collection('class_proceeds').doc(user.uid).get()
    if (info.exists && proceeds.exists) {
      const infoData = info.data() as type_classInfo
      const proceedsData = proceeds.data() as type_classProceeds

      classInfo.name = infoData.class
      classInfo.isFood = infoData.isFood
      classInfo.shop_name = infoData.name
      classInfo.time = infoData.time
      classInfo.menus = infoData.menus.map((item) => {
        const proItem = proceedsData.menus.filter(
          (i) => i.name === item.name
        )[0]
        return {
          icon: item.icon,
          name: item.name,
          status: item.status,
          price: proItem.price,
          customers: proItem.customers,
          amount: proItem.amount,
        }
      })
      classInfo.admin = proceedsData.admin
    }
    classInfoLoadedList.forEach((f) => f())
    isClassInfoLoaded = true
    console.log(classInfo)
    if (location.pathname.startsWith('/admin/') && !classInfo.admin) {
      location.pathname = '/'
      return
    } else if (location.pathname === '/login') {
      location.pathname = '/'
      return
    }
  } else {
    // 非ログイン状態
    if (location.pathname !== '/login') {
      location.pathname = '/login'
    }
  }
})

// Firebaseの認証にデバイスの言語を利用する
auth.languageCode = 'ja'

// ログイン状態の保持期間の設定
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error)

export { firebase, auth, ifClassInfoLoaded }
