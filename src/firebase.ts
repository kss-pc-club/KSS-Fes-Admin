//----- Firebase関連の処理 -----//

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

import firebase from 'firebase/app'

import { classInfo } from './classInfo'
import { firebaseConfig } from './firebaseConfig'
import {
  type_classInfo,
  type_classInfoMenus,
  type_classProceeds,
  type_classProceedsMenus,
  type_VoidFunc,
} from './type'

// Firebaseを初期化
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const db = firebase.firestore()
firebase.functions().useEmulator('localhost', 5001)

// クラスの情報が読み込まれた時の処理など
const isClassInfoLoaded = false
const classInfoLoadedList: type_VoidFunc[] = []
const classInfoChangedList: type_VoidFunc[] = []
/**
 * クラスの情報が読み込まれたら実行します
 * @param fn - 実行する関数
 */
const onClassInfoLoaded = (fn: type_VoidFunc) => {
  if (isClassInfoLoaded) {
    fn()
  } else {
    classInfoLoadedList.push(fn)
  }
}
/**
 * クラスの情報が変更されたら実行します
 * @param fn - 実行する関数
 */
const onClassInfoChanged = (fn: type_VoidFunc) => {
  classInfoChangedList.push(fn)
}

// ログイン状態が変更されたときの処理
auth.onAuthStateChanged((user) => {
  if (user) {
    // ログイン状態

    classInfo.uid = user.uid
    let menus_info: type_classInfoMenus = []
    let menus_proceeds: type_classProceedsMenus = []
    let isFirstLoad = true
    let eitherLoaded = false

    /**
     * メニュー項目を構築します
     * @returns 構築されたメニュー
     */
    const constructMenus = () =>
      menus_info.map((item) => {
        const proItem = menus_proceeds.filter((i) => i.name === item.name)[0]
        return {
          icon: item.icon,
          name: item.name,
          status: item.status,
          price: proItem.price,
          customers: proItem.customers,
          amount: proItem.amount,
        }
      })

    /**
     * 読み込まれたか確認し、その時にあった処理を実行します
     */
    const loadedCheckFn = () => {
      if (isFirstLoad) {
        if (eitherLoaded) {
          classInfo.menus = constructMenus()
          classInfoLoadedList.forEach((f) => f())
          isFirstLoad = false
        } else {
          eitherLoaded = true
        }
      }
      if (!isFirstLoad) {
        classInfo.menus = constructMenus()
        classInfoChangedList.forEach((f) => f())
      }
    }

    // データベース読み込み
    db.collection('class_info')
      .doc(user.uid)
      .onSnapshot((doc) => {
        const infoData = doc.data() as type_classInfo
        classInfo.name = infoData.class
        classInfo.isFood = infoData.isFood
        classInfo.shop_name = infoData.name
        classInfo.time = infoData.time
        menus_info = infoData.menus
        loadedCheckFn()
      })
    db.collection('class_proceeds')
      .doc(user.uid)
      .onSnapshot((doc) => {
        const proceedsData = doc.data() as type_classProceeds
        classInfo.admin = proceedsData.admin
        menus_proceeds = proceedsData.menus
        loadedCheckFn()
      })

    // 権限的なリダイレクト処理
    onClassInfoLoaded(() => {
      if (location.pathname.startsWith('/admin/') && !classInfo.admin) {
        location.pathname = '/'
        return
      } else if (location.pathname === '/' && classInfo.admin) {
        location.pathname = '/admin/'
        return
      } else if (location.pathname === '/login') {
        location.pathname = '/'
        return
      }
    })
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

export { firebase, auth, onClassInfoLoaded, onClassInfoChanged }
