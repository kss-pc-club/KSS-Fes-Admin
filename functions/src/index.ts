import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { type_buyPayReqData, type_readPayReqData } from './type'

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const ServiceAccount = require('./service_key.json')

admin.initializeApp({ credential: admin.credential.cert(ServiceAccount) })

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const returnError = (msg: string) => ({ error: true, message: msg })

export const readPay = functions.https.onCall(
  async (data: type_readPayReqData, context) => {
    if (!context.auth?.uid) {
      return returnError('not logged in')
    }

    const db = admin.firestore()
    if (!data.barcode || !data.cost) {
      return returnError('invalid request')
    }
    let snapshot = await db
      .collection('users')
      .where('barcode', '==', data.barcode)
      .get()
    if (snapshot.empty) {
      return returnError('user not exist')
    } else if (snapshot.size > 1) {
      return returnError('multiple users')
    }
    snapshot = await db
      .collection('users')
      .where('barcode', '==', data.barcode)
      .where('money', '>=', data.cost)
      .get()
    if (snapshot.empty) {
      return returnError('cannot buy')
    }
    return {
      error: false,
      canBuy: true,
      uid: snapshot.docs[0].id,
    }
  }
)

export const buyPay = functions.https.onCall(
  async (data: type_buyPayReqData, context) => {
    if (!context.auth?.uid) {
      return returnError('not logged in')
    }
    const db = admin.firestore()
    if (!data.uid || !data.items || !data.name || !data.cost || !data.time) {
      return returnError('invalid request')
    }
    const snapshot = await db.collection('users').doc(data.uid).get()
    if (!snapshot.exists) {
      return returnError('user not found')
    }
    const items = data.items
    let itemDisplayText = ''
    let totalAmount = 0
    items.forEach((item) => {
      itemDisplayText += `${item.name}（${item.price.toLocaleString()}円）を ${
        item.amount
      }個、`
      totalAmount += item.amount
    })
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
