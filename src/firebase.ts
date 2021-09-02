//----- Firebase関連の処理 -----//

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

import firebase from 'firebase/app'

import { classInfo } from './classInfo'
import { firebaseConfig } from './firebaseConfig'

// Firebaseを初期化
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const db = firebase.firestore()
firebase.functions().useEmulator('localhost', 5001)

type VoidFunc = () => void
let isClassInfoLoaded = false
const classInfoLoadedList: VoidFunc[] = []
const ifClassInfoLoaded = (fn: VoidFunc) => {
  // console.log(fn)
  if (isClassInfoLoaded) {
    fn()
  } else {
    classInfoLoadedList.push(fn)
  }
}

type infoType = {
  class: string
  isFood: boolean
  menus: {
    icon: string
    name: string
    status: number
  }[]
  name: string
  time: string
}

type proceedsType = {
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

// ログイン状態が変更されたときの処理
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // ログイン状態

    classInfo.uid = user.uid
    const info = await db.collection('class_info').doc(user.uid).get()
    const proceeds = await db.collection('class_proceeds').doc(user.uid).get()
    if (info.exists && proceeds.exists) {
      const infoData = info.data() as infoType
      const proceedsData = proceeds.data() as proceedsType

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
    }
    classInfoLoadedList.forEach((f) => f())
    isClassInfoLoaded = true
    console.log(classInfo)

    if (location.pathname === '/login') {
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
