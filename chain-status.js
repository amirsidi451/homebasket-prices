/* Display statistics only. Never changes filtering, ranking, pricing or data fetching. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./online-core.js'));else root.HBChainStatus=factory(root.HB,root.HBOnline);})(typeof globalThis!=='undefined'?globalThis:this,function(H,O){'use strict';
 function summarize({networks=[],config,place,meta,cart=[],records=new Map(),loaded=false,pricesChecked,knownPricedChains=new Set(),now=Date.now()}){
  const list=networks.length?networks:Object.keys(config?.chains||{}).map(source=>({source})),total=list.length;
  const snapshots=H.snapshots(list,meta),buckets={priced:0,verify:0,unavailable:0,stale:0,partial:0},assignments=[];
  const checked=pricesChecked??(cart.length>0&&cart.every(item=>records.has(item.barcode)));
  for(let i=0;i<list.length;i++){
   const state=O.service(list[i],config,place);let group;
   // Exactly one category; priority is explicit and does not change eligibility.
   if(['hidden','unsupported','outside'].includes(state.status))group='unavailable';
   else if(state.status==='unknown'||state.status==='location')group='verify';
   else if(!loaded)group='verify';
   else if(!H.fresh(snapshots[i],now))group='stale';
   else if(!cart.length)group=knownPricedChains.has(i)?'priced':'verify';
   else if(!checked)group='verify';
   else if(cart.some(item=>H.priceStatus(records.get(item.barcode)?.get(i),snapshots[i],'last',now)!=='תקין'))group='partial';
   else group='priced';
   const current=H.fresh(snapshots[i],now),coverage=current?cart.filter(item=>H.priceStatus(records.get(item.barcode)?.get(i),snapshots[i],'last',now)==='תקין').length:0;
   const priceState=state.status==='unknown'?'verify':!state.eligible&&place?'unavailable':!loaded?'pending':!current?'stale':!cart.length?(knownPricedChains.has(i)?'catalog':'pending'):!checked?'pending':coverage===cart.length?'full':coverage>0?'partial':'none';
   buckets[group]++;assignments.push({chain:i,source:list[i].source,group,priceState,coverage,verificationRequired:false});
  }
  const text='מתוך '+total+' רשתות: '+buckets.priced+' מציגות מחיר, '+buckets.verify+' דורשות בדיקת זמינות באתר הרשת, '+buckets.unavailable+' לא זמינות בעירך, '+buckets.stale+' לא עדכניות, '+buckets.partial+' מחיר חלקי';
  return {total,...buckets,assignments,text,pending:!loaded||!cart.length||!checked};
 }
 function displayCounts(assignments){const count=key=>assignments.filter(a=>a.priceState===key).length;return {fullBaskets:count('full'),partialBaskets:count('partial'),withoutPrice:count('none'),pendingPrices:count('pending'),catalogPrices:count('catalog'),unavailable:count('unavailable'),stale:count('stale'),unknown:count('verify'),verificationRequired:assignments.filter(a=>a.verificationRequired).length};}
 function displaySummary(assignments){const c=displayCounts(assignments),n=assignments.length;return (n===1?'מתוך רשת אחת: ':'מתוך '+n+' רשתות: ')+c.fullBaskets+' עם סל מלא · '+c.partialBaskets+' עם מחיר חלקי · '+c.withoutPrice+' ללא מחיר בסל'+(c.catalogPrices?' · '+c.catalogPrices+' עם מחירים בקטלוג':'')+(c.pendingPrices?' · '+c.pendingPrices+' בבדיקת מחירים':'')+' · '+(c.unknown||0)+' יש לבדוק זמינות · '+c.unavailable+' לא זמינות לבחירה · '+c.stale+' לא עדכניות';}
 return {summarize,displayCounts,displaySummary};
});
