const express = require('express');
const fs = require('fs');
const port = process.env.PORT || 3000;
const path = require('path');
const { randomBarcode } = require('./func');
const bodyParser = require('body-parser');

const app = express();

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

app.use((err,req,res,next)=>{
	console.error(err);
	res.status(err.statusCode).sendFile(path.join(__dirname,`err/${err.statusCode}.html`));
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/pay/barcodeRegenerate', async (req,res)=>{
  const admin = require('firebase-admin');
  const serviceAccount = require('./pay/service_key.json');
  admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
  const db = admin.firestore();
  let bCode = "";
  let isLoop = true;
  while(isLoop){
    const barcode = randomBarcode();
    const snapshot = await db.collection('users').where('barcode','==',barcode).get();
    if(snapshot.empty){
      isLoop = false;
      bCode = barcode;
    }
  }
  const uid = req.body.uid;
  const user = db.collection('users').doc(uid);
  const dbResponse = await user.set({barcode: bCode},{merge: true});
  console.log(bCode,uid,dbResponse);
  res.sendStatus(204);
})

app.listen(port, ()=>console.log(`Listening on ${port}`));
