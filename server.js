const express = require('express')
const fs = require('fs')
const port = process.env.PORT || 3000
const path = require('path')
const { randomBarcode, getNowDate } = require('./func')
const auth = require('basic-auth')
const users = require('./auth')
const { alias, getName } = require('./classAlias')
const cookieParser = require('cookie-parser')
const url = require('url')
const { Server } = require('ws')

const app = express()

const admin = require('firebase-admin')
const payServiceAccount = require('./pay/service_key.json')
const monitorServiceAccount = require('./monitor/service_key.json')
const payApp = admin.initializeApp(
  { credential: admin.credential.cert(payServiceAccount) },
  'pay'
)
const monitorApp = admin.initializeApp(
  { credential: admin.credential.cert(monitorServiceAccount) },
  'monitor'
)

const notAllowed = [
  'node_modules/',
  'src/',
  '.googleconfig',
  'app.yaml',
  'bundle.js.LICENSE.txt',
  'cloudbuild.yaml',
  'package-lock.json',
  'package.json',
  'server.js',
  'source-context.json',
  'webpack.config.js',
]

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/management/chat/data/get', (req, res) => {
  let fileContent = fs.readFileSync(
    path.join(__dirname, `/management/chat/data/${req.cookies.id}.txt`)
  )
  fileContent = fileContent.toString().split('\n')
  const ret = []
  fileContent.forEach((_) => {
    if (_) {
      const a = _.split(' ')
      ret.push({ sender: a[0], time: a[1], body: a[2] })
    }
  })
  if (ret.length) {
    res.json(ret)
  } else {
    res.json({})
  }
})

app.get('/admin/chat/data', (req, res) => {
  const ret = []
  switch (req.query.mode) {
    case 'init':
      for (let i = 2; i < 10; i++) {
        for (let j = 1; j <= 3; j++) {
          if (
            fs.existsSync(
              path.join(__dirname, `/management/chat/data/${i}-${j}.txt`)
            )
          ) {
            ret.push({ name: getName(`${i}-${j}`), ws: `${i}-${j}` })
          }
        }
      }
      res.json(ret)
      break
    case 'data':
      let fileContent = fs.readFileSync(
        path.join(__dirname, `/management/chat/data/${req.query.id}.txt`)
      )
      fileContent = fileContent.toString().split('\n')
      fileContent.forEach((_) => {
        if (_) {
          const a = _.split(' ')
          ret.push({ sender: a[0], time: a[1], body: a[2] })
        }
      })
      res.json(ret)
      break
  }
})

app.get('/management/clsdata.json', async (req, res) => {
  const db = monitorApp.firestore()
  console.log(req.cookies.id)
  const cls = await db
    .collection('class')
    .where('class', '==', req.cookies.id)
    .get()
  if (!cls.empty) {
    res.json(cls.docs[0].data())
  } else {
    res.json({})
  }
})
app.get('/management/logout.html', (req, res) => {
  res.cookie('id', '', {
    maxAge: 0,
    path: '/management/',
  })
  res.status(401).sendFile(path.join(__dirname, req.path))
})
app.get('/management/*', (req, res) => {
  if (!req.cookies.id) {
    const usr = auth(req)
    if (!usr || !users[usr.name] || users[usr.name].password !== usr.pass) {
      res.set('WWW-Authenticate', 'Basic realm="example"')
      return res.sendStatus(401)
    }
    res.cookie('id', usr.name, {
      maxAge: 86400,
      path: '/management/',
    })
  }
  res.sendFile(path.join(__dirname, req.path))
})

app.get('/*', (req, res) => {
  console.log(req.path)

  if (notAllowed.includes(req.path)) {
    res.status(404).sendFile(path.join(__dirname, `err/404.html`))
    return
  }

  if (!req.path.includes('.')) {
    const rewritePath = path.join(__dirname, `${req.path}.html`)
    if (fs.existsSync(rewritePath)) {
      res.sendFile(rewritePath)
      return
    }
  }
  if (req.path.endsWith('/')) {
    const rewritePath = path.join(__dirname, `${req.path}index.html`)
    if (fs.existsSync(rewritePath)) {
      res.sendFile(rewritePath)
      return
    }
  }
  res.sendFile(path.join(__dirname, req.path))
})

app.use((err, req, res, next) => {
  console.error(err)
  res
    .status(err.statusCode)
    .sendFile(path.join(__dirname, `err/${err.statusCode}.html`))
})

app.post('/pay/barcodeRegenerate', async (req, res) => {
  const db = payApp.firestore()

  const uid = req.body.uid
  const user = db.collection('users').doc(uid)
  if (!(await user.get()).exists) {
    // User does not exist
    res.sendStatus(400)
    return
  }

  let bCode = ''
  let isLoop = true
  while (isLoop) {
    const barcode = randomBarcode()
    if (!barcode) {
      continue
    }
    const snapshot = await db
      .collection('users')
      .where('barcode', '==', barcode)
      .get()
    if (snapshot.empty) {
      isLoop = false
      bCode = barcode
    }
  }
  await user.set({ barcode: bCode }, { merge: true })
  res.sendStatus(204)
})

app.post('/pay/userInit', async (req, res) => {
  const db = payApp.firestore()
  const uid = req.body.uid
  const user = db.collection('users').doc(uid)
  if ((await user.get()).exists) {
    res.sendStatus(400)
    return
  }
  await user.set({
    barcode: '0000000000000',
    money: 0,
    history: [],
  })
  res.sendStatus(204)
})

app.post('/pay/checkMoney', async (req, res) => {
  const db = payApp.firestore()
  const snapshot = await db
    .collection('users')
    .where('barcode', '==', req.body.barcode)
    .where('money', '>=', req.body.cost)
    .get()
  if (snapshot.empty) {
    res.json({ canBuy: false })
    return
  }

  const items = req.body.items // {name: e.name, price: e.price, amount: 0}]
  let itemDisplayName = ''
  let totalAmount = 0
  items.forEach((_) => {
    itemDisplayName += `${_.name}（￥${_.price.toLocaleString()}/個） ${
      _.amount
    }個、`
    totalAmount += _.amount
  })

  db.collection('users')
    .doc(snapshot.docs[0].id)
    .set(
      {
        money: admin.firestore.FieldValue.increment(-Number(req.body.cost)),
        history: admin.firestore.FieldValue.arrayUnion({
          time: admin.firestore.Timestamp.fromDate(new Date()),
          place: req.body.cls,
          item: itemDisplayName,
          amount: totalAmount,
          cost: Number(req.body.cost),
        }),
      },
      { merge: true }
    )
  res.json({ canBuy: true })
})

app.post('/pay/recordPay', async (req, res) => {
  const payDB = payApp.firestore()
  const snapshot = await payDB
    .collection('users')
    .where('barcode', '==', req.body.barcode)
    .get()
  if (snapshot.empty) {
    return
  }
  const uid = snapshot.docs[0].id

  const db = monitorApp.firestore()
  const cls = await db
    .collection('class')
    .where('class', '==', req.body.name)
    .get()
  if (!cls.empty) {
    let menus = cls.docs[0].data().menus
    req.body.list.forEach((item) => {
      const menu = menus.filter((_) => _.name === item.name)[0]
      const idx = menus.indexOf(menu)
      menu.people += 1
      menu.proceed += item.price * item.amount
      menus[idx] = menu
    })
    db.collection('class')
      .doc(cls.docs[0].id)
      .set(
        {
          proceeds: admin.firestore.FieldValue.increment(Number(req.body.sum)),
          payProceeds: admin.firestore.FieldValue.increment(
            Number(req.body.sum)
          ),
          menus: menus,
        },
        { merge: true }
      )
  }
  db.collection('paymentLog').add({
    isPay: true,
    payAt: req.body.name,
    payId: uid,
    sum: req.body.sum,
    time: admin.firestore.Timestamp.fromDate(new Date()),
  })
  res.json({ res: 'OK' })
})

app.post('/pay/cashPay', async (req, res) => {
  const db = monitorApp.firestore()
  console.log(req.body)
  const cls = await db
    .collection('class')
    .where('class', '==', req.body.name)
    .get()
  if (!cls.empty) {
    let menus = cls.docs[0].data().menus
    req.body.list.forEach((item) => {
      const menu = menus.filter((_) => _.name === item.name)[0]
      const idx = menus.indexOf(menu)
      menu.people += 1
      menu.proceed += item.price * item.amount
      menus[idx] = menu
    })
    db.collection('class')
      .doc(cls.docs[0].id)
      .set(
        {
          proceeds: admin.firestore.FieldValue.increment(Number(req.body.sum)),
          payProceeds: admin.firestore.FieldValue.increment(
            Number(req.body.sum)
          ),
          menus: menus,
        },
        { merge: true }
      )
  }
  db.collection('paymentLog').add({
    isPay: false,
    payAt: req.body.name,
    payId: '(Cash)',
    sum: req.body.sum,
    time: admin.firestore.Timestamp.fromDate(new Date()),
  })
  res.json({ res: 'OK' })
})

app.post('/management/chat/data/write', (req, res) => {
  fs.appendFileSync(
    path.join(__dirname, `/management/chat/data/${req.cookies.id}.txt`),
    `${req.body.data}\n`
  )
  res.json({ res: 'OK' })
})

app.post('/admin/chat/write', (req, res) => {
  fs.appendFileSync(
    path.join(__dirname, `/management/chat/data/${req.body.id}.txt`),
    `${req.body.data}\n`
  )
  res.json({ res: 'OK' })
})

app.use(auth)

app.listen(port, () => console.log(`Listening on ${port}`))
