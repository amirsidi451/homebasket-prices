/* Deterministic local ranking. Integer agorot throughout; no API or AI calls. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./online-core.js'),require('./fees.js'));else root.HBTop=factory(root.HB,root.HBOnline,root.HBFees);})(typeof globalThis!=='undefined'?globalThis:this,function(H,O,F){'use strict';
 const money=n=>new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS'}).format(n/100);
 function rank({rows,cartSize,networks,config,place,snapshots,now=Date.now()}){
  if(!Number.isInteger(cartSize)||cartSize<1)return [];
  const seen=new Set(),ranked=[];
  for(const row of rows||[]){
   const n=networks[row.chain];if(!n||seen.has(row.chain)||!O.service(n,config,place).eligible||!H.fresh(snapshots?.[row.chain],now))continue;
   if(!Number.isInteger(row.coverage)||row.coverage<1||row.coverage>cartSize||!Number.isSafeInteger(row.total)||row.total<0)continue;
   const feesEnabled=config?.fees?.enabled===true,customerFee=feesEnabled?Math.round(F.computeFees(row.total/100,n.source,config).customerFee*100):0;
   const quote=O.quote(n,config,place.mode,row.total),fee=quote.fee,total=fee===null?null:row.total+fee+customerFee;if(total!==null&&!Number.isSafeInteger(total))continue;
   ranked.push({chain:row.chain,coverage:row.coverage,missing:cartSize-row.coverage,full:row.coverage===cartSize,itemsTotal:row.total,fee,total,...quote,feeKnown:fee!==null,priceIsEstimate:n.price_is_estimate===true,pickupUnverified:place.mode==='pickup'&&O.service(n,config,place).status!=='available',...(feesEnabled?{feesEnabled:true,customerFee}: {})});seen.add(row.chain);
  }
  for(const r of ranked){r.basis='total';r.rankAmount=r.total;r.recommendable=!r.priceIsEstimate&&!r.pickupUnverified&&r.feeKnown&&!r.belowMinimum&&r.full;}
  const partialOnly=!ranked.some(r=>r.full);
  ranked.sort((a,b)=>Number(b.recommendable)-Number(a.recommendable)||Number(a.priceIsEstimate)-Number(b.priceIsEstimate)||Number(b.full)-Number(a.full)||(partialOnly?b.coverage-a.coverage:0)||Number(a.belowMinimum)-Number(b.belowMinimum)||Number(b.feeKnown)-Number(a.feeKnown)||(a.total!==null&&b.total!==null?a.total-b.total:0)||a.chain-b.chain);
  let position=0;ranked.forEach(r=>{r.rank=r.recommendable?++position:null;});ranked.forEach(r=>{r.explanations=explain(r,ranked,place.mode);if(r.feesEnabled){r.explanations=r.explanations.map(t=>t.replaceAll('מחיר המוצרים','מחיר המוצרים ודמי השירות'));r.explanations.push('דמי שירות לדוגמה כלולים בדירוג; אין גבייה באתר');}});return ranked;
 }
 function explain(row,ranked,mode){
  const feeName=mode==='pickup'?'דמי איסוף':'דמי משלוח',out=[];
  if(row.priceIsEstimate)return ['ייתכן שזול יותר — מחיר משוער'];
  if(row.pickupUnverified)return ['בדקו נקודת איסוף באתר הרשת','זמינות האיסוף טרם אושרה; הרשת אינה מקבלת המלצה ראשית'];
  if(!row.full)return [row.missing===1?'חסר מוצר אחד ולכן המחיר אינו מלא':'חסרים '+row.missing+' מוצרים ולכן המחיר אינו מלא','מובילה בכיסוי בין הסלים החלקיים; לא ניתן לקבוע מחיר לסל מלא'];
  if(row.belowMinimum)return [O.minimumLabel(row),'אין המלצה להזמנה לפני השלמת המינימום באתר הרשת'];
  out.push(row.full?'כיסוי מלא של כל המוצרים':row.missing===1?'חסר מוצר אחד ולכן המחיר אינו מלא':'חסרים '+row.missing+' מוצרים ולכן המחיר אינו מלא');
  const next=ranked.find(r=>r.rank===2&&!r.belowMinimum),unknownFull=ranked.some(r=>r.full&&!r.feeKnown);
  if(row.rank===1){
   if(row.full&&next?.full&&row.rankAmount!==null&&next.rankAmount!==null){const saving=next.rankAmount-row.rankAmount;out.push(saving>0?(row.basis==='products'?'הכי זולה במחיר המוצרים: חוסכת ':'הכי זולה בסל מבין העלויות הידועות: חוסכת ')+money(saving)+' לעומת מקום 2'+(row.basis==='products'?', לפני דמי איסוף':''):'שוויון בסכום '+(row.basis==='products'?'המוצרים':'הכולל')+' עם מקום 2');}
   else if(!row.full)out.push('מובילה בכיסוי בין הסלים החלקיים; לא ניתן לקבוע מחיר לסל מלא');
   else if(row.feeKnown)out.push('סל מלא עם עלות שירות ידועה; אין סל מלא נוסף עם עלות ידועה לחישוב חיסכון');
   if(row.basis==='total'&&row.full&&row.feeKnown&&unknownFull)out.push('רשתות עם עלות שירות לא ידועה עשויות לשנות את הדירוג לאחר אימות');
  }
  if(row.rank>1&&row.rank<=3){const first=ranked.find(r=>r.rank===1);if(first?.full&&row.full&&row.rankAmount!==null&&first.rankAmount!==null){const difference=row.rankAmount-first.rankAmount;out.push(difference>0?'יקרה ב־'+money(difference)+' ממקום 1'+(row.basis==='products'?' במחיר המוצרים, לפני דמי איסוף':' כולל '+feeName+' משוערים'):'אותו '+(row.basis==='products'?'מחיר מוצרים':'סכום כולל')+' כמו מקום 1');}else out.push('לא ניתן לחשב הפרש כולל מול מקום 1: הכיסוי או דמי השירות אינם מלאים');}
  if(!row.feeKnown)out.push(mode==='pickup'?'דמי איסוף לא ידועים; הסכום הכולל אינו ידוע והרשת אינה נכללת בחיסכון':'לא ניתן לחשב סכום כולל: '+feeName+' אינם ידועים; הדירוג זמני');
  else{
   const peer=ranked.find(r=>Number.isInteger(r.rank)&&r.rank<=3&&r.chain!==row.chain&&r.coverage===row.coverage&&r.feeKnown&&r.fee>row.fee);
   if(peer)out.push(feeName+' נמוכים יותר ממקום '+peer.rank);
  }
  return out;
 }
 return {rank,explain};
});
