const express = require('express');
const fs = require('fs');
const port = process.env.PORT || 3000;
const path = require('path');
const { randomBarcode } = require('./func');
const bodyParser = require('body-parser');

const app = express();

const admin = require('firebase-admin');
const payServiceAccount = require('./pay/service_key.json');
const monitorServiceAccount = require('./monitor/service_key.json');
const payApp = admin.initializeApp({credential: admin.credential.cert(payServiceAccount)}, 'pay');
const monitorApp = admin.initializeApp({credential: admin.credential.cert(monitorServiceAccount)}, 'monitor')

const notAllowed = [
	"node_modules/",
	"src/",
	".googleconfig",
	"app.yaml",
	"bundle.js.LICENSE.txt",
	"cloudbuild.yaml",
	"package-lock.json",
	"package.json",
	"server.js",
	"source-context.json",
	"webpack.config.js",
];

app.listen(port, ()=>console.log(`Listening on ${port}`));

app.get('/*',(req,res)=>{
	console.log(req.path);

	if(notAllowed.includes(req.path)){
		res.status(404).sendFile(path.join(__dirname,`err/404.html`));
		return;
	}

	if(!req.path.includes(".")){
		const rewritePath = path.join(__dirname,`${req.path}.html`);
		if(fs.existsSync(rewritePath)){
			res.sendFile(rewritePath);
			return;
		}
	}
	res.sendFile(path.join(__dirname,req.path));
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((err,req,res,next)=>{
	console.error(err);
	res.status(err.statusCode).sendFile(path.join(__dirname,`err/${err.statusCode}.html`));
})

app.post('/pay/barcodeRegenerate', async (req,res)=>{
  const db = payApp.firestore();

  const uid = req.body.uid;
  const user = db.collection('users').doc(uid);
  if(!(await user.get()).exists){
    // User does not exist
    res.sendStatus(400);
    return;
  }

  let bCode = "";
  let isLoop = true;
  while(isLoop){
    const barcode = randomBarcode();
    if(!barcode){ continue; }
    const snapshot = await db.collection('users').where('barcode','==',barcode).get();
    if(snapshot.empty){
      isLoop = false;
      bCode = barcode;
    }
  }
  await user.set({barcode: bCode},{merge: true});
  res.sendStatus(204);
})

app.post('/pay/userInit', async (req,res)=>{
  const db = payApp.firestore();
  const uid = req.body.uid;
  const user = db.collection('users').doc(uid)
  if((await user.get()).exists){
    res.sendStatus(400);
    return;
  }
  await user.set({
    barcode: "0000000000000",
    money: 0,
    history: [],
  });
  res.sendStatus(204)
})