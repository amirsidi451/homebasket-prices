/* Local-only service matching. No geocoder, network calls, storage or location in URLs. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HBOnline=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const normalize=s=>String(s||'').normalize('NFKC').replace(/[\u0591-\u05C7]/g,'').replace(/["'׳״.,־–-]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
 function settings(chain,config){return config?.chains?.[chain.source]||{};}
 function availabilityLabel(mode){return mode==='pickup'?'יש לבדוק זמינות איסוף באתר הרשת':'יש לבדוק זמינות משלוח לכתובת באתר הרשת';}
 function service(chain,config,place){
  const c=settings(chain,config);if(c.visible===false)return {eligible:false,status:'hidden',label:'לא מוצגת — אין הזמנות אונליין'};if(!place?.city||!['delivery','pickup'].includes(place.mode))return {eligible:false,status:'location',label:'בחרו עיר ואופן קבלה'};
  const enabled=c[place.mode];if(enabled===false)return {eligible:false,status:'unsupported',label:place.mode==='delivery'?'אין משלוח לפי ההגדרות':'אין איסוף עצמי לפי ההגדרות'};
  if(place.mode==='pickup'&&enabled!==true)return {eligible:true,status:'verify',label:availabilityLabel(place.mode)};
  if(c.availability==='verify')return {eligible:true,status:'verify',label:availabilityLabel(place.mode)};
  const areas=Array.isArray(c.serviceAreas)?c.serviceAreas:c.serviceAreas?.[place.mode];
  if(enabled!==true||!Array.isArray(areas)||!areas.length)return {eligible:false,status:'unknown',label:'אזורי השירות טרם הוגדרו'};
  if(!areas.some(a=>a==='*'||normalize(a)===normalize(place.city)))return {eligible:false,status:'outside',label:'לא משרתת את העיר לפי ההגדרות'};
  return {eligible:true,status:'available',label:availabilityLabel(place.mode)};
 }
 function fee(chain,config,mode){if(!['delivery','pickup'].includes(mode))return null;const c=settings(chain,config),v=mode==='delivery'?c.estimatedDeliveryFee:c.estimatedPickupFee;return typeof v==='number'&&Number.isFinite(v)&&v>=0?Math.round(v*100):null;}
 // subtotal is product prices in AGOROT, excluding fulfilment and platform fees.
 function quote(chain,config,mode,subtotal=null){
  const c=settings(chain,config),policy=c.fulfilment,r=['delivery','pickup'].includes(mode)?policy?.[mode]:null;
  const agorot=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&Number.isSafeInteger(Math.round(v*100))?Math.round(v*100):null;
  const amountKnown=Number.isSafeInteger(subtotal)&&subtotal>=0;
  let amount=r?agorot(r.amount):fee(chain,config,mode);
  if(r&&amountKnown&&Array.isArray(r.tiers)){
   const tiers=r.tiers.filter(t=>agorot(t.above)!==null&&agorot(t.amount)!==null).sort((a,b)=>a.above-b.above);
   for(const tier of tiers)if(subtotal>agorot(tier.above))amount=agorot(tier.amount);
  }
  const minimumOrder=r?agorot(r.minimumOrder??0):0;
  const deficit=amountKnown&&minimumOrder!==null?Math.max(0,minimumOrder-subtotal):null;
  return {fee:amount,minimumOrder,deficit,belowMinimum:deficit!==null&&deficit>0,basis:policy?.basis==='published'?'published':'estimate',subtotal:amountKnown?subtotal:null};
 }
 function minimumLabel(q){return q?.belowMinimum?'מתחת למינימום הזמנה (חסרים '+new Intl.NumberFormat('he-IL',{maximumFractionDigits:2}).format(q.deficit/100)+' ש"ח)':'';}
 function policyLabel(chain,config,mode){
  const r=settings(chain,config).fulfilment?.[mode],q=quote(chain,config,mode);
  const money=n=>new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS'}).format(n/100);
  let out=q.fee===null?'יש לבדוק עלות באתר הרשת':money(q.fee);
  if(r?.tiers)for(const t of r.tiers)if(typeof t.above==='number'&&typeof t.amount==='number')out+='; מעל '+money(Math.round(t.above*100))+': '+money(Math.round(t.amount*100));
  if(q.minimumOrder>0)out+=' · מינימום הזמנה '+money(q.minimumOrder);
  return out;
 }
 function destination(chain,config){const c=settings(chain,config);try{const base=new URL(c.orderUrl);if(base.protocol!=='https:'||base.username||base.password)return null;const deep=c.deepLink?new URL(c.deepLink,base):base;if(deep.protocol!=='https:'||deep.origin!==base.origin||deep.username||deep.password)return null;return deep.href;}catch{return null;}}
 function cities(config){return [...new Set(Object.values(config.chains||{}).filter(c=>c.visible!==false&&c.availability!=='verify').flatMap(c=>Array.isArray(c.serviceAreas)?c.serviceAreas:Object.values(c.serviceAreas||{}).flat()).filter(x=>typeof x==='string'&&x!=='*'&&x.trim()))].sort((a,b)=>a.localeCompare(b,'he'));}
 // Only extract an unambiguous configured city; no network geocoding or price selection.
 function cityFromText(text,config){
  const raw=String(text||'').trim().replace(/\s+/g,' '),value=normalize(raw),known=cities(config);
  const exact=known.find(city=>normalize(city)===value);if(exact)return exact;
  const matches=known.filter(city=>(' '+value+' ').includes(' '+normalize(city)+' ')).sort((a,b)=>b.length-a.length);
  return matches.length&&matches.every(city=>normalize(matches[0]).includes(normalize(city)))?matches[0]:raw;
 }
 function priceLabel(chain,config){return settings(chain,config).priceBasis==='online'?'מחיר ממקור אונליין שהוגדר':'מחיר להשוואה — לא אומת כמחיר אונליין';}
 function packs(n){return n===1?'אריזה אחת':n+' אריזות';}
 function productsCount(n){return n===1?'מוצר אחד':n+' מוצרים';}
 function bidiText(text){return String(text).replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,'').replace(/([A-Za-z]+|\d+(?:[.,]\d+)?%?)/g,'\u2066$1\u2069');}
 function list(items,catalog,displayName){return items.map(i=>{const p=catalog.get(i.barcode),name=p?displayName(p):'מוצר '+i.barcode,amount=p?.weighted?i.qty+' ק״ג':packs(i.qty);return '\u200F\u2067'+bidiText(name)+'\u2069 — \u2067'+bidiText(amount)+'\u2069\u200F';}).join('\n');}

 function parseAreas(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('קובץ אזורי השירות חייב להכיל אובייקט לפי מזהה רשת.');
  const root=raw.chains||raw,output={};
  const clean=list=>{if(!Array.isArray(list)||list.some(x=>typeof x!=='string'||!x.trim()||x.length>80||x==='*'))throw Error('נדרשות רשימות של שמות ערים מלאים, ללא כיסוי ארצי משתמע.');return [...new Set(list.map(x=>x.trim().replace(/\s+/g,' ')))];};
  for(const source of ['RAMI_LEVY','HAZI_HINAM']){
   if(!Object.prototype.hasOwnProperty.call(root,source))continue;
   const value=root[source],areas=value?.serviceAreas??value;
   if(Array.isArray(areas))output[source]=clean(areas);
   else if(areas&&typeof areas==='object'){
    const modes={};for(const mode of ['delivery','pickup'])if(Object.prototype.hasOwnProperty.call(areas,mode))modes[mode]=clean(areas[mode]);
    if(!Object.keys(modes).length)throw Error('חסרות רשימות delivery או pickup עבור '+source);output[source]=modes;
   }else throw Error('מבנה אזורי שירות לא תקין עבור '+source);
  }
  if(!Object.keys(output).length)throw Error('לא נמצאו RAMI_LEVY או HAZI_HINAM בקובץ. לא שונו ההגדרות.');
  return output;
 }
 function applyAreas(raw,config){const output=parseAreas(raw);for(const [source,areas]of Object.entries(output)){if(settings({source},config).availability==='known')config.chains[source].serviceAreas=areas;}return Object.keys(output);}
 return {availabilityLabel,normalize,settings,service,fee,quote,minimumLabel,policyLabel,destination,cities,cityFromText,priceLabel,list,packs,productsCount,bidiText,parseAreas,applyAreas};
});
