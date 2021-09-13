//----- Cloud Functions メインの処理 -----//

import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

import {
  type_buyPayReqData,
  type_chargePayReqData,
  type_readPayReqData,
} from './type'

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const ServiceAccount = require('./service_key.json')

admin.initializeApp({ credential: admin.credential.cert(ServiceAccount) })

const returnError = (msg: string) => ({ error: true, message: msg })

export const readPay = functions.https.onCall(
  async (data: type_readPayReqData, context) => {
    // リクエストに必要なデータが十分か確かめる
    if (!context.auth?.uid) {
      return returnError('not logged in')
    }
    const db = admin.firestore()
    if (!data.barcode || !data.cost) {
      return returnError('invalid request')
    }

    // 与えられたバーコードに合うユーザーがただ1人存在するか確かめる
    let snapshot = await db
      .collection('users')
      .where('barcode', '==', data.barcode)
      .get()
    if (snapshot.empty) {
      return returnError('user not exist')
    } else if (snapshot.size > 1) {
      return returnError('multiple users')
    }

    // そのユーザーが買うもの以上の残高があるか確かめる
    snapshot = await db
      .collection('users')
      .where('barcode', '==', data.barcode)
      .where('money', '>=', data.cost)
      .get()
    if (snapshot.empty) {
      return returnError('cannot buy')
    }

    // 購入できる場合
    return {
      error: false,
      canBuy: true,
      uid: snapshot.docs[0].id,
    }
  }
)

export const buyPay = functions.https.onCall(
  async (data: type_buyPayReqData, context) => {
    // リクエストに必要なデータが十分か確かめる
    if (!context.auth?.uid) {
      return returnError('not logged in')
    }
    const db = admin.firestore()
    if (!data.uid || !data.items || !data.name || !data.cost || !data.time) {
      return returnError('invalid request')
    }

    // 与えられたIDのユーザーがいるか確かめる
    const snapshot = await db.collection('users').doc(data.uid).get()
    if (!snapshot.exists) {
      return returnError('user not found')
    }

    // 保存するデータの構築
    const items = data.items
    let itemDisplayText = ''
    let totalAmount = 0
    items.forEach((item) => {
      itemDisplayText += `${item.name}（${item.price.toLocaleString()}円）を ${
        item.amount
      }個、`
      totalAmount += item.amount
    })

    // データを更新する
    await db
      .collection('users')
      .doc(data.uid)
      .set(
        {
          money: admin.firestore.FieldValue.increment(-Number(data.cost)),
          history: admin.firestore.FieldValue.arrayUnion({
            time: admin.firestore.Timestamp.fromDate(new Date(data.time)),
            place: data.name,
            item: itemDisplayText,
            amount: totalAmount,
            cost: Number(data.cost),
          }),
        },
        { merge: true }
      )
    return { error: false, message: 'ok' }
  }
)

export const chargePay = functions.https.onCall(
  async (data: type_chargePayReqData, context) => {
    // リクエストに必要なデータが十分か確かめる
    if (!context.auth?.uid) {
      return returnError('not logged in')
    }
    const db = admin.firestore()
    if (!data.barcode || !data.chargeAmount || !data.time) {
      return returnError('invalid request')
    }

    // 与えられたバーコードに一致するユーザーがあるか確かめる
    const snapshot = await db
      .collection('users')
      .where('barcode', '==', data.barcode)
      .get()
    if (snapshot.empty) {
      return returnError('user not exist')
    } else if (snapshot.size > 1) {
      return returnError('multiple users')
    }

    // データを更新する
    await db
      .collection('users')
      .doc(snapshot.docs[0].id)
      .set(
        {
          money: admin.firestore.FieldValue.increment(
            Number(data.chargeAmount)
          ),
          history: admin.firestore.FieldValue.arrayUnion({
            time: admin.firestore.Timestamp.fromDate(new Date(data.time)),
            place: 'KSS Pay チャージ',
            item: `${data.chargeAmount}円分のチャージ、`,
            amount: 1,
            cost: Number(data.chargeAmount),
          }),
        },
        { merge: true }
      )
    return { error: false, message: 'ok' }
  }
)
