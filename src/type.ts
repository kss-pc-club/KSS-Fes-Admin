import { Timestamp } from 'firebase/firestore'

// Void関数
type type_VoidFunc = () => void

// 買うものリスト
type type_boughtList = {
  name: string
  price: number
  amount: number
}

// monitorからも参照できるクラスメニュー
type type_classInfoMenus = {
  icon: string
  name: string
  status: number
}[]

// monitorから参照できるクラス情報
type type_classInfo = {
  class: string
  isFood: boolean
  menus: type_classInfoMenus
  name: string
  time: string
}

// 売り上げなどが保存されているクラスメニュー
type type_classProceedsMenus = {
  amount: number
  customers: number
  icon: string
  name: string
  price: number
}[]

// 売り上げなどが保存されているクラス情報
type type_classProceeds = {
  admin: boolean
  customers: number
  menus: type_classProceedsMenus
  total: number
}

// 上2つを結合したクラスメニュー
type type_menu = {
  icon: string
  name: string
  status: number
  price: number
  customers: number
  amount: number
}

// 決済記録保存用データ
type type_forRecord = {
  isPay: boolean
  payAt: string
  payId: string | null
  sum: number
  time: Date
  list: type_boughtList[]
}

// チャットツールのメッセージ履歴
type type_chatSaveData = {
  fromAdmin: boolean
  message: string
  time: Timestamp
}

// チャットツールの全保存データ
type type_chatAllData = {
  lastUpdate: Timestamp
  name: string
  history: type_chatSaveData[]
}

// Cloud Functions の ReadPay の返り値
type type_func_readPay = {
  error: boolean
  canBuy: boolean
  uid?: string
  message?: string
}

// Cloud Functions の BuyPay の返り値
type type_func_buyPay = {
  error: boolean
  message: string
}

// データベースから取り出した生の文化祭開催情報
type type_FestivalDuration = {
  start: Timestamp
  end: Timestamp
}

// 日付に直した文化祭開催情報
type type_FestivalDuration_date = {
  start: Date
  end: Date
}

export {
  type_VoidFunc,
  type_boughtList,
  type_classInfoMenus,
  type_classInfo,
  type_classProceedsMenus,
  type_classProceeds,
  type_menu,
  type_forRecord,
  type_func_readPay,
  type_func_buyPay,
  type_chatSaveData,
  type_chatAllData,
  type_FestivalDuration,
  type_FestivalDuration_date,
}
