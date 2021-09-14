//----- Firebase関連の処理 -----//

import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getFirestore, onSnapshot } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'

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
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const cloudFunctions = getFunctions(app)
connectFunctionsEmulator(cloudFunctions, 'localhost', 5001)

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
onAuthStateChanged(auth, (user) => {
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
    onSnapshot(doc(db, 'class_info', user.uid), (doc) => {
      const infoData = doc.data() as type_classInfo
      classInfo.name = infoData.class
      classInfo.isFood = infoData.isFood
      classInfo.shop_name = infoData.name
      classInfo.time = infoData.time
      menus_info = infoData.menus
      loadedCheckFn()
    })
    onSnapshot(doc(db, 'class_proceeds', user.uid), (doc) => {
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

// Firebaseの認証に日本語を利用する
auth.languageCode = 'ja'

export { app, auth, onClassInfoLoaded, onClassInfoChanged, db, cloudFunctions }
