/* Plain browser JavaScript; no build tools, SDKs, secrets or server. */
'use strict';
const $=id=>document.getElementById(id), E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS'}).format(n/100);
const date=x=>{const n=Date.parse(HB.snapshotStamp(String(x)));return Number.isFinite(n)?new Intl.DateTimeFormat('he-IL',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Jerusalem'}).format(n):'מועד לא ידוע';};
let serviceAreasStatus='קובץ אזורי השירות של רמי לוי וחצי חינם טרם נטען.';
let servicePlace=null,serviceRevision=0,orderRevision=-1;
let approvedSources=null,cartMissingRequest=0;
let coverageSuggestionCache=new Map(),widerSuggestions=new Map(),offerExpiryTimer=null;
let dataVersion='',approved=new Map(),comparisonRecords=new Map(),alternativeChoices=[],alternativeContext=null,alternativeRequest=0;
let coverageIndex=new Map(),automatic=true,searchGeneration=0;
let offersLoading=null,offerTimer=null,offerSearchGeneration=0;
let catalog=new Map(),networks=[],meta={},cart=[],files=null,ready=false,selected=new Set(),pageSize=30,priceFiles=null,priceMode='unknown',priceCache=new Map(),generation=0,compareGeneration=0,offers=null,searchTimer;
const cartKey='homebasket-static-cart-v1';
let pendingSavedCart=[],saveCartEnabled=false,cartProvenance=new Map();
try{pendingSavedCart=HB.validCart(JSON.parse(localStorage.getItem(cartKey)||'[]'));}catch{}

function toast(s){$('toast').textContent=s;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>{$('toast').style.display='none';$('toast').textContent='';},3500);}
function restoreSavedApprovals(){try{const saved=JSON.parse(localStorage.getItem('homebasket-approved-alternatives-v1')||'{}');approvedSources=saved.sources;const raw=saved.values;if(Array.isArray(raw))approved=new Map(raw.filter(x=>Array.isArray(x)&&typeof x[0]==='string'&&x[1]&&/^\d{1,14}$/.test(x[1].barcode)&&Number.isFinite(x[1].qty)&&x[1].qty>0&&x[1].qty<=999));}catch{}}
function clearApprovals(barcode){for(const key of approved.keys())if(key.endsWith(":"+barcode))approved.delete(key);saveAlternatives();}
function saveAlternatives(){if(!saveCartEnabled)return;try{localStorage.setItem('homebasket-approved-alternatives-v1',JSON.stringify({sources:networks.map(n=>n.source),values:[...approved]}));}catch{toast('לא ניתן לשמור את החלופות בדפדפן.');}}
function save(){if($('order-dialog').open){$('order-dialog').close();$('order-list').value='';}clearTimeout(toast.timer);$('toast').textContent='';$('toast').style.display='none';try{if(saveCartEnabled){localStorage.setItem(cartKey,JSON.stringify(cart));localStorage.setItem('homebasket-cart-provenance-v1',JSON.stringify([...cartProvenance]));}}catch{toast('הדפדפן אינו מאפשר שמירה; הסל יישמר רק עד סגירת העמוד.');}$('count').textContent=cart.length;window.HB_UX?.update();}
function route(){clearTimeout(toast.timer);$('toast').textContent='';$('toast').style.display='none';if($('basket-drawer'))$('basket-drawer').open=false;let target=['home','location','search','receipt','networks','cart','compare','info'].includes(location.hash.slice(1))?location.hash.slice(1):'home';if(!servicePlace&&['search','receipt','networks','compare'].includes(target)){target='location';location.hash='#location';}if(target==='location')renderLocation();document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==target);document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+target)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(target==='cart')renderCart();if(target==='compare')renderCompare();if(target==='info')renderInfo();if(target==='networks'&&ready){renderChainSelect();renderCompare();}window.HB_UX?.update();}
function provenanceBadge(code){return cartProvenance.has(code)?'<span class="tag alternative-tag">חלופה אושרה</span>':'';}
function resumeSavedCart(){
 if(!pendingSavedCart.length)return;if(cart.length&&!confirm('להחליף את הסל הנוכחי בסל השמור?'))return;
 cart=HB.validCart(pendingSavedCart);pendingSavedCart=[];saveCartEnabled=true;restoreSavedApprovals();
 try{cartProvenance=new Map(JSON.parse(localStorage.getItem('homebasket-cart-provenance-v1')||'[]'));}catch{cartProvenance=new Map();}
 save();renderCart();window.HB_UX?.update();
}
function setCartSaving(value){saveCartEnabled=!!value;if(saveCartEnabled){pendingSavedCart=[];save();}else{try{localStorage.removeItem(cartKey);localStorage.removeItem('homebasket-approved-alternatives-v1');localStorage.removeItem('homebasket-cart-provenance-v1');}catch{}}}
function startNewCart(){
 if((cart.length||pendingSavedCart.length)&&!confirm('להתחיל סל חדש ולמחוק את הסל השמור?'))return;
 cart=[];pendingSavedCart=[];approved.clear();cartProvenance.clear();setCartSaving(false);automatic=true;save();renderCart();renderProducts();window.HB_UX?.update();
}
function setQuantity(code,value){
 const item=cart.find(i=>i.barcode===code),p=catalog.get(code);if(!item||!p)return false;
 if(value===0){if(!confirm('להסיר את המוצר מהסל?')){window.HB_UX?.update();return false;}cart=cart.filter(i=>i.barcode!==code);cartProvenance.delete(code);}
 else{if(!Number.isFinite(value)||value<0||value>999||(!p.weighted&&!Number.isInteger(value))){toast('הזינו אריזות שלמות או משקל תקין.');return false;}item.qty=Math.round(value*1000)/1000;}
 clearApprovals(code);automatic=true;save();renderCart();return true;
}
function adjustQuantity(code,delta){const item=cart.find(i=>i.barcode===code);if(item)setQuantity(code,Math.max(0,Math.round((item.qty+delta*(catalog.get(code)?.weighted?.1:1))*1000)/1000));}
function dataURL(name){const url=new URL(name,new URL(HB_CONFIG.dataBase,location.href));if(name!=='meta.json'&&dataVersion)url.searchParams.set('v',dataVersion);return url;}
async function jsonFile(name,optional=false){
 const requestGeneration=generation;
 if(!/^[a-z0-9_.-]+\.(json|gz)$/.test(name))throw Error('שם קובץ לא בטוח');
 let stream;
 if(files){const f=files.get(name);if(!f){if(optional)return null;throw Error('חסר קובץ '+name);}stream=f.stream();}
 else{let response;try{response=await fetch(dataURL(name),{cache:'reload',signal:AbortSignal.timeout(90000)});}catch{throw Error('לא ניתן לטעון '+name+'. בפתיחה מקומית בחרו תיקיית נתונים במסך הנתונים.');}if(response.status===404&&optional)return null;if(!response.ok)throw Error('טעינת '+name+' נכשלה ('+response.status+')');stream=response.body;}
 // Inspect magic bytes: hosting may have already decompressed Content-Encoding:gzip.
 const reader=stream.getReader();const first=await reader.read();if(first.done)throw Error('קובץ ריק: '+name);
 let cancelled=false;const restored=new ReadableStream({start(c){c.enqueue(first.value);},async pull(c){try{const r=await reader.read();if(r.done)c.close();else c.enqueue(r.value);}catch(e){c.error(e);}},cancel(){cancelled=true;return reader.cancel();}});
 let decoded=restored;
 if(first.value[0]===31&&first.value[1]===139){if(!window.DecompressionStream){await reader.cancel();throw Error('נדרש דפדפן התומך בפענוח gzip');}decoded=restored.pipeThrough(new DecompressionStream('gzip'));}
 const r=decoded.getReader();const decoder=new TextDecoder();const parts=[];let bytes=0;
 try{while(true){const part=await r.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>HB_CONFIG.maxInflatedBytes)throw Error('הקובץ גדול מדי למכשיר. יש לייצא קבצים מפוצלים קטנים יותר.');parts.push(decoder.decode(part.value,{stream:true}));}parts.push(decoder.decode());const parsed=JSON.parse(parts.join('').replace(/^\uFEFF/,''));if(requestGeneration!==generation)throw Error('טעינת נתונים קודמת בוטלה בעקבות רענון');return parsed;}catch(e){await r.cancel().catch(()=>{});throw e;}
}
async function load(){if($('order-dialog').open)$('order-dialog').close();$('order-list').value='';orderRevision=-1;const my=++generation;$('result-summary').textContent='';++compareGeneration;++searchGeneration;++offerSearchGeneration;clearTimeout(offerTimer);clearTimeout(offerExpiryTimer);coverageSuggestionCache.clear();widerSuggestions.clear();offersLoading=null;ready=false;if($('alternative-dialog').open)$('alternative-dialog').close();dataVersion='';comparisonRecords.clear();alternativeContext=null;++alternativeRequest;priceCache.clear();priceFiles=null;priceMode='unknown';offers=null;coverageIndex.clear();automatic=true;$('notice').textContent='טוענים קטלוג…';$('products').textContent='';try{
 const nextMeta=await jsonFile('meta.json');if(my!==generation)return;dataVersion=String(nextMeta.generated_at||nextMeta.exported_at||'');const nextNetworks=HB.validateSources(HB.chains(await jsonFile('chains.json')));const nextCatalog=HB.products(await jsonFile('products.json.gz'));
 if(my!==generation)return;meta=nextMeta;networks=nextNetworks;catalog=nextCatalog;if(approvedSources&&JSON.stringify(approvedSources)!==JSON.stringify(networks.map(n=>n.source))){approved.clear();saveAlternatives();toast('סדר הרשתות השתנה; אישורי החלופות אופסו כדי למנוע שיוך שגוי.');}approvedSources=networks.map(n=>n.source);networks=networks.map(n=>({...n,name:HBOnline.settings(n,HB_CONFIG).name||n.name}));await loadConfiguredAreas();if(my!==generation)return;selected=new Set(eligibleIds());renderLocation();
 const configured=meta.price_files??meta.files?.prices;
 if(Array.isArray(configured)&&configured.every(n=>typeof n==='string')){priceFiles=configured;priceMode=priceFiles.length===1?'single':'shards';}
 ready=true;$('notice').textContent='הקטלוג נטען. בחרו עיר ואופן קבלה; המחירים להשוואה לפני דמי משלוח או איסוף.';$('catalog-count').textContent=catalog.size.toLocaleString('he-IL')+' מוצרים';$('source-info').textContent=(files?'מקור: תיקייה מקומית · ':'מקור: '+HB_CONFIG.dataBase+' · ')+'יצירת הייצוא: '+date(meta.generated_at||meta.exported_at);renderProducts();renderInfo();renderChainSelect();route();window.HB_UX?.update();
 }catch(e){if(my!==generation)return;$('network-status').textContent=e.message;$('notice').textContent=e.message;$('products').innerHTML='<div class="empty"><h3>נחבר את הנתונים שלכם</h3><p>אין כאן מחירי דוגמה. בחרו את תיקיית הייצוא כדי להתחיל.</p><a class="button primary" href="#info">לבחירת תיקייה</a></div>';}}
async function getChunk(code){const requestGeneration=generation;let name;
 if(priceMode==='unknown'){
  const raw=await jsonFile('prices.json.gz',true);if(requestGeneration!==generation)throw Error('טעינת מחירים קודמת בוטלה');
  if(raw!==null){const parsed=indexCoverage(HB.prices(raw,networks.length));priceMode='single';priceFiles=['prices.json.gz'];priceCache.set('prices.json.gz',parsed);return parsed;}
  priceMode='shards';priceFiles=Array.from({length:9},(_,i)=>'prices_'+(i+1)+'.json.gz');
 }
 if(priceMode==='single')name=priceFiles[0];else{name=priceFiles.find(n=>new RegExp('prices_'+code[0]+'\\.json(?:\\.gz)?$').test(n));if(!name)throw Error('אין קובץ מחירים לספרה '+code[0]+'. יש להגדיר price_files ב־meta.json.');}
 if(priceCache.has(name))return priceCache.get(name);
 const raw=await jsonFile(name);if(requestGeneration!==generation)throw Error('טעינת מחירים קודמת בוטלה');const parsed=indexCoverage(HB.prices(raw,networks.length));if(priceCache.size>=2)priceCache.delete(priceCache.keys().next().value);priceCache.set(name,parsed);return parsed;
}
function searchLoading(){ $('products').setAttribute('aria-busy','true');$('products').innerHTML='<p class="loading" role="status">מחפשים מוצרים ומחירים…</p>';$('result-count').textContent='טוענים תוצאות…';$('more').hidden=true;}
async function renderProducts(){if(!ready)return;const request=++searchGeneration,q=$('query').value.trim();searchLoading();
 const current=()=>request===searchGeneration&&q===$('query').value.trim();
 if(q){try{const candidates=HB.search(catalog,q);const groups=new Map();for(const p of candidates)if(!groups.has(p.barcode[0]))groups.set(p.barcode[0],p.barcode);for(const code of groups.values()){await getChunk(code);if(!current())return;for(const p of candidates)if(p.barcode[0]===code[0]&&!coverageIndex.has(p.barcode))coverageIndex.set(p.barcode,0);}}catch(e){if(!current())return;$('products').setAttribute('aria-busy','false');$('products').innerHTML='<div class="empty">לא ניתן לטעון מחירים לחיפוש הזה. נסו שוב או רעננו את הנתונים.</div>';$('result-count').textContent='טעינת החיפוש נכשלה';return;}}
 if(!q){$('products').setAttribute('aria-busy','false');$('products').innerHTML='<div class="empty">הקלידו שם מוצר או ברקוד כדי להתחיל לחפש.</div>';$('result-count').textContent='';return;}
 if(!current())return;const ranked=HB.search(catalog,q,coverageIndex),matches=ranked.slice(0,pageSize),total=ranked.length;
 $('products').setAttribute('aria-busy','false');$('result-count').textContent=total.toLocaleString('he-IL')+' תוצאות';$('more').hidden=matches.length>=total;
 $('products').innerHTML=matches.map(p=>'<article class="card"><div class="product-symbol" aria-hidden="true">'+(p.weighted?'⚖':'⌑')+'</div><h3>'+E(HB.displayName(p))+'</h3><p class="muted">'+E(HB.packageLabel(p))+'</p><div class="barcode">'+E(p.barcode)+'</div><p class="coverage-badge">'+(coverageIndex.has(p.barcode)?'מחיר ב־'+coverageIndex.get(p.barcode)+' מתוך '+eligibleIds().length+' רשתות להשוואה · מחירים עדכניים בלבד':'אין כיסוי מחירים זמין')+'</p><div class="bottom"><span class="muted">'+(cart.some(i=>i.barcode===p.barcode)?'✓ כבר בסל':coverageIndex.has(p.barcode)?'מחיר ב־'+coverageIndex.get(p.barcode)+' רשתות':'כיסוי ייבדק בהשוואה')+'</span><button class="primary" data-add="'+E(p.barcode)+'">הוספה +</button></div></article>').join('')||'<div class="empty">לא נמצאו מוצרים. נסו שם קצר יותר או ברקוד.</div>';
}
function indexCoverage(parsed){const snapshots=HB.snapshots(networks,meta),allowed=new Set(eligibleIds());for(const [code,rows]of parsed){coverageIndex.set(code,[...rows.entries()].filter(([c,r])=>allowed.has(c)&&HB.priceStatus(r,snapshots[c],'last')==='תקין').length);}return parsed;}

function renderCart(){widerSuggestions.clear();save();$('cart-items').innerHTML=cart.map(i=>{const p=catalog.get(i.barcode);return '<div class="cart-row"><div><h3>'+E(p?HB.displayName(p):'מוצר שמור — '+i.barcode)+'</h3>'+provenanceBadge(i.barcode)+'<span class="muted">'+E(p?.weighted?'כמות בק״ג':HBOnline.packs(i.qty))+'</span><div class="barcode">'+E(i.barcode)+'</div><div id="cart-missing-'+E(i.barcode)+'" class="cart-missing"></div></div><label><span class="sr">כמות</span><button type="button" data-qty-adjust="-1" data-code="'+E(i.barcode)+'" aria-label="הפחת כמות">−</button><input aria-label="כמות '+E(p?.name||i.barcode)+'" type="number" min="'+(p?.weighted?'0.001':'1')+'" max="999" step="'+(p?.weighted?'0.001':'1')+'" value="'+i.qty+'" data-qty="'+E(i.barcode)+'" '+(!p?'disabled':'')+'><button type="button" data-qty-adjust="1" data-code="'+E(i.barcode)+'" aria-label="הוסף כמות">+</button></label><button class="remove" data-remove="'+E(i.barcode)+'">הסרה</button></div>';}).join('')||'<div class="empty"><h2>הסל מחכה לכם</h2><p>הוסיפו מוצרים מהקטלוג כדי לראות איפה משתלם לקנות.</p><a href="#search" class="button primary">לחיפוש מוצרים</a></div>';if(ready)renderCartMissing();}
function renderChainSelect(){$('chain-select').innerHTML=visibleNetworks().map(n=>{const state=serviceState(n);return '<label><input type="checkbox" data-chain="'+n.index+'" '+(selected.has(n.index)&&state.eligible?'checked':'')+' '+(!state.eligible?'disabled':'')+'>'+E(n.name)+'<small>'+E(state.label)+'</small></label>';}).join('');}
async function renderCompare(){const my=++compareGeneration;clearTimeout(offerExpiryTimer);$('promotions').textContent='';$('offers-panel').open=false;
 if(!ready){$('result-summary').textContent='טענו את המחירים כדי לראות היכן הסל משתלם.';$('comparison').innerHTML='<div class="empty">יש לטעון נתונים לפני ההשוואה.</div>';return;}
 if(!servicePlace){$('result-summary').textContent='בחרו עיר ואופן קבלה לפני ההשוואה.';$('comparison').innerHTML='<a class="button primary" href="#location">בחירת מיקום ואופן קבלה</a>';return;}
 if(!eligibleIds().length){$('result-summary').textContent='לא הוגדרו רשתות מתאימות לעיר ולאופן הקבלה. לא בוצעה השוואה.';$('comparison').innerHTML='<div class="empty">יש למלא אזורי שירות בקובץ config.js או לבחור עיר ואופן קבלה אחרים. אין כאן אימות שירות אוטומטי.</div>'+networkOrderCards();return;}
 if(!cart.length){$('result-summary').textContent='הסל ריק. התחילו בחיפוש מוצרים או בהעלאת קבלה.';$('comparison').innerHTML='<div class="empty">הוסיפו מוצרים לסל כדי להשוות.</div>';return;}
 $('comparison').innerHTML='<p class="loading" role="status">טוענים מחירים ובודקים כיסוי לסל…</p>';
 try{const records=new Map();for(const code of [...new Set(cart.map(i=>i.barcode))]){const chunk=await getChunk(code);if(my!==compareGeneration)return;records.set(code,chunk.get(code)||new Map());}
 for(const [key,value]of approved){if(!cart.some(i=>key.endsWith(':'+i.barcode)))continue;if(!records.has(value.barcode)){const chunk=await getChunk(value.barcode);if(my!==compareGeneration)return;records.set(value.barcode,chunk.get(value.barcode)||new Map());}}comparisonRecords=records;
 const snapshots=HB.snapshots(networks,meta),metric='last',mode=$('mode').value;
 const overview=HB.coverage(cart,records,networks.length,metric,Date.now(),snapshots).filter(r=>isEligible(r.chain));
 if(automatic){selected=new Set(HB.autoSelect(overview));renderChainSelect();}
 const selectedIds=[...selected].filter(isEligible);const allIds=visibleNetworks().map(n=>n.index);$('selection-status').textContent=(automatic?'בחירה אוטומטית: ':'בחירה ידנית: ')+selectedIds.length+' רשתות לקבוצה המשותפת ולמבצעים. בהשוואה משתתפות '+eligibleIds().length+' רשתות להשוואה; בדקו את תווית הזמינות של כל רשת.';const names=items=>items.map(i=>(catalog.has(i.barcode)?HB.displayName(catalog.get(i.barcode)):'שם המוצר חסר במקור — '+i.barcode)).join(', ');
 const fair=HB.commonAcross(cart,records,selectedIds,metric,Date.now(),snapshots);const fairRows=HB.compare(fair.included,eligibleIds(),records,'full',metric,Date.now(),snapshots).ranked;const fairTotals=new Map(fairRows.map(r=>[r.chain,r.total]));const fairBest=fair.chains.length>=2&&fair.included.length&&fairRows.length>=2?Math.min(...fairRows.map(r=>r.total)):null;
 $('result-summary').textContent=fairBest!==null?'הרשת הזולה ביותר: '+fairRows.filter(r=>r.total===fairBest).map(r=>networks[r.chain].name).join(' / ')+', '+money(fairBest)+', כיסוי '+fair.included.length+' מתוך '+cart.length+' סוגי מוצרים זהים, ללא דמי משלוח או איסוף.':'אין כרגע מספיק מוצרים משותפים להשוואה. שנו את בחירת הרשתות או את המוצרים בסל.';

 let out='<p class="warning">מחירי מוצרים בלבד; דמי משלוח או איסוף ומינימום הזמנה אינם נכללים בדירוג. מקור שאינו אונליין מסומן כהערכה. לא מובטח שזה מחיר הרכישה.</p><div class="panel comparison-main"><h2>'+(fair.included.length?'השוואת אותם '+fair.included.length+' מוצרים':'הסל בכל הרשתות')+'</h2><p class="muted">מחירי העמודה מתייחסים לאותה רשימת מוצרים וכמויות, לפני דמי משלוח או איסוף.</p><div class="table-wrap" tabindex="0" role="region" aria-label="טבלת מחירים, אפשר לגלול לצדדים"><table class="main-comparison"><thead><tr><th>רשת</th><th>מחיר להשוואה</th><th>נמצא מתוך הסל</th></tr></thead><tbody>'+[...overview].sort((a,b)=>{const ta=fairBest!==null&&fairTotals.has(a.chain)?fairTotals.get(a.chain):Infinity,tb=fairBest!==null&&fairTotals.has(b.chain)?fairTotals.get(b.chain):Infinity;return (ta-tb)||b.coverage-a.coverage;}).map(r=>{
 const shared=fair.chains.length>=2&&fair.included.length&&fairTotals.has(r.chain),best=shared&&fairTotals.get(r.chain)===fairBest;
 const adjusted=HB.adjusted(cart,records,r.chain,metric,Date.now(),snapshots,approved);
 return '<tr><td>'+E(networks[r.chain].name)+'<small>'+E(serviceState(networks[r.chain]).label)+'</small><small>'+E(HBOnline.priceLabel(networks[r.chain],HB_CONFIG))+'</small>'+(best?'<span class="tag">הזולה בקבוצה המשותפת</span>':'')+'</td><td>'+(shared?'<strong>'+money(fairTotals.get(r.chain))+'</strong><small>ל־'+fair.included.length+' מוצרים זהים</small>':!HB.fresh(snapshots[r.chain])?'לא זמין היום':'חסר מחיר לחלק מהמוצרים')+'</td><td>'+r.coverage+' מתוך '+cart.length+'<details><summary>חוסרים ופרטים</summary><p>'+E(names(cart.filter(i=>HB.priceStatus(records.get(i.barcode)?.get(r.chain),snapshots[r.chain],metric)!=='תקין'))||'אין חוסרים')+'</p>'+(r.coverage?'<p>מחיר חלקי: '+money(r.total)+' ל־'+r.coverage+' מתוך '+cart.length+' סוגי מוצרים — אינו בסיס להשוואה.</p>':'')+(adjusted.substitutions.length?'<p>עם חלופות שאושרו: '+money(adjusted.total)+' ל־'+adjusted.coverage+' מוצרים, כולל '+adjusted.substitutions.length+' חלופות שאושרו.</p>':'')+'</details></td></tr>';
 }).join('')+'</tbody></table></div><p class="muted">לא נכללו בהשוואה: '+E(names(fair.excluded)||'כל המוצרים נכללו')+'. הקבוצה נקבעה לפי הרשתות '+(automatic?'שנבחרו אוטומטית לפי כיסוי':'שבחרתם ידנית')+'.</p></div>';
 out+='<details class="comparison-extra"><summary>אפשרויות השוואה ופירוט נוסף</summary>';
 if(selectedIds.length<2){out+='<p class="warning">אין כרגע שתי רשתות שנבחרו עם כיסוי זמין. אפשר לבחור ידנית רשתות; כיסוי אפס אינו בהכרח חוסר מלאי.</p>';}
 else if(mode!=='coverage'){
 const result=HB.compare(cart,selectedIds,records,mode,metric,Date.now(),snapshots);
 if(mode==='common')out+='<p class="warning">נבחרו '+selectedIds.length+' רשתות. משווים '+result.included.length+' מתוך '+cart.length+' מוצרים משותפים. '+(result.excluded.length?'הוצאו מהחישוב אצל כולן: '+E(names(result.excluded))+'.':'כל הסל נכלל בחישוב.')+'</p>';
 if(result.ranked.length>=2){const win=result.ranked[0],ties=result.ranked.filter(r=>r.total===win.total);out+='<div class="winner"><div><span>'+(ties.length>1?'שוויון בעלות המוערכת':'העלות המוערכת הנמוכה ביותר לאותם מוצרים')+'</span><h2>'+E(ties.map(r=>networks[r.chain].name).join(' / '))+'</h2><p>'+result.included.length+' מוצרים זהים וכמויות זהות</p><small>לפי '+'מחיר אחד לרשת'+' · לפני משלוח</small></div><div><div class="total">'+money(win.total)+' <small>· ל־'+result.included.length+' סוגי מוצרים</small></div><p>פער מול הבאה בדירוג: '+money(result.savings)+'</p></div></div>';
 out+='<div class="panel"><h2>השוואת אותו סל</h2>'+result.ranked.map(r=>'<div class="rank"><strong>'+E(networks[r.chain].name)+'</strong><div class="track"><div class="bar" style="width:'+Math.max(2,100*r.total/Math.max(1,...result.ranked.map(r=>r.total)))+'%"></div></div><strong class="amount-count">'+money(r.total)+' <small>· ל־'+result.included.length+' סוגי מוצרים</small></strong></div>').join('')+'</div>';
 }else out+='<p class="warning">'+(mode==='common'?'אין מספיק מוצרים משותפים לרשתות שנבחרו.':'אין שתי רשתות שמכסות את כל הסל.')+' דירוג הכיסוי למעלה עדיין זמין. אפשר להחליף רשתות או מצב השוואה.</p>';
 }else out+='<p class="warning">מצב כיסוי וסכום: הסכום למוצרים הזמינים שונה בין הרשתות ואינו מחיר לסל מלא. להשוואה הוגנת השתמשו בעמודת המוצרים המשותפים; לפירוט הפער בין הרשתות שסימנתם בחרו ״מוצרים משותפים״.</p>';
 out+='</details>';
 const cheapest=HB.cheapest(cart,records,eligibleIds(),metric,Date.now(),snapshots);
 out+='<details class="comparison-extra"><summary>הכי זול לכל מוצר</summary><div class="panel"><h2>הכי זול לכל מוצר ברשתות המתאימות והעדכניות</h2><p class="muted">הבדיקה כוללת רק רשתות מתאימות עם סריקה עדכנית, לפי אותו ברקוד בלבד. זו אינה הצעת פיצול הזמנה; משלוחים ומינימום הזמנה אינם כלולים.</p><div class="table-wrap" tabindex="0" role="region" aria-label="טבלת מחירים, אפשר לגלול לצדדים"><table><thead><tr><th>מוצר וכמות</th><th>רשת</th><th>מחיר לכמות שבסל</th></tr></thead><tbody>'+cheapest.map(i=>'<tr><td>'+E((catalog.has(i.barcode)?HB.displayName(catalog.get(i.barcode)):'שם המוצר חסר במקור — '+i.barcode))+' × '+i.qty+'</td><td>'+E(i.chains.map(c=>networks[c].name).join(' / ')||'לא נמצא מחיר ברשת עדכנית')+'</td><td>'+(i.price===null?'—':money(Math.round(i.price*i.qty)))+'</td></tr>').join('')+'</tbody></table></div></div>';
 out+='</details>';
 if(allIds.length)out+='<details class="comparison-extra"><summary>מחיר כל מוצר בכל הרשתות</summary><div class="panel"><h2>מחיר לכל ברקוד בכל הרשתות</h2><p class="muted">בחירת הרשתות משמשת לקבוצה המשותפת, למצבי ההשוואה ולמבצעים. הטבלה מציגה גם סיבות לאי־זמינות. רשת שאינה מתאימה לעיר או שאינה עדכנית אינה משתתפת בחישוב.</p><div class="table-wrap" tabindex="0" role="region" aria-label="טבלת מחירים, אפשר לגלול לצדדים"><table><thead><tr><th>מוצר וכמות</th>'+allIds.map(c=>'<th>'+E(networks[c].name)+(selected.has(c)?' · בקבוצה המשותפת':'')+'</th>').join('')+'</tr></thead><tbody>'+cart.map(i=>'<tr><td>'+E((catalog.has(i.barcode)?HB.displayName(catalog.get(i.barcode)):'שם המוצר חסר במקור — '+i.barcode))+' × '+i.qty+'</td>'+allIds.map(c=>{const rec=records.get(i.barcode)?.get(c),valid=isEligible(c)&&rec&&HB.fresh(snapshots[c])&&rec[metric]!==null;return '<td>'+(valid?money(Math.round(rec[metric]*i.qty))+'<br><small class="muted">'+E(HBOnline.priceLabel(networks[c],HB_CONFIG))+'<br>סריקת רשת: '+E(date(snapshots[c]))+'</small>':E(!isEligible(c)?serviceState(networks[c]).label:HB.priceStatus(rec,snapshots[c],metric)))+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div></div>';
 if(allIds.length)out+='</details>';
 out+='<div class="actions"><button id="print">הדפסת ההשוואה</button><a class="button" href="#cart">עריכת הסל</a></div>';
 out+='<details class="comparison-extra"><summary>חלופות למוצרים שחסרים ברשתות</summary>'+renderMissing(records,snapshots,metric)+'</details>';$('comparison').innerHTML=out+networkOrderCards();
 }catch(e){if(my===compareGeneration)$('comparison').textContent='לא ניתן להשוות: '+e.message;}}

async function offerIndex(){if(offers!==null)return offers;if(offersLoading)return offersLoading;const requestGeneration=generation;const pending=(async()=>{const raw=await jsonFile('promotions.json.gz',true);if(requestGeneration!==generation)throw Error('טעינת מבצעים קודמת בוטלה');const built=HB.createPromotionIndex(raw);if(requestGeneration!==generation)throw Error('טעינת מבצעים קודמת בוטלה');offers=built;return built;})();offersLoading=pending;try{return await pending;}finally{if(offersLoading===pending)offersLoading=null;}}
function offerDescriptionHTML(text){
 return '<bdi dir="auto" class="offer-description">'+HB.promotionDescription(text).split(/(\d+(?:[.,]\d+)?(?:\s*₪)?)/g).map((part,i)=>i%2?'<bdi dir="ltr">'+E(part)+'</bdi>':E(part)).join('')+'</bdi>';
}
function offerEndLabel(p){return /^\d{4}-\d{2}-\d{2}$/.test(String(p.ends))?'עד סוף יום '+new Intl.DateTimeFormat('he-IL',{dateStyle:'short',timeZone:'Asia/Jerusalem'}).format(new Date(p.endTime)):'עד '+date(p.ends);}
async function renderOffers(){
 clearTimeout(offerExpiryTimer);const request=++offerSearchGeneration,my=compareGeneration,currentGeneration=generation;if(!$('offers-panel').open)return;
 try{
 if(offers===null)$('promotions').textContent='טוענים ומכינים אינדקס מבצעים פעם אחת…';
 const index=await offerIndex();if(request!==offerSearchGeneration||my!==compareGeneration||currentGeneration!==generation||!$('offers-panel').open)return;
 const stamps=HB.snapshots(networks,meta),now=Date.now(),allowed=new Set([...selected].filter(c=>isEligible(c)&&HB.fresh(stamps[c],now)));
 const found=HB.findPromotions(index,allowed,$('offer-query').value,now,40);
 $('promotions').innerHTML='<p class="muted">'+found.total+' מבצעים תואמים; מוצגים '+found.results.length+' לכל היותר. אינם מותאמים לסל ואינם משנים את הסכומים.</p><p class="offer-sources">'+[...allowed].map(c=>E(networks[c]?.name)+': '+(found.counts.get(c)||0)+' מבצעים תואמים').join(' · ')+'</p>'+found.results.map(p=>'<p class="offer-result"><span class="tag">'+E(networks[p.chain]?.name||'')+'</span> '+offerDescriptionHTML(p.description)+' <small>'+E(offerEndLabel(p))+(p.club_id&&String(p.club_id).trim()&&Number(p.club_id)!==0?' · מזהה מועדון: '+E(p.club_id):'')+'</small></p>').join('');
 // Expire visible timed offers even if the panel stays open. Date-only ends mean end of Israel day.
 const next=Math.min(30000,...found.results.map(p=>Math.max(1,p.endTime-Date.now()+1)));
 offerExpiryTimer=setTimeout(()=>{if($('offers-panel').open)renderOffers();},next);offerExpiryTimer?.unref?.();
 }catch{if(request===offerSearchGeneration&&my===compareGeneration&&currentGeneration===generation&&$('offers-panel').open)$('promotions').textContent='קובץ המבצעים לא נטען. סכומי הסל לא השתנו.';}
}
function scheduleOfferSearch(){++offerSearchGeneration;clearTimeout(offerTimer);if(!$('offers-panel').open)return;offerTimer=setTimeout(renderOffers,300);}

function renderInfo(){if(!ready){$('network-status').textContent=$('notice').textContent||'יש לטעון נתונים תקינים.';return;}const updates=HB.snapshots(networks,meta);$('network-status').innerHTML=visibleNetworks().map(n=>{const updated=updates[n.index];return '<article class="card"><h3>'+E(n.name)+'</h3><span class="tag '+(HB.fresh(updated)?'':'bad')+'">'+(HB.fresh(updated)?'סריקת הרשת עדכנית':'סריקת הרשת ישנה או לא ידועה')+'</span><p>'+E(serviceText(n))+'</p><p>'+E(HBOnline.priceLabel(n,HB_CONFIG))+'</p><p>סריקה בפועל: '+E(date(updated))+'</p><p class="muted">תאריך שינוי המחיר של מוצר יכול להיות ישן. הוא אינו פוסל מחיר כאשר סריקת הרשת עדכנית.</p></article>';}).join('');}

$('query').addEventListener('input',()=>{++searchGeneration;searchLoading();clearTimeout(searchTimer);searchTimer=setTimeout(()=>{pageSize=30;renderProducts();},100);});
$('more').onclick=()=>{pageSize+=30;renderProducts();};
$('products').onclick=e=>{const button=e.target.closest('[data-add]');if(!button)return;const code=button.dataset.add,p=catalog.get(code);if(!p)return;const old=cart.find(i=>i.barcode===code);clearApprovals(code);if(old){if(old.qty>=999)return;old.qty=Math.min(999,old.qty+1);}else cart.push({barcode:code,qty:1});automatic=true;save();renderProducts();toast('נוסף לסל: '+HB.displayName(p));};
$('cart-items').addEventListener('change',e=>{const code=e.target.dataset.qty;if(code)setQuantity(code,Number(e.target.value));});

$('cart-items').onclick=e=>{const adjust=e.target.closest('[data-qty-adjust]');if(adjust?.dataset.qtyAdjust!==undefined){adjustQuantity(adjust.dataset.code,Number(adjust.dataset.qtyAdjust));return;}const direct=e.target.closest('[data-suggested-replace]');if(direct){replaceSuggested(direct.dataset.suggestedReplace);return;}const missing=e.target.closest('[data-missing-networks]');if(missing){openMissingNetworks(missing.dataset.missingNetworks);return;}const wider=e.target.closest('[data-wider]');if(wider){openCoverageChoices(wider.dataset.wider);return;}const a=e.target.closest('[data-alt]');if(a){openAlternatives(a.dataset.alt,Number(a.dataset.targetChain));return;}const code=e.target.closest('[data-remove]')?.dataset.remove;if(code){clearApprovals(code);cartProvenance.delete(code);cart=cart.filter(i=>i.barcode!==code);automatic=true;renderCart();}};
$('clear').onclick=startNewCart;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(HBOnline.list(cart,catalog,HB.displayName));toast('הרשימה הועתקה');}catch{toast('ההעתקה חסומה. אפשר לסמן ולהעתיק מהרשימה בחלון המעבר לרשת.');}};
$('chain-select').onchange=e=>{const c=Number(e.target.dataset.chain);if(!Number.isInteger(c)||!isEligible(c))return;automatic=false;e.target.checked?selected.add(c):selected.delete(c);renderCompare();};$('metric').onchange=renderCompare;$('mode').onchange=renderCompare;
$('folder').onchange=e=>{const map=new Map();for(const f of e.target.files){if(map.has(f.name)){toast('נמצאו שמות כפולים בתיקייה. בחרו תיקיית ייצוא אחת בלבד.');return;}map.set(f.name,f);}files=map;load();};$('reload').onclick=()=>{files=null;load();};
document.addEventListener('click',e=>{if(e.target.id==='print')window.print();});window.addEventListener('hashchange',route);save();route();if(location.protocol==='file:'){$('notice').textContent='בחרו את תיקיית הייצוא במסך ״הנתונים שלנו״ כדי לטעון מחירים מהמחשב.';if(!location.hash)location.hash='#home';}else load();

$('auto-chains').onclick=()=>{automatic=true;renderCompare();};

$('offers-panel').addEventListener('toggle',()=>{++offerSearchGeneration;clearTimeout(offerTimer);clearTimeout(offerExpiryTimer);if($('offers-panel').open)renderOffers();});$('offer-query').addEventListener('input',scheduleOfferSearch);
function renderMissing(records,snapshots,metric){let html='<div class="panel"><h2>מוצרים בסל שחסרים ברשתות שנבחרו</h2><p class="muted">חלופה דומה אינה אותו ברקוד. היא אינה נכנסת לסכום עד לאישור; גם לאחר אישור הסכום עם החלופות יוצג בנפרד מהשוואת הברקודים המקוריים.</p>';let count=0;for(const item of cart){for(const chain of selected){if(!isEligible(chain)||!HB.fresh(snapshots[chain])||HB.priceStatus(records.get(item.barcode)?.get(chain),snapshots[chain],metric)==='תקין')continue;count++;const accepted=approved.get(chain+':'+item.barcode);html+='<div class="missing-row"><div><strong>'+E(catalog.has(item.barcode)?HB.displayName(catalog.get(item.barcode)):item.barcode)+'</strong><p>'+E(networks[chain].name)+(accepted?' — קיימת חלופה שאושרה':' — אין מחיר ברשת')+'</p>'+(accepted?'<p class="tag">חלופה שאושרה: '+E(catalog.has(accepted.barcode)?HB.displayName(catalog.get(accepted.barcode)):accepted.barcode)+' × '+accepted.qty+' · ברקוד חלופי: '+E(accepted.barcode)+'</p>':'')+'</div><button data-alt="'+E(item.barcode)+'" data-target-chain="'+chain+'">חלופה דומה</button>'+(accepted?'<button data-undo-alt="'+E(item.barcode)+'" data-target-chain="'+chain+'">ביטול החלופה</button>':'')+'</div>';}}return html+(count?'':'<p>אין חוסרים ברשתות העדכניות שנבחרו.</p>')+'</div>';}
async function openAlternatives(barcode,chain){const item=cart.find(i=>i.barcode===barcode),original=catalog.get(barcode);if(!item||!original||!isEligible(chain))return;const request=++alternativeRequest,currentGeneration=generation;$('alternative-title').textContent='חלופה ל־'+HB.displayName(original)+' ב־'+networks[chain].name;$('alternative-content').textContent='מחפשים מוצרים בעלי מילות מפתח, יחידה וכמות דומות…';alternativeChoices=[];alternativeContext=null;if(!$('alternative-dialog').open)$('alternative-dialog').showModal();try{const candidates=HB.similarProducts(original,catalog).filter(p=>!cart.some(i=>i.barcode===p.barcode)).slice(0,100),found=[];const stamps=HB.snapshots(networks,meta),metric='last';const grouped=new Map();for(const p of candidates){if(!grouped.has(p.barcode[0]))grouped.set(p.barcode[0],[]);grouped.get(p.barcode[0]).push(p);}for(const group of grouped.values()){const chunk=await getChunk(group[0].barcode);if(request!==alternativeRequest||currentGeneration!==generation||!$('alternative-dialog').open)return;for(const p of group){const record=chunk.get(p.barcode)?.get(chain);if(HB.priceStatus(record,stamps[chain],metric)==='תקין')found.push({...p,record});}}alternativeChoices=found.sort((a,b)=>b.similarity-a.similarity||a.record[metric]-b.record[metric]).slice(0,8);alternativeContext={barcode,chain,qty:item.qty,generation:currentGeneration};$('alternative-content').innerHTML='<p class="warning">הצעות לפי סוג מוצר (המילה הראשונה), שם וגודל; מוצרי טיפוח וניקיון נפסלים. זה לא אותו ברקוד, ואין כאן אימות רכיבים, איכות או התאמה תזונתית. בדקו את הפרטים לפני אישור. הכמות והמחיר הם לאריזת החלופה כפי שמוצגת.</p>'+alternativeChoices.map((p,i)=>'<article class="alternative-card"><h3>'+E(HB.displayName(p))+'</h3><p>'+E(HB.packageLabel(p))+' · '+money(p.record[metric])+(p.weighted?' לק״ג':' לאריזה')+'</p><p class="barcode">ברקוד אחר: '+E(p.barcode)+'</p><label>כמות חלופה<input type="number" id="alt-qty-'+i+'" min="'+(p.weighted?.001:1)+'" max="999" step="'+(p.weighted?.001:1)+'" value="'+item.qty+'"></label><button class="primary" data-approve-alt="'+i+'">אישור חלופה לרשת הזו</button></article>').join('')+(alternativeChoices.length?'':'<p>אין חלופה מתאימה. לא נמצא מוצר מאותו סוג, ביחידה ובגודל דומים ועם מחיר ברשת. אין שינוי בסל.</p>');}catch(e){if(request===alternativeRequest)$('alternative-content').textContent='לא ניתן לטעון חלופות: '+e.message;}}
async function approveAlternative(index){const context=alternativeContext,p=alternativeChoices[index];if(!context||!p||context.generation!==generation||!isEligible(context.chain))return;const original=cart.find(i=>i.barcode===context.barcode);if(!original||original.qty!==context.qty){toast('הסל השתנה. פתחו שוב את חיפוש החלופה.');return;}const qty=Number($('alt-qty-'+index).value);if(!Number.isFinite(qty)||qty<=0||qty>999||(!p.weighted&&!Number.isInteger(qty))){toast('הזינו כמות תקינה לחלופה.');return;}if(!confirm('לאשר '+HB.displayName(p)+' × '+qty+' כחלופה ב־'+networks[context.chain].name+'? זהו ברקוד אחר. הסכום עם החלופה יוצג בנפרד.'))return;approved.set(context.chain+':'+context.barcode,{barcode:p.barcode,qty:Math.round(qty*1000)/1000});saveAlternatives();$('alternative-dialog').close();++alternativeRequest;alternativeContext=null;toast('החלופה אושרה לרשת הזו בלבד');await renderCompare();if(location.hash==='#cart')renderCart();}
$('comparison').addEventListener('click',e=>{const order=e.target.closest('[data-order]');if(order){openOrder(Number(order.dataset.order));return;}const a=e.target.closest('[data-alt]');if(a){openAlternatives(a.dataset.alt,Number(a.dataset.targetChain));return;}const undo=e.target.closest('[data-undo-alt]');if(undo){approved.delete(undo.dataset.targetChain+':'+undo.dataset.undoAlt);saveAlternatives();renderCompare();}});
$('alternative-content').addEventListener('click',e=>{const missing=e.target.closest('[data-alt]');if(missing){openAlternatives(missing.dataset.alt,Number(missing.dataset.targetChain));return;}const wider=e.target.closest('[data-replace-coverage]');if(wider){approveCoverage(Number(wider.dataset.replaceCoverage));return;}const b=e.target.closest('[data-approve-alt]');if(b)approveAlternative(Number(b.dataset.approveAlt));});
$('alternative-close').onclick=()=>{$('alternative-dialog').close();++alternativeRequest;alternativeContext=null;};

async function approvedCartLine(item,chain,stamps,metric){
 const accepted=approved.get(chain+':'+item.barcode);if(!accepted)return null;
 const chunk=await getChunk(accepted.barcode),record=chunk.get(accepted.barcode)?.get(chain);
 const status=HB.priceStatus(record,stamps[chain],metric);
 return '<p class="approved-cart"><strong>'+E(networks[chain].name)+' — חלופה אושרה: '+E(HB.displayName(catalog.get(accepted.barcode)))+'</strong> · '+(status==='תקין'?money(Math.round(record[metric]*accepted.qty))+' לכמות שאושרה':E('מחיר החלופה אינו זמין כעת'))+' · ברקוד חלופי: '+E(accepted.barcode)+'</p>';
}
async function coverageOptions(barcode,isCurrent=()=>true){
 const metric='last',stampKey=Math.floor(Date.now()/60000),key=generation+':'+metric+':'+stampKey+':'+barcode+':'+cart.map(i=>i.barcode).sort().join(',');
 if(coverageSuggestionCache.has(key))return coverageSuggestionCache.get(key);
 const original=catalog.get(barcode);if(!original)return {baseCount:0,choices:[]};
 const stamps=HB.snapshots(networks,meta),validCount=rows=>networks.filter(n=>isEligible(n.index)&&HB.priceStatus(rows?.get(n.index),stamps[n.index],metric)==='תקין').length;
 const originalRows=(await getChunk(barcode)).get(barcode),baseCount=validCount(originalRows);
 const candidates=HB.similarProducts(original,catalog).filter(p=>Math.abs(p.sizeRatio-1)<.00001);
 const groups=new Map();for(const p of candidates){if(!groups.has(p.barcode[0]))groups.set(p.barcode[0],[]);groups.get(p.barcode[0]).push(p);}
 const found=[];for(const group of groups.values()){if(!isCurrent())throw Error('בדיקה קודמת בוטלה');const chunk=await getChunk(group[0].barcode);for(const p of group){const coverage=validCount(chunk.get(p.barcode));if(coverage>baseCount)found.push({...p,coverage});}}
 const result={baseCount,choices:found.sort((a,b)=>b.coverage-a.coverage||b.similarity-a.similarity||a.barcode.localeCompare(b.barcode)).slice(0,8)};
 if(!isCurrent())throw Error('בדיקה קודמת בוטלה');
 if(coverageSuggestionCache.size>=50)coverageSuggestionCache.clear();coverageSuggestionCache.set(key,result);return result;
}
function replaceSuggested(barcode){
 const saved=widerSuggestions.get(barcode),item=cart.find(i=>i.barcode===barcode);
 if(!saved||!item||saved.generation!==generation||item.qty!==saved.qty)return;
 alternativeChoices=[saved.candidate];alternativeContext={kind:'coverage',barcode,qty:item.qty,generation};
 approveCoverage(0);
}
async function openMissingNetworks(barcode){
 const item=cart.find(i=>i.barcode===barcode);if(!item)return;const request=++alternativeRequest,my=generation;
 alternativeContext=null;alternativeChoices=[];$('alternative-title').textContent='רשתות ללא מחיר למוצר המקורי';$('alternative-content').textContent='בודקים את הרשתות והחלופות שאושרו…';
 if(!$('alternative-dialog').open)$('alternative-dialog').showModal();
 try{
 const chunk=await getChunk(barcode),stamps=HB.snapshots(networks,meta),metric='last';let html='';
 for(const n of networks){if(!isEligible(n.index)||!HB.fresh(stamps[n.index])||HB.priceStatus(chunk.get(barcode)?.get(n.index),stamps[n.index],metric)==='תקין')continue;
 const accepted=await approvedCartLine(item,n.index,stamps,metric);
 html+='<article class="alternative-card">'+(accepted||'<p>'+E(n.name)+' — אין מחיר ברשת</p>')+'<button data-alt="'+E(barcode)+'" data-target-chain="'+n.index+'">'+(accepted?'שינוי חלופה':'בחירת חלופה לרשת הזו')+'</button></article>';}
 if(request!==alternativeRequest||my!==generation||!$('alternative-dialog').open)return;
 $('alternative-content').innerHTML=html||'<p>אין רשתות עדכניות שחסר בהן מחיר למוצר המקורי.</p>';
 }catch(e){if(request===alternativeRequest)$('alternative-content').textContent='בדיקת הרשתות נכשלה: '+e.message;}
}
async function renderCartMissing(){
 const request=++cartMissingRequest,my=generation,snapshot=cart.map(i=>({...i})),current=()=>request===cartMissingRequest&&my===generation;
 try{for(const item of snapshot){
 const chunk=await getChunk(item.barcode);if(!current())return;const target=$('cart-missing-'+item.barcode);if(!target)continue;
 const stamps=HB.snapshots(networks,meta),metric='last';
 const covered=networks.filter(n=>isEligible(n.index)&&HB.priceStatus(chunk.get(item.barcode)?.get(n.index),stamps[n.index],metric)==='תקין').length;
 const missing=networks.filter(n=>isEligible(n.index)&&HB.fresh(stamps[n.index])&&HB.priceStatus(chunk.get(item.barcode)?.get(n.index),stamps[n.index],metric)==='אין מחיר ברשת');
 let html='<p class="coverage-badge">מחיר ב־'+covered+' מתוך '+networks.length+' רשתות · אותו ברקוד</p>';
 for(const n of missing){const line=await approvedCartLine(item,n.index,stamps,metric);if(line)html+=line;}
 if(missing.length)html+='<button data-missing-networks="'+E(item.barcode)+'">רשתות ללא מחיר למוצר המקורי ('+missing.length+')</button>';
 if(!current())return;target.innerHTML=html+(covered<eligibleIds().length?'<p class="muted">בודקים הצעה עם כיסוי רחב יותר…</p>':'');
 if(covered<eligibleIds().length){
 const result=await coverageOptions(item.barcode,current);if(!current())return;
 const candidate=result.choices[0];
 if(candidate){widerSuggestions.set(item.barcode,{candidate,qty:item.qty,generation:my});html+='<div class="specific-suggestion"><strong>אפשר להחליף ל־'+E(HB.displayName(candidate))+'</strong><p>מחיר ב־'+candidate.coverage+' רשתות לעומת '+covered+' · אותו גודל, ברקוד אחר: '+E(candidate.barcode)+'</p><button class="primary" data-suggested-replace="'+E(item.barcode)+'">החלף</button><small>באישור מפורש; כיסוי אינו מבטיח מחיר זול יותר.</small></div>';}
 else html+='<p class="muted">אין כרגע מוצר דומה באותו גודל עם כיסוי רחב יותר.</p>';
 }
 if(!current())return;target.innerHTML=html;
 }}catch(e){if(current())toast('בדיקת חוסרים בסל לא הושלמה: '+e.message);}
}

// Whole-cart replacement is distinct from per-chain substitution and requires explicit confirmation.
async function openCoverageChoices(barcode){
 const item=cart.find(i=>i.barcode===barcode),original=catalog.get(barcode);if(!item||!original)return;
 const request=++alternativeRequest,my=generation;alternativeChoices=[];alternativeContext=null;
 $('alternative-title').textContent='מוצר דומה עם כיסוי רחב יותר';
 $('alternative-content').textContent='בודקים מחירים לאותו גודל ומשפחת מוצר…';
 if(!$('alternative-dialog').open)$('alternative-dialog').showModal();
 try{
 const result=await coverageOptions(barcode,()=>request===alternativeRequest&&my===generation&&$('alternative-dialog').open);
 if(request!==alternativeRequest||my!==generation||!$('alternative-dialog').open)return;
 const baseCount=result.baseCount,found=result.choices;alternativeChoices=found;
 alternativeContext={kind:'coverage',barcode,qty:item.qty,generation:my};
 $('alternative-content').innerHTML='<p class="warning">המוצר המקורי מתומחר ב־'+baseCount+' רשתות. אלה ברקודים אחרים מאותה משפחה ובאותו גודל, ללא אימות רכיבים. אישור יחליף את המוצר בסל כולו, עם אותה כמות. כיסוי אינו הבטחה למחיר זול יותר.</p>'+alternativeChoices.map((p,i)=>'<article class="alternative-card"><h3>'+E(HB.displayName(p))+'</h3><p>מחיר ב־'+p.coverage+' רשתות</p><p class="barcode">ברקוד אחר: '+E(p.barcode)+'</p><button data-replace-coverage="'+i+'">החלפת המוצר בסל לאחר אישור</button></article>').join('')+(found.length?'':'<p>אין כרגע מוצר דומה באותו גודל עם כיסוי רחב יותר. הסל נשאר כפי שהוא.</p>');
 }catch(e){if(request===alternativeRequest)$('alternative-content').textContent='בדיקת הכיסוי לא הושלמה: '+e.message;}
}
function approveCoverage(index){
 const c=alternativeContext,p=alternativeChoices[index];if(c?.kind!=='coverage'||!p||c.generation!==generation)return;
 const item=cart.find(i=>i.barcode===c.barcode);if(!item||item.qty!==c.qty){toast('הסל השתנה. פתחו שוב את ההצעות.');return;}
 if(!confirm('להחליף בסל את '+HB.displayName(catalog.get(c.barcode))+' ב־'+HB.displayName(p)+'? ברקוד אחר: '+p.barcode+'. הכמות '+item.qty+' תתווסף למוצר הקיים אם הוא כבר בסל. ההשוואה תחושב מחדש.'))return;
 const existing=cart.find(i=>i.barcode===p.barcode);
 if(existing&&existing.qty+item.qty>999){toast('הכמות הכוללת גדולה מדי.');return;}
 clearApprovals(c.barcode);clearApprovals(p.barcode);
 if(existing){existing.qty=Math.round((existing.qty+item.qty)*1000)/1000;cart=cart.filter(i=>i!==item);}else item.barcode=p.barcode;
 cartProvenance.set(p.barcode,{original:c.barcode});cartProvenance.delete(c.barcode);cart=HB.validCart(cart);automatic=true;save();
 $('alternative-dialog').close();alternativeContext=null;++alternativeRequest;renderCart();renderProducts();toast('המוצר הוחלף באישורכם; ההשוואה תשתמש בברקוד החדש');
}


function visibleNetworks(){return networks.filter(n=>HBOnline.settings(n,HB_CONFIG).visible!==false&&(!servicePlace||HBOnline.settings(n,HB_CONFIG)[servicePlace.mode]!==false));}
function serviceState(n){return HBOnline.service(n,HB_CONFIG,servicePlace);}
function isEligible(c){return !!networks[c]&&serviceState(networks[c]).eligible;}
function eligibleIds(){return networks.filter(n=>serviceState(n).eligible).map(n=>n.index);}
function serviceText(n){const state=serviceState(n);if(!servicePlace||state.status==='unsupported'||state.status==='hidden')return state.label;const fee=HBOnline.fee(n,HB_CONFIG,servicePlace.mode);return state.label+' · '+(servicePlace.mode==='delivery'?'משלוח משוער: ':'איסוף משוער: ')+(fee===null?'יש לבדוק באתר הרשת':money(fee));}
function networkOrderCards(){return '<section class="online-chains panel"><h2>ממשיכים להזמנה באתר הרשת</h2><p>לצד כל רשת מצוין אם יש לבדוק זמינות לכתובת באתר הרשת. אזורי שירות מוגדרים הם סינון לפי עיר, לא בדיקת כתובת בזמן אמת. דמי המשלוח אינם נכללים בסכום ההשוואה. בהמשך תבחרו מועד קבלה באתר הרשת.</p><div class="grid">'+visibleNetworks().map(n=>{const allowed=isEligible(n.index),url=HBOnline.destination(n,HB_CONFIG);return '<article class="card online-chain"><h3>'+E(n.name)+'</h3><p>'+E(serviceText(n))+'</p><p class="muted">'+E(HBOnline.priceLabel(n,HB_CONFIG))+'</p><button data-order="'+n.index+'" '+(!allowed||!url||!cart.length?'disabled':'')+'>המשך להזמנה באתר הרשת</button>'+(!url?'<small>קישור הזמנות טרם הוגדר</small>':'')+'</article>';}).join('')+'</div></section>';}
function renderLocation(){
 $('areas-import-status').textContent=serviceAreasStatus;
 $('service-cities').innerHTML=HBOnline.cities(HB_CONFIG).map(c=>'<option value="'+E(c)+'"></option>').join('');
 $('location-summary').textContent=servicePlace?servicePlace.city+' · '+(servicePlace.mode==='delivery'?'משלוח':'איסוף עצמי'):'בחרו עיר ואופן קבלה כדי להתאים רשתות';
 $('service-availability').innerHTML=servicePlace?'<p>'+eligibleIds().length+' רשתות להשוואה; בחלקן יש לבדוק זמינות לכתובת באתר הרשת</p>'+visibleNetworks().map(n=>'<p><strong>'+E(n.name)+'</strong> — '+E(serviceState(n).label)+'</p>').join(''):'';
 if(servicePlace){$('service-city').value=servicePlace.city;$('service-pickup').checked=servicePlace.mode==='pickup';$('service-delivery').checked=servicePlace.mode==='delivery';}
}
function applyService(city,mode){
 city=String(city||'').trim().replace(/\s+/g,' ');if(!city||city.length>80||!['delivery','pickup'].includes(mode)){$('location-feedback').textContent='הזינו עיר ובחרו משלוח או איסוף עצמי.';return false;}
 servicePlace={city,mode};++serviceRevision;++compareGeneration;++searchGeneration;++cartMissingRequest;++offerSearchGeneration;++alternativeRequest;
 alternativeContext=null;widerSuggestions.clear();coverageSuggestionCache.clear();coverageIndex.clear();clearTimeout(offerTimer);clearTimeout(offerExpiryTimer);
 if($('order-dialog').open)$('order-dialog').close();if($('alternative-dialog').open)$('alternative-dialog').close();
 $('offers-panel').open=false;$('promotions').textContent='';$('comparison').innerHTML='';$('result-summary').textContent='';
 for(const chunk of priceCache.values())indexCoverage(chunk);automatic=true;selected=new Set(eligibleIds());renderLocation();renderChainSelect();
 $('location-feedback').textContent=eligibleIds().length?'העיר ואופן הקבלה עודכנו במכשיר בלבד. רשת עם תווית בדיקת זמינות אינה מאשרת שירות לכתובת.':'לא נמצאו רשתות מתאימות לפי ההגדרות. בעל האתר צריך למלא אזורי שירות ב־config.js.';
 window.HB_UX?.update();if(ready){renderProducts();if(location.hash==='#cart')renderCart();}return true;
}
function openOrder(c){
 const n=networks[c],url=n&&HBOnline.destination(n,HB_CONFIG);if(!url||!isEligible(c)||!cart.length)return false;
 const stamps=HB.snapshots(networks,meta),items=cart.map(i=>{const a=approved.get(c+':'+i.barcode);return a&&HB.priceStatus(comparisonRecords.get(i.barcode)?.get(c),stamps[c],'last')!=='תקין'&&HB.priceStatus(comparisonRecords.get(a.barcode)?.get(c),stamps[c],'last')==='תקין'?{barcode:a.barcode,qty:a.qty}:i;});
 $('order-title').textContent='המשך להזמנה ב־'+n.name;$('order-service').textContent=serviceText(n)+(serviceState(n).status==='verify'?'':' · יש לאמת זמינות לכתובת באתר הרשת');
 $('order-list').value=HBOnline.list(HB.validCart(items),catalog,HB.displayName);
 $('order-missing').textContent='העתקת הרשימה אינה מאשרת מלאי, מחירים או הזמנה. ייתכנו מוצרים ללא מחיר ותחליפים שאישרתם; בדקו את כולם באתר הרשת.';
 $('order-copy-status').textContent='';$('order-continue').href=url;orderRevision=serviceRevision;$('order-dialog').showModal();return true;
}
$('location-form').addEventListener('submit',e=>{e.preventDefault();if(applyService($('service-city').value,$('service-pickup').checked?'pickup':'delivery'))location.hash=eligibleIds().length?'#search':'#location';});
$('order-close').onclick=()=>{$('order-dialog').close();$('order-list').value='';};
$('order-copy').onclick=async()=>{if(orderRevision!==serviceRevision)return;try{await navigator.clipboard.writeText($('order-list').value);$('order-copy-status').textContent='הרשימה הועתקה. אפשר להדביק אותה או להיעזר בה באתר הרשת.';}catch{$('order-copy-status').textContent='הדפדפן חסם העתקה. סמנו את הטקסט והעתיקו ידנית.';}};
$('order-continue').onclick=e=>{if(orderRevision!==serviceRevision){e.preventDefault();$('order-dialog').close();}};


// Optional local configuration data, never customer location or receipt content.
async function loadConfiguredAreas(){
 const my=generation;try{
  const raw=await jsonFile(HB_CONFIG.serviceAreasFile||'chain_service_areas.json',true);if(my!==generation)return;
  if(raw){const sources=HBOnline.applyAreas(raw,HB_CONFIG);serviceAreasStatus='נטענו אזורי שירות עבור '+sources.map(s=>HB_CONFIG.chains[s]?.name||s).join(', ')+'.';}
 }catch(e){if(my===generation)serviceAreasStatus='לא נטענו אזורי השירות: '+e.message;}
}
$('areas-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>1024*1024)throw Error('קובץ אזורי השירות גדול מדי (עד 1MB).');const raw=JSON.parse((await file.text()).replace(/^\uFEFF/,''));const sources=HBOnline.applyAreas(raw,HB_CONFIG);
  serviceAreasStatus='נטענו מקומית אזורי שירות עבור '+sources.map(s=>HB_CONFIG.chains[s]?.name||s).join(', ')+'.';
  if(servicePlace)applyService(servicePlace.city,servicePlace.mode);else renderLocation();if(ready)renderInfo();
 }catch(error){serviceAreasStatus='לא נטענו אזורי השירות: '+error.message;renderLocation();}
 e.target.value='';
});
