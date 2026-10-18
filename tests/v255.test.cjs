/* v2.5.5: "verified chains only" mode. 8 chains stay in data/config; 4 are hidden by visible:false. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{setup}=require('./support.cjs');
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
const SOURCES=['VICTORY_NEW_SOURCE','RAMI_LEVY','SHUFERSAL','YOHANANOF','YAYNO_BITAN_AND_CARREFOUR','OSHER_AD','HAZI_HINAM','TIV_TAAM'];
const NAMES=['ויקטורי','רמי לוי','שופרסל','יוחננוף','יינות ביתן / קרפור','אושר עד','חצי חינם','טיב טעם'];
const SHOWN=[0,1,2,4],HIDDEN=[3,5,6,7];
// Hidden chains are the CHEAPEST, to prove they are neither ranked nor compared.
const TOTALS=[10000,9000,11000,5000,12000,5500,6000,6500];
function env({hide=true,cart=5,minimums={},noPriceFor=[],areas={}}={}){
 const stamp=new Date().toISOString(),e=setup({},{consent:false});e.ctx.stamp=stamp;e.ctx.TOTALS=TOTALS;e.ctx.NOPRICE=noPriceFor;e.ctx.CARTN=cart;
 e.run("networks=HB.chains("+JSON.stringify(SOURCES.map((s,i)=>({source:s,name:NAMES[i]})))+");meta={per_chain_freshness:Object.fromEntries(networks.map(n=>[n.source,{latest_snapshot_at:stamp}]))};");
 const cfg={};SOURCES.forEach((s,i)=>{cfg[s]={availability:i===1?'known':'verify',visible:hide?SHOWN.includes(i):true,delivery:true,pickup:true,orderUrl:'https://shop.example.test/'+s,serviceAreas:{delivery:i===1?['רחובות','תל אביב']:[],pickup:i===1?['רחובות']:[]},estimatedDeliveryFee:30,estimatedPickupFee:10,fulfilment:{basis:'estimate',delivery:{amount:30,minimumOrder:minimums[i]||0},pickup:{amount:10,minimumOrder:minimums[i]||0}}};});
 e.ctx.CFG=cfg;
 e.run("HB_CONFIG.chains=CFG;catalog=HB.products({fields:['name','unit','quantity','weighted'],p:Object.fromEntries(Array.from({length:8},(_,i)=>[String(100+i),['מוצר '+i,'יחידות',1,0]]))});cart=Array.from({length:CARTN},(_,i)=>({barcode:String(100+i),qty:1}));priceMode='single';priceFiles=['prices.json.gz'];priceCache.set('prices.json.gz',new Map(cart.map((it,j)=>[it.barcode,new Map(networks.filter(n=>!NOPRICE.includes(n.index)).map(n=>[n.index,{last:Math.floor(TOTALS[n.index]/CARTN)+(j===0?TOTALS[n.index]%CARTN:0)}]))])));ready=true;");
 return e;
}
const tops=e=>[...e.get('comparison').innerHTML.matchAll(/data-top-chain="(\d+)"/g)].map(m=>+m[1]);
(async()=>{
 // --- production config flags (only when the serve directory is next to the test dir)
 const prod=path.join(__dirname,'..','..','serve','config.js'),prodAlt=path.join(__dirname,'..','config.production.js');
 for(const p of [prod,prodAlt])if(fs.existsSync(p)){const w={};w.window=w;vm.runInNewContext(fs.readFileSync(p,'utf8'),w);
  test('production config: exactly the 4 verified chains visible ('+path.basename(path.dirname(p))+')',()=>{const c=w.HB_CONFIG.chains;assert.deepEqual(Object.keys(c).filter(k=>c[k].visible!==false).sort(),['RAMI_LEVY','SHUFERSAL','VICTORY_NEW_SOURCE','YAYNO_BITAN_AND_CARREFOUR']);assert.deepEqual(Object.keys(c).filter(k=>c[k].visible===false).sort(),['HAZI_HINAM','OSHER_AD','TIV_TAAM','YOHANANOF']);assert.equal(Object.keys(c).length,8);});}
 // --- Rehovot delivery
 let e=env();e.run("applyService('רחובות','delivery')");await e.run('renderCompare()');
 test('only the 4 shown chains are selectable/eligible',()=>{assert.equal(e.run('visibleNetworks().length'),4);assert.equal(e.run('eligibleIds().length'),4);assert.deepEqual([...e.run('eligibleIds()')],SHOWN);});
 test('Top 3 with 4 chains shows exactly 3, cheapest first, no hidden chain',()=>{const t=tops(e);assert.equal(t.length,3);assert.deepEqual(t,[1,0,2]);for(const h of HIDDEN)assert.ok(!t.includes(h));});
 test('chain-summary counts the visible chains only',()=>{const t=e.get('chain-summary').textContent;assert.match(t,/מתוך 4 רשתות/);assert.doesNotMatch(t,/מתוך 8/);});
 test('audit lists 4 chains and a dynamic count',()=>{const a=e.get('all-chain-explanations').innerHTML;assert.equal((a.match(/data-audit-chain=/g)||[]).length,4);assert.match(a,/מצב כל 4 הרשתות/);for(const h of HIDDEN)assert.ok(!a.includes('data-audit-chain="'+h+'"'));});
 test('savings compares across all 4 shown chains and never mentions hidden ones',()=>{const s=e.get('savings').innerHTML;assert.match(s,/4 רשתות במאגר/);assert.equal((s.match(/data-chart-chain=/g)||[]).length,4);for(const h of HIDDEN){assert.ok(!s.includes('data-chart-chain="'+h+'"'));assert.ok(!s.includes(NAMES[h]));}
  assert.match(s,/רמי לוי/);assert.match(s,/ויקטורי/);assert.match(s,/שופרסל/);assert.match(s,/קרפור/);});
 test('savings amount is highest minus cheapest among shown (not hidden 50.00)',()=>{const m=e.run("HBSavings.model({rows:HB.coverage(cart,comparisonRecords,networks.length,'last',Date.now(),HB.snapshots(networks,meta)),cartSize:cart.length,networks,config:HB_CONFIG,place:servicePlace,snapshots:HB.snapshots(networks,meta)})");assert.equal(m.all.length,4);assert.equal(m.full.length,4);assert.equal(m.cheapest.chain,1);assert.equal(m.maximumSaving.amount,12000+30-(9000+30)-0);});
 test('order cards only for shown chains',()=>{const h=e.get('comparison').innerHTML;for(const x of HIDDEN)assert.ok(!h.includes('data-order="'+x+'"'));});
 test('network info and chain selector list only the shown chains',()=>{e.run('renderInfo();renderChainSelect()');assert.equal((e.get('network-status').innerHTML.match(/<article/g)||[]).length,4);assert.equal((e.get('chain-select').innerHTML.match(/data-chain=/g)||[]).length,4);});
 // --- Tel Aviv
 e.run("applyService('תל אביב','delivery')");await e.run('renderCompare()');
 test('Tel Aviv: still 3 of 4, hidden never ranked',()=>{const t=tops(e);assert.equal(t.length,3);for(const h of HIDDEN)assert.ok(!t.includes(h));});
 // --- unknown city: known chain (Rami) excluded, verify chains remain with verify notes
 e.run("applyService('עיר לא קיימת','delivery')");await e.run('renderCompare()');
 test('unknown city: verify chains remain (3), Rami excluded by known areas, availability note present',()=>{const t=tops(e);assert.deepEqual(t.sort(),[0,2,4]);assert.match(e.get('comparison').innerHTML,/יש לבדוק זמינות/);assert.match(e.get('chain-summary').textContent,/מתוך 4 רשתות/);});
 test('unknown city: Top 3 with exactly 3 eligible chains',()=>assert.equal(tops(e).length,3));
 // --- fewer than 3 full-coverage chains
 e=env({noPriceFor:[0,2,3]});e.run("applyService('רחובות','delivery')");await e.run('renderCompare()');
 test('only 1 shown chain with full coverage: Top list has 1, honest note, no hidden filler',()=>{const t=tops(e);assert.deepEqual(t,[1,4].filter(x=>t.includes(x)));assert.ok(t.length<=2);assert.match(e.get('comparison').innerHTML,/נמצא(ה רשת אחת| 2 רשתות)|לא נמצאו/);for(const h of HIDDEN)assert.ok(!t.includes(h));});
 // --- below minimum order still marked
 e=env({minimums:{0:99999}});e.run("applyService('רחובות','delivery')");await e.run('renderCompare()');
 test('below-minimum chain not in Top 3 and clearly marked; hidden still absent',()=>{const t=tops(e);assert.ok(!t.includes(0));assert.equal(t.length,3);assert.match(e.get('comparison').innerHTML,/מינימום|מתחת למינימום/);for(const h of HIDDEN)assert.ok(!t.includes(h));const m=e.run("HBSavings.model({rows:HB.coverage(cart,comparisonRecords,networks.length,'last',Date.now(),HB.snapshots(networks,meta)),cartSize:cart.length,networks,config:HB_CONFIG,place:servicePlace,snapshots:HB.snapshots(networks,meta)})");assert.equal(m.all.length,4);assert.ok(m.all.find(r=>r.chain===0).belowMinimum);});
 // --- pickup / shared group / partial
 e=env({noPriceFor:[2]});e.run("applyService('רחובות','pickup')");await e.run('renderCompare()');
 test('pickup + one chain without prices: partial handled, 4 shown max, hidden absent',()=>{const t=tops(e);assert.ok(t.length>=1&&t.length<=3);for(const h of HIDDEN)assert.ok(!t.includes(h));assert.match(e.get('selection-status').textContent,/רשתות בקבוצה המשותפת/);const sel=e.run('[...selected]');for(const h of HIDDEN)assert.ok(!sel.includes(h));});
 // --- revert: flip flags back and all 8 are shown again (dynamic text)
 e=env({hide:false});e.run("applyService('רחובות','delivery')");await e.run('renderCompare()');
 test('revert: with visible:true for all, 8 chains counted and ranked again (config/data intact)',()=>{assert.equal(e.run('visibleNetworks().length'),8);assert.match(e.get('chain-summary').textContent,/מתוך 8 רשתות/);assert.match(e.get('all-chain-explanations').innerHTML,/מצב כל 8 הרשתות/);assert.match(e.get('savings').innerHTML,/8 רשתות במאגר/);assert.deepEqual(tops(e),[3,5,6]);});
 console.log('TOTAL '+count);
})().catch(err=>{console.error(err);process.exit(1);});
