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
export { type_readPayReqData, type_buyPayReqData }
