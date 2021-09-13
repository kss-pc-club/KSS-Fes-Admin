type type_readPayReqData = {
  barcode: string
  cost: number
}

type type_buyPayReqData = {
  uid: string
  items: { name: string; price: number; amount: number }[]
  name: string
  cost: number
  time: string
}

type type_chargePayReqData = {
  barcode: string
  chargeAmount: number
  time: string
}
export { type_readPayReqData, type_buyPayReqData, type_chargePayReqData }
