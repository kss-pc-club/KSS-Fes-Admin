import { firebase } from './firebase'

type type_VoidFunc = () => void

type type_boughtList = {
  name: string
  price: number
  amount: number
}

type type_classInfoMenus = {
  icon: string
  name: string
  status: number
}[]

type type_classInfo = {
  class: string
  isFood: boolean
  menus: type_classInfoMenus
  name: string
  time: string
}

type type_classProceedsMenus = {
  amount: number
  customers: number
  icon: string
  name: string
  price: number
}[]

type type_classProceeds = {
  admin: boolean
  customers: number
  menus: type_classProceedsMenus
  total: number
}

type type_menu = {
  icon: string
  name: string
  status: number
  price: number
  customers: number
  amount: number
}

type type_forRecord = {
  isPay: boolean
  payAt: string
  payId: string | null
  sum: number
  time: Date
  list: type_boughtList[]
}

type type_chatSaveData = {
  fromAdmin: boolean
  message: string
  time: firebase.firestore.Timestamp
}
type type_chatAllData = {
  lastUpdate: firebase.firestore.Timestamp
  name: string
  history: type_chatSaveData[]
}

type type_func_readPay = {
  error: boolean
  canBuy: boolean
  uid?: string
  message?: string
}

type type_func_buyPay = {
  error: boolean
  message: string
}

type type_FestivalDuration = {
  start: firebase.firestore.Timestamp
  end: firebase.firestore.Timestamp
}
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
