/* All receipt processing is local. No receipt text, image, payment or identity data is sent or persisted. */
(function(){'use strict';
let summaryRequest=0,receiptRows=[],reviewGeneration=-1,reviewEpoch=0,ocrEpoch=0,ocrWorker=null,ocrLoading=null;
const el=id=>document.getElementById(id),escape=E;
function say(text){el('receipt-status').textContent=text;}
function update(){updateChainSummary();
 const types=cart.length,packs=cart.filter(i=>!catalog.get(i.barcode)?.weighted).reduce((s,i)=>s+i.qty,0),kg=cart.filter(i=>catalog.get(i.barcode)?.weighted).reduce((s,i)=>s+i.qty,0);
 el('saved-cart-banner').hidden=!!types||!pendingSavedCart.length;
 el('save-cart-choice').checked=saveCartEnabled;
 el('saved-cart-count').textContent=!types&&pendingSavedCart.length?HBOnline.productsCount(pendingSavedCart.length)+' מסל קודם':'';
 el('basket-count').textContent=types?HBOnline.productsCount(types)+(packs&&packs!==types?' · '+HBOnline.packs(packs):'')+(kg?' · '+Number(kg.toFixed(3))+' ק״ג':''):'הסל ריק — בואו נתחיל';
 el('basket-lines').innerHTML=cart.map(i=>'<div class="mini-row"><span>'+escape(HB.displayName(catalog.get(i.barcode)))+provenanceBadge(i.barcode)+'</span><button data-mini-adjust="-1" data-code="'+i.barcode+'" aria-label="הפחת כמות">−</button><label class="sr" for="mini-'+i.barcode+'">כמות</label><input id="mini-'+i.barcode+'" type="number" min="'+(catalog.get(i.barcode)?.weighted?.001:1)+'" max="999" step="'+(catalog.get(i.barcode)?.weighted?.001:1)+'" value="'+i.qty+'" data-mini-qty="'+i.barcode+'"><button data-mini-adjust="1" data-code="'+i.barcode+'" aria-label="הוסף כמות">+</button><button data-mini-remove="'+i.barcode+'">הסר</button></div>').join('')||'<p>חפשו מוצר או העלו קבלה כדי לבנות סל.</p>';
 const path=location.hash.slice(1),active=!servicePlace||path==='location'?1:['compare','networks'].includes(path)?3:2;
 for(const [id,n]of [['step-location',1],['step-build',2],['step-compare',3]]){el(id).setAttribute('aria-current',n===active?'step':'false');}
 el('basket-next').href=!servicePlace?'#location':types?'#compare':'#search';el('basket-next').textContent=!servicePlace?'בחירת מיקום':types?'השווה מחירים':'בנה סל';
 el('networks-empty').hidden=!!types;window.HB_LAYOUT?.sync();
 el('home-data-status').innerHTML=ready?'<strong>המחירים מוכנים להשוואה</strong><p>'+'מצב כל הרשתות מופיע במונה האחיד בראש העמוד · '+catalog.size.toLocaleString('he-IL')+' מוצרים במאגר. עדכניות כל רשת נבדקת בנפרד.</p>':'<strong>לפני שמתחילים: מחברים את המחירים</strong><p>בחבילה המקומית בחרו פעם אחת את תיקיית הנתונים שלכם. אין כאן מחירי דוגמה.</p><a class="button" href="#info">טעינת המחירים מהמחשב</a>';
 const request=++summaryRequest,my=generation;
 if(!types){el('basket-estimate').textContent='סכום יופיע לאחר הוספת מוצרים';return;}
 if(!servicePlace||!eligibleIds().length){el('basket-estimate').textContent='בחרו עיר ואופן קבלה כדי לראות רשתות להשוואה';return;}
 if(!ready){el('basket-estimate').textContent='טענו מחירים כדי לחשב את הסל';return;}
 el('basket-estimate').textContent='בודקים הערכת מחיר לסל…';
 (async()=>{try{
 const records=new Map();for(const item of cart.map(i=>({...i}))){const chunk=await getChunk(item.barcode);if(request!==summaryRequest||my!==generation)return;records.set(item.barcode,chunk.get(item.barcode)||new Map());}
 const stamps=HB.snapshots(networks,meta),rows=HB.coverage(cart,records,networks.length,'last',Date.now(),stamps).filter(r=>isEligible(r.chain)&&r.coverage===cart.length).sort((a,b)=>a.total-b.total);
 if(request!==summaryRequest||my!==generation)return;
 el('basket-estimate').textContent=rows.length?money(rows[0].total)+' · הערכת סל מלא ב־'+networks[rows[0].chain].name+' · מחיר מוצרים, לפני משלוח ודמי שירות':'אין כרגע מחיר לסל מלא ברשת אחת; אפשר להשוות את המוצרים המשותפים';
 }catch{if(request===summaryRequest)el('basket-estimate').textContent='לא הצלחנו לחשב כרגע. הסל נשמר; נסו שוב בהשוואה.';}})();
}
window.HB_UX={update};
el('basket-lines').addEventListener('change',e=>{const code=e.target.dataset.miniQty;if(code){if(!setQuantity(code,Number(e.target.value)))update();}});
el('basket-lines').addEventListener('click',e=>{
 const step=e.target.closest('[data-mini-adjust]');if(step?.dataset.miniAdjust!==undefined){adjustQuantity(step.dataset.code,Number(step.dataset.miniAdjust));return;}
 const b=e.target.closest('[data-mini-remove]');if(!b)return;clearApprovals(b.dataset.miniRemove);cartProvenance.delete(b.dataset.miniRemove);cart=cart.filter(i=>i.barcode!==b.dataset.miniRemove);automatic=true;save();renderProducts();if(location.hash==='#cart')renderCart();
});
el('resume-saved-cart').onclick=()=>{resumeSavedCart();update();};
el('new-basket').onclick=startNewCart;el('new-basket-saved').onclick=startNewCart;
el('save-cart-choice').onchange=e=>{setCartSaving(e.target.checked);update();};
function closeDrawer(){el('basket-drawer').open=false;}
el('receipt').addEventListener('focusin',closeDrawer);
el('receipt').addEventListener('pointerdown',closeDrawer);
el('basket-drawer').addEventListener('toggle',()=>{if(window.HB_LAYOUT)window.window.HB_LAYOUT?.sync();});
if(window.ResizeObserver){new ResizeObserver(()=>window.HB_LAYOUT?.sync()).observe(document.querySelector('.basket-dock'));}
async function rowCandidates(row,ix){
 if(row.ignored&&!row.manual)return[];
 const wide=HBReceipt.candidates(row,ix,2000,coverageIndex),my=generation,groups=new Map();
 for(const p of wide)if(!groups.has(p.barcode[0]))groups.set(p.barcode[0],p.barcode);
 for(const code of groups.values()){await getChunk(code);if(my!==generation)throw Error('הנתונים השתנו. בדקו שוב את השורות.');}
 return HBReceipt.candidates(row,ix,4,coverageIndex);
}
function setRowProduct(row){
 if(row.sourceQty===undefined)row.sourceQty=row.qty;
 const p=catalog.get(row.selected);if(!p)return;
 const resolved=HBReceipt.packageQuantity({...row,qty:row.qtyKind==='pieces'?row.sourceQty:row.qty},p);
 row.qty=resolved.qty;row.qtyNote=resolved.note;
}

function renderRows(){
 const card=row=>'<article class="receipt-row" data-receipt-row="'+row.id+'"><p class="receipt-original"><strong>השורה בקבלה:</strong> '+escape(row.raw)+'</p>'+(row.reason?'<p class="muted">'+escape(row.reason)+'</p>':'')+'<label>שם או גודל לחיפוש<input data-receipt-name="'+row.id+'" value="'+escape(row.name)+'"></label><button data-receipt-match="'+row.id+'">חפש התאמות</button><label>בחרו מוצר מהמאגר<select id="receipt-product-'+row.id+'" data-receipt-product="'+row.id+'"><option value="">בחרו מוצר — אין הוספה אוטומטית</option>'+row.options.map(p=>'<option value="'+p.barcode+'" '+(p.barcode===row.selected?'selected':'')+'>'+escape(HB.displayName(p))+' · '+p.barcode+' · מחיר ב־'+(coverageIndex.get(p.barcode)||0)+' רשתות</option>').join('')+'</select></label><label>כמות '+(catalog.get(row.selected)?.weighted?'בק״ג':'אריזות')+'<input data-receipt-qty="'+row.id+'" type="number" min="0.001" max="999" step="'+(catalog.get(row.selected)?.weighted?.001:1)+'" value="'+row.qty+'"></label><p class="muted">'+(row.qtyNote|| (row.qtyCertain?'זוהתה כמות — בדקו אותה':'לא זוהתה כמות ודאית. מוצעת אריזה אחת — בדקו'))+(row.observedPrice!==null?' · סכום שנקרא מהקבלה: '+money(row.observedPrice)+' (לא מחיר עדכני)':'')+'</p><label class="approve-receipt"><input id="receipt-include-'+row.id+'" type="checkbox" data-receipt-include="'+row.id+'" '+(row.include?'checked':'')+' '+(!row.selected?'disabled':'')+'>בדקתי את המוצר והכמות — להוסיף לסל</label><button data-receipt-delete="'+row.id+'">מחק שורה</button></article>';
 el('receipt-matched').innerHTML=receiptRows.filter(r=>r.kind==='product'&&r.options.length).map(card).join('')||'<p>עדיין אין התאמות. אפשר לחפש ידנית בשורות למטה.</p>';
 el('receipt-unmatched').innerHTML=receiptRows.filter(r=>r.kind!=='product'||!r.options.length).map(card).join('')||'<p>לא נשארו שורות ללא התאמה.</p>';
 el('receipt-review-status').textContent=receiptRows.filter(r=>r.include).length+' שורות אושרו מתוך '+receiptRows.length+'. רק שורות שסומנו יתווספו.';
 el('receipt-review').hidden=!receiptRows.length;
}
async function parseReceipt(){
 closeDrawer();const epoch=++reviewEpoch;
 if(!ready){say('כדי להתאים מוצרים, טענו קודם את המחירים דרך ״הנתונים שלנו״. הטקסט נשאר כאן.');return;}
 try{
 const rows=HBReceipt.parse(el('receipt-text').value);if(!rows.length)throw Error('לא נמצא טקסט. העלו תמונה או הדביקו את שורות הקבלה.');
 say('מחפשים התאמות במאגר. שום מוצר לא נוסף עדיין…');await new Promise(r=>setTimeout(r,0));
 const my=generation,ix=HBReceipt.index(catalog);
 for(let i=0;i<rows.length;i++){if(epoch!==reviewEpoch)return;if(my!==generation)throw Error('המחירים השתנו. לחצו שוב על בדיקת השורות.');if(rows[i].kind==='product'){rows[i].options=await rowCandidates(rows[i],ix);rows[i].selected=rows[i].options[0]?.barcode||'';setRowProduct(rows[i]);}if(i%5===0)await new Promise(r=>setTimeout(r,0));}
 if(epoch!==reviewEpoch)return;receiptRows=rows;reviewGeneration=my;renderRows();say('השורות מוכנות לבדיקה. בחרו מוצרים וסמנו רק מה שתרצו להוסיף.');
 }catch(e){say(e.message);}
}
el('receipt-parse').onclick=parseReceipt;el('receipt-text').addEventListener('input',()=>{++reviewEpoch;reviewGeneration=-1;el('receipt-review-status').textContent='הטקסט השתנה. לחצו שוב על בדיקת השורות לפני הוספה.';});
el('receipt-review').addEventListener('change',e=>{
 const data=e.target.dataset,id=data.receiptName??data.receiptProduct??data.receiptQty??data.receiptInclude,row=receiptRows.find(r=>r.id===Number(id));if(!row)return;
 if(data.receiptName!==undefined){row.name=e.target.value;row.manual=true;row.barcode='';row.include=false;row.selected='';row.options=[];el('receipt-product-'+row.id).innerHTML='<option value="">לחצו חפש התאמות</option>';el('receipt-include-'+row.id).checked=false;el('receipt-include-'+row.id).disabled=true;}
 if(data.receiptProduct!==undefined){row.selected=e.target.value;row.include=false;setRowProduct(row);renderRows();}
 if(data.receiptQty!==undefined){row.qty=Number(e.target.value);row.qtyKind='packages';row.qtyNote='כמות שתוקנה ידנית';}
 if(data.receiptInclude!==undefined){row.include=e.target.checked&&!!row.selected;}
 el('receipt-review-status').textContent=receiptRows.filter(r=>r.include).length+' שורות אושרו מתוך '+receiptRows.length;
});
el('receipt-review').addEventListener('click',async e=>{
 const del=e.target.closest('[data-receipt-delete]');if(del){receiptRows=receiptRows.filter(r=>r.id!==Number(del.dataset.receiptDelete));renderRows();return;}
 const match=e.target.closest('[data-receipt-match]');if(!match)return;const row=receiptRows.find(r=>r.id===Number(match.dataset.receiptMatch));if(!row)return;
 row.manual=true;row.options=await rowCandidates(row,HBReceipt.index(catalog));row.selected=row.options[0]?.barcode||'';setRowProduct(row);row.include=false;if(row.options.length)row.kind='product';renderRows();
});
el('receipt-apply').onclick=()=>{
 try{
 if(reviewGeneration!==generation)throw Error('נתוני המוצרים השתנו. לחצו שוב על ״בדיקת השורות״ לפני האישור.');
 const merged=HBReceipt.merge(cart,receiptRows,catalog);
 if(!confirm('להוסיף לסל '+merged.added+' שורות שבדקתם? המחירים ייבדקו לפי הנתונים העדכניים, ולא לפי הקבלה.'))return;
 for(const row of receiptRows.filter(r=>r.include))clearApprovals(row.selected);
 cart=merged.cart;automatic=true;save();clearReceipt();location.hash='#cart';renderCart();toast('המוצרים שאישרתם נוספו לסל');
 }catch(e){el('receipt-review-status').textContent=e.message;}
};
function busy(value){el('receipt-cancel').hidden=!value;el('receipt-progress').hidden=!value;el('receipt-parse').disabled=value;el('receipt-text').disabled=value;}
function loadOCR(){
 if(window.Tesseract)return Promise.resolve(window.Tesseract);if(ocrLoading)return ocrLoading;
 ocrLoading=new Promise((resolve,reject)=>{
 const script=document.createElement('script');script.src='vendor/tesseract.min.js';script.async=true;
 const timeout=setTimeout(()=>{script.remove();ocrLoading=null;reject(Error('לא הצלחנו לטעון את מנוע הזיהוי. אפשר להדביק את טקסט הקבלה.'));},25000);
 script.onload=()=>{clearTimeout(timeout);if(!window.Tesseract){ocrLoading=null;reject(Error('מנוע הזיהוי לא נטען. השתמשו בהדבקת טקסט.'));}else resolve(window.Tesseract);};
 script.onerror=()=>{clearTimeout(timeout);script.remove();ocrLoading=null;reject(Error('מנוע הזיהוי אינו זמין. נסו שוב, או הדביקו טקסט.'));};
 document.head.appendChild(script);
 });return ocrLoading;
}
function stopOCR(){++ocrEpoch;if(ocrWorker){const w=ocrWorker;ocrWorker=null;Promise.resolve(w.terminate()).catch(()=>{});}busy(false);}
function clearReceipt(){++reviewEpoch;stopOCR();receiptRows=[];reviewGeneration=-1;el('receipt-text').value='';el('receipt-file').value='';el('receipt-camera').value='';el('receipt-review').hidden=true;el('receipt-matched').innerHTML='';el('receipt-unmatched').innerHTML='';say('הקבלה נוקתה מהעמוד. הסל שכבר אישרתם נשאר.');}
el('receipt-clear').onclick=clearReceipt;el('receipt-cancel').onclick=()=>{stopOCR();say('הזיהוי בוטל. אפשר להעלות תמונה אחרת או להדביק טקסט.');};
async function imageCanvas(file){
 let bitmap;
 if(window.createImageBitmap)bitmap=await createImageBitmap(file);
 else {const url=URL.createObjectURL(file);try{bitmap=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('התמונה לא נפתחת בדפדפן. נסו JPEG.'));img.src=url;});}finally{URL.revokeObjectURL(url);}}
 if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>50000000){bitmap.close?.();throw Error('התמונה גדולה מדי. צלמו קטע קצר יותר של הקבלה.');}
 const size=HBReceiptImage.dimensions(bitmap.width,bitmap.height);
 const canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
 if(ctx.getImageData&&el('receipt-enhance').checked!==false){const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);HBReceiptImage.enhance(pixels.data,canvas.width,canvas.height);ctx.putImageData(pixels,0,0);}
 return canvas;
}
async function recognizeFile(file){
 ++reviewEpoch;reviewGeneration=-1;receiptRows=[];el('receipt-review').hidden=true;stopOCR();const my=ocrEpoch;if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024){say('בחרו JPEG, PNG או WebP עד 12MB. אפשר גם להדביק טקסט.');return;}
 busy(true);say('מכינים את התמונה במכשיר. הזיהוי הראשון דורש הורדת קובצי שפה…');let worker=null,canvas=null,tick=null;const began=Date.now();let overall=1,stage='מכינים את התמונה';
 const progress=()=>{const elapsed=Math.floor((Date.now()-began)/1000),estimate=overall>12?Math.max(1,Math.round(elapsed*(100-overall)/overall)):null;el('receipt-progress').value=overall/100;say(stage+' · '+overall+'% · עברו '+elapsed+' שניות · זמן משוער שנותר: '+(estimate?estimate+' שניות':'30–90 שניות (אומדן)'));};
 const pulse=()=>{if(my!==ocrEpoch)return;progress();tick=setTimeout(pulse,1000);tick?.unref?.();};pulse();
 const timeout=setTimeout(()=>{if(my===ocrEpoch){stopOCR();say('הזיהוי לוקח זמן רב מדי. נסו תמונה קצרה וחדה יותר, או הדביקו טקסט.');}},120000);
 try{
 canvas=await imageCanvas(file);if(my!==ocrEpoch)return;overall=8;stage='טוענים את מנוע הזיהוי';progress();
 const api=await loadOCR();if(my!==ocrEpoch)return;
 worker=await api.createWorker(['heb','eng'],1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',langPath:'https://tessdata.projectnaptha.com/4.0.0',cacheMethod:location.protocol==='file:'?'none':'write',logger:m=>{if(my===ocrEpoch){const p=Number(m.progress)||0;const status=String(m.status||'');const v=status==='recognizing text'?45+Math.round(p*53):/language/.test(status)?20+Math.round(p*22):/initializ/.test(status)?35+Math.round(p*8):8+Math.round(p*12);overall=Math.max(overall,Math.min(98,v));stage=status==='recognizing text'?'קוראים את הקבלה':'מכינים זיהוי בעברית';progress();}}});
 if(my!==ocrEpoch)return;ocrWorker=worker;
 const result=await worker.recognize(canvas);if(my!==ocrEpoch)return;
 el('receipt-text').value=String(result.data?.text||'');if(!el('receipt-text').value.trim())throw Error('לא זוהה טקסט. נסו צילום חד וישר יותר, או הדביקו טקסט.');
 say(el('receipt-text').value.length>40000?'הטקסט ארוך מדי לבדיקה אחת. שמרו כאן רק את שורות המוצרים הרצויות, עד 200 שורות, או צלמו קטע קצר יותר.':'הטקסט זוהה. בדקו אותו ולחצו ״בדיקת השורות״. הזיהוי עלול לטעות.');overall=100;el('receipt-progress').value=1;el('receipt-status').textContent='100% · '+el('receipt-status').textContent;busy(false);
 }catch(e){if(my===ocrEpoch)say('לא הצלחנו לזהות את התמונה. '+e.message+' אפשר להדביק טקסט ולהמשיך.');}
 finally{clearTimeout(tick);clearTimeout(timeout);if(worker){if(ocrWorker===worker)ocrWorker=null;try{await worker.terminate();}catch{}}if(canvas){canvas.width=1;canvas.height=1;}if(my===ocrEpoch)busy(false);}
}
for(const id of ['receipt-file','receipt-camera'])el(id).onchange=e=>recognizeFile(e.target.files?.[0]);
window.HBReceiptUI={parseReceipt,recognizeFile,clearReceipt,getRows:()=>receiptRows,renderRows};
update();
})();
