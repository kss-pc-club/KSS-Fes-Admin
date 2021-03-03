exports.randomBarcode = ()=>{
  const rand = Array.from(String(Math.round(Math.random() * Math.pow(10,12)))).map(_=>Number(_));
  let calc = 0;
  for(let i=0;i<12;i++){
    calc += (i%2 === 0) ? rand[i] : rand[i]*3;
  }
  calc = (10-(calc%10))%10;
  return rand.join("") + String(calc)
}
