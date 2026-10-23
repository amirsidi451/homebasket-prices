/* Reproducible browser QA site, isolated from production data. */
const fs=require('node:fs'),path=require('node:path'),{fixture,bytes}=require('./v270-fixture.cjs');
const root=path.resolve(__dirname,'..'),dest=path.resolve(root,'.qa-v271');
for(const variant of ['with','without','broken']){
 const out=path.join(dest,'qa-'+variant);fs.mkdirSync(path.join(out,'data'),{recursive:true});
 for(const f of fs.readdirSync(root))if(/\.(js|css|html|svg|ico)$/.test(f))fs.copyFileSync(path.join(root,f),path.join(out,f));
 fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
 for(const [name,value]of Object.entries(fixture(variant)))fs.writeFileSync(path.join(out,'data',name),bytes(name,value));
}
fs.mkdirSync(path.join(dest,'tests'),{recursive:true});
for(const f of ['v271.browser.html','v271.browser.js'])fs.copyFileSync(path.join(__dirname,f),path.join(dest,'tests',f));
console.log('QA only: '+dest+'\nServe with: python -m http.server 8081 --bind 127.0.0.1 --directory .qa-v271\nOpen: http://127.0.0.1:8081/tests/v271.browser.html');
