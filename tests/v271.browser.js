/* Actual DOM/layout regression runner. Uses synthetic data from v270-fixture.cjs.
   Also callable by the Playwright wrapper. Never requests retailer websites. */
'use strict';
window.runHomeBasket271=async function({widths=[1280,390,640,320],variants=['with','without','broken']}={}){
 const output=document.getElementById('test-output'),frame=document.getElementById('test-frame');let checks=0;const errors=[],log=[];
 const report=(ok,name,detail='')=>{log.push((ok?'PASS ':'FAIL ')+name+(detail?' '+detail:''));if(ok)checks++;else errors.push(name+' '+detail);output.textContent=log.slice(-15).join('\n');document.getElementById('test-progress').textContent=checks+' checks; '+errors.length+' failures';};
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const until=async(fn,label,timeout=20000)=>{const start=Date.now();while(!fn()){if(Date.now()-start>timeout)throw Error('Timeout: '+label);await pause(30)}};
 for(const variant of variants)for(const width of widths){
  try{
   for(const k of Object.keys(localStorage))if(k.startsWith('homebasket-'))localStorage.removeItem(k);
   frame.style.width=width+'px';frame.style.height='844px';frame.src='../qa-'+variant+'/index.html';await new Promise(resolve=>frame.onload=resolve);
   const w=frame.contentWindow,d=w.document;w.addEventListener('error',e=>report(false,'app runtime error',e.message));w.addEventListener('unhandledrejection',e=>report(false,'app rejected promise',String(e.reason)));const $=id=>d.getElementById(id),q=s=>d.querySelector(s),visible=e=>!!e&&w.getComputedStyle(e).display!=='none'&&!e.hidden&&e.getClientRects().length>0;
   const click=e=>{if(!e)throw Error('Missing click target');e.click()},input=(e,value)=>{e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}))};
   const bounds=label=>{report(w.innerWidth===width&&d.documentElement.scrollWidth<=width,variant+' '+width+' '+label+' no overflow',JSON.stringify({inner:w.innerWidth,scroll:d.documentElement.scrollWidth}));report([...d.querySelectorAll('.view')].filter(visible).length===1,label+' only active step');};
   await until(()=>!$('notice').textContent.includes('טוענים'),'catalog');report(!$('startup-error'),variant+' startup');bounds('location');
   input($('service-city'),'גן יבנה');click($('city-confirm'));await until(()=>visible($('search')),'step 2');
   for(const word of ['חלב','לחם','קולה']){input($('query'),word);await until(()=>q('.product-card [data-add]')&&q('.product-card').textContent.includes(word),'search '+word);const card=q('.product-card');report(card.getBoundingClientRect().height<=110,variant+' '+width+' compact card '+word,String(card.getBoundingClientRect().height));click(q('.product-card [data-add]'));await until(()=>q('[data-product-adjust]'),'quantity controls');}
   report(!visible(q('header nav')),'single header navigation');bounds('basket');click($('basket-next'));await until(()=>visible($('compare'))&&q('.network-table'),'comparison');
   if(variant==='with'){
    await until(()=>q('[data-equivalent-approve]'),'equivalent ready');const row=()=>q('[data-network-chain="5"]');report(row().textContent.includes('2 מתוך 3'),'unapproved remains missing');click(q('[data-equivalent-approve]'));await until(()=>q('.approved-equivalent'),'approved');report(row().textContent.includes('3 מתוך 3'),'approval counted');report(row().textContent.includes('מקביל'),'equivalent badge in card');click(row().querySelector('[data-order]'));await until(()=>$('order-dialog').open,'order');report($('order-list').value.includes('מוצר מקביל')&&$('order-list').value.includes('7290110115203'),'order includes approved code');report($('order-list').scrollHeight<=$('order-list').clientHeight+4,'order list no nested scroll');bounds('order');click($('order-close'));click(q('[data-undo-alt]'));await until(()=>!q('.approved-equivalent')&&row(),'undo');report(row().textContent.includes('2 מתוך 3'),'undo restores missing');
   }else{await pause(250);report(!q('[data-equivalent-approve]')&&!$('startup-error'),variant+' optional file harmless');}
   for(const city of ['גן יבנה','ירושלים','תל אביב','חולון','חיפה','מצפה רמון'])for(const mode of ['delivery','pickup']){
    click($('step-location'));await until(()=>visible($('location')),'location active');input($('service-city'),city);$('service-pickup').checked=mode==='pickup';$('service-delivery').checked=mode==='delivery';click($('city-confirm'));await until(()=>visible($('search')),'city saved');click($('step-compare'));await until(()=>visible($('compare'))&&q('.network-table'),'results');
    report(visible(q('.price-date-summary')),'snapshot date visible');report(!$('result-summary').textContent.includes('נקודת האיסוף טרם אומתה'),'obsolete summary removed');if(city==='מצפה רמון'&&mode==='pickup')report($('result-summary').textContent.includes('אין רשת עם נקודת איסוף מאומתת בעיר'),'no verified pickup explicit');bounds(city+' '+mode);const normal=[...d.querySelectorAll('[data-network-chain]')],unknown=[...d.querySelectorAll('[data-unknown-chain]')],outside=[...d.querySelectorAll('[data-unavailable-chain]')];report(normal.length+unknown.length+outside.length===7,city+' '+mode+' seven disjoint chains');report(unknown.every(e=>!e.querySelector('[data-order]')&&!e.textContent.includes('הכי משתלם')),city+' '+mode+' unknown no ranking/order');report(!q('[data-label="דמי תפעול"]'),city+' '+mode+' fees off');
    if(city==='גן יבנה')report(normal.length===(mode==='delivery'?3:1),city+' '+mode+' exact available count');
    if(city==='ירושלים'&&mode==='delivery')report(normal.some(e=>e.textContent.includes('רמי לוי')&&e.textContent.includes('צפון')),city+' north-city note');
    click(q('.network-product-details summary'));bounds(city+' '+mode+' product table');
    report([...d.querySelectorAll('.network-sort button')].every(e=>e.getBoundingClientRect().height>=44),city+' sort touch target');
   }
  }catch(e){report(false,variant+' '+width+' execution',e.message)}
 }
 window.HB_BROWSER_RESULTS={checks,failures:errors.length,errors,log};document.getElementById('test-progress').textContent='DONE: '+checks+' PASS; '+errors.length+' FAIL';output.textContent=log.join('\n');return window.HB_BROWSER_RESULTS;
};
document.getElementById('run-tests').onclick=()=>window.runHomeBasket271();
