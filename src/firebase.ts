//----- Firebase関連の処理 -----//

import 'firebase/auth'

import firebase from 'firebase/app'

import { firebaseConfig } from './firebaseConfig'

// Firebaseを初期化
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()

// ログイン状態が変更されたときの処理
auth.onAuthStateChanged((user) => {
  if (user) {
    // ログイン状態
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

export { firebase, auth }
