const assert=require('node:assert/strict');const {setup,loadFixture}=require('./support.cjs');
(async()=>{
 const e=setup();await loadFixture(e);assert.match(e.get('products').innerHTML,/גבינה בדיקה/);console.log('PASS gzip catalog load and render');
 e.get('products').onclick({target:{closest:()=>({dataset:{add:'3073781199918'}})}});e.get('products').onclick({target:{closest:()=>({dataset:{add:'3073781199918'}})}});assert.equal(e.run('cart[0].qty'),2);assert.equal(JSON.parse(e.storage['homebasket-static-cart-v1'])[0].qty,2);console.log('PASS explicit add and quantity persistence');
 const restored=setup(e.storage);assert.equal(restored.run('cart[0].qty'),2);console.log('PASS cart restoration after explicit resume in new page context');
 await e.run('renderCompare()');assert.match(e.get('comparison').innerHTML,/network-winner/);assert.match(e.get('comparison').innerHTML,/400|4\.00/);console.log('PASS full basket comparison renders');
 e.get('mode').value='coverage';await e.run('renderCompare()');assert.match(e.get('comparison').innerHTML,/השוואת כל הרשתות/);assert.doesNotMatch(e.get('comparison').innerHTML,/class="winner"/);console.log('PASS coverage mode does not invent comparable-basket savings');
 assert.match(e.get('comparison').innerHTML,/הזול ביותר למוצר זה/);console.log('PASS per-product cheapest across networks renders');
 e.get('cart-items').listeners.change({target:{dataset:{qty:'3073781199918'},value:'1.5'}});assert.equal(e.run('cart[0].qty'),2);console.log('PASS fractional packaged quantity rejected');
 const shard=setup();await loadFixture(shard,true);shard.run("cart=[{barcode:'3073781199918',qty:1}]");await shard.run('renderCompare()');assert.match(shard.get('comparison').innerHTML,/network-winner/);console.log('PASS lazy gzip shard comparison');
 const bad=setup();bad.ctx.fixture=new Map([['meta.json',{stream:()=>new Blob(['{}']).stream()}],['chains.json',{stream:()=>new Blob(['{}']).stream()}]]);await bad.run('files=fixture;load()');assert.match(bad.get('notice').textContent,/chains.json/);assert.equal(bad.run('ready'),false);console.log('PASS incompatible schema fails visibly');
 console.log('9 interface integration tests passed (API stubs; no visual QA)');
})().catch(e=>{console.error(e);process.exitCode=1;});
