//----- Cloud Functions で用いる型の定義 -----//

// readPayのリクエストデータ
type type_readPayReqData = {
  barcode: string
  cost: number
}

// buyPayのリクエストデータ
type type_buyPayReqData = {
  uid: string
  items: { name: string; price: number; amount: number }[]
  name: string
  cost: number
  time: string
}

// chargePayのリクエストデータ
type type_chargePayReqData = {
  barcode: string
  chargeAmount: number
  time: string
}
export { type_readPayReqData, type_buyPayReqData, type_chargePayReqData }
