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
   const fee=O.fee(n,config,place.mode),total=fee===null?null:row.total+fee+customerFee;if(total!==null&&!Number.isSafeInteger(total))continue;
   ranked.push({chain:row.chain,coverage:row.coverage,missing:cartSize-row.coverage,full:row.coverage===cartSize,itemsTotal:row.total,fee,total,feeKnown:fee!==null,...(feesEnabled?{feesEnabled:true,customerFee}: {})});seen.add(row.chain);
  }
  const productsBasis=place.mode==='pickup'&&ranked.some(r=>!r.feeKnown);
  for(const r of ranked){r.basis=productsBasis?'products':'total';r.rankAmount=productsBasis?r.itemsTotal+(r.customerFee||0):r.total;}
  // Full basket always before partial. Different partial coverage is not comparable.
  // For equal coverage, priced fees rank before unknown fees, never treating unknown as zero.
  ranked.sort((a,b)=>Number(b.full)-Number(a.full)||b.coverage-a.coverage||(productsBasis?0:Number(b.feeKnown)-Number(a.feeKnown))||(a.rankAmount!==null&&b.rankAmount!==null?a.rankAmount-b.rankAmount:0)||a.chain-b.chain);
  ranked.forEach((r,i)=>{r.rank=i+1;});ranked.forEach(r=>{r.explanations=explain(r,ranked,place.mode);if(r.feesEnabled){r.explanations=r.explanations.map(t=>t.replaceAll('מחיר המוצרים','מחיר המוצרים ודמי השירות'));r.explanations.push('דמי שירות לדוגמה כלולים בדירוג; אין גבייה באתר');}});return ranked;
 }
 function explain(row,ranked,mode){
  const feeName=mode==='pickup'?'דמי איסוף':'דמי משלוח',out=[];
  out.push(row.full?'כיסוי מלא של כל המוצרים':row.missing===1?'חסר מוצר אחד ולכן המחיר אינו מלא':'חסרים '+row.missing+' מוצרים ולכן המחיר אינו מלא');
  const next=ranked[1],unknownFull=ranked.some(r=>r.full&&!r.feeKnown);
  if(row.rank===1){
   if(row.full&&next?.full&&row.rankAmount!==null&&next.rankAmount!==null){const saving=next.rankAmount-row.rankAmount;out.push(saving>0?(row.basis==='products'?'הכי זולה במחיר המוצרים: חוסכת ':'הכי זולה בסל מבין העלויות הידועות: חוסכת ')+money(saving)+' לעומת מקום 2'+(row.basis==='products'?', לפני דמי איסוף':''):'שוויון בסכום '+(row.basis==='products'?'המוצרים':'הכולל')+' עם מקום 2');}
   else if(!row.full)out.push('מובילה בכיסוי בין הסלים החלקיים; לא ניתן לקבוע מחיר לסל מלא');
   else if(row.feeKnown)out.push('סל מלא עם עלות שירות ידועה; אין סל מלא נוסף עם עלות ידועה לחישוב חיסכון');
   if(row.basis==='total'&&row.full&&row.feeKnown&&unknownFull)out.push('רשתות עם עלות שירות לא ידועה עשויות לשנות את הדירוג לאחר אימות');
  }
  if(row.rank>1&&row.rank<=3){const first=ranked[0];if(first.full&&row.full&&row.rankAmount!==null&&first.rankAmount!==null){const difference=row.rankAmount-first.rankAmount;out.push(difference>0?'יקרה ב־'+money(difference)+' ממקום 1'+(row.basis==='products'?' במחיר המוצרים, לפני דמי איסוף':' כולל דמי שירות ידועים'):'אותו '+(row.basis==='products'?'מחיר מוצרים':'סכום כולל')+' כמו מקום 1');}else out.push('לא ניתן לחשב הפרש כולל מול מקום 1: הכיסוי או דמי השירות אינם מלאים');}
  if(!row.feeKnown)out.push(mode==='pickup'?'דמי איסוף לא ידועים; הדירוג לפי מחיר המוצרים לפני דמי איסוף':'לא ניתן לחשב סכום כולל: '+feeName+' אינם ידועים; הדירוג זמני');
  else{
   const peer=ranked.find(r=>r.rank<=3&&r.chain!==row.chain&&r.coverage===row.coverage&&r.feeKnown&&r.fee>row.fee);
   if(peer)out.push(feeName+' נמוכים יותר ממקום '+peer.rank);
  }
  return out;
 }
 return {rank,explain};
});
