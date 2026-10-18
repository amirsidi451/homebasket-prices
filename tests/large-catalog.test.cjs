const assert=require('node:assert/strict'),H=require('../core.js');const raw={fields:['name','unit','quantity','weighted'],p:{}};
for(let i=0;i<97096;i++)raw.p[String(7000000000000+i)]=['מוצר '+i,'יחידות','1.00',0];
raw.p['7000000000042']=['חלב בדיקת עומס','100 מיליליטר','330.00',0];
const start=performance.now();const catalog=H.products(raw);const found=H.search(catalog,'חלב');assert.equal(catalog.size,97096);assert.equal(found.length,1);assert.equal(H.packageLabel(found[0]),'330 מ״ל');
console.log('PASS synthetic 97,096 product parse + search + units: '+Math.round(performance.now()-start)+' ms (Node, not phone browser)');
const fs=require('node:fs'),path=require('node:path'),css=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8');assert.match(css,/\.card \.bottom button\{white-space:nowrap;flex-shrink:0/);assert.match(css,/@media\(max-width:480px\)/);console.log('PASS 390px applicable compact card and nowrap CSS rules present (static check, not visual QA)');
