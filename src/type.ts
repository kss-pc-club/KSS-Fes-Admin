type type_VoidFunc = () => void

type type_boughtList = {
  name: string
  price: number
  amount: number
}

type type_classInfo = {
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

type type_classProceeds = {
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

export {
  type_VoidFunc,
  type_boughtList,
  type_classInfo,
  type_classProceeds,
  type_menu,
  type_forRecord,
  type_func_readPay,
  type_func_buyPay,
}
