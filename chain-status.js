/* Display statistics only. Never changes filtering, ranking, pricing or data fetching. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./online-core.js'));else root.HBChainStatus=factory(root.HB,root.HBOnline);})(typeof globalThis!=='undefined'?globalThis:this,function(H,O){'use strict';
 function summarize({networks=[],config,place,meta,cart=[],records=new Map(),loaded=false,pricesChecked,now=Date.now()}){
  const list=networks.length?networks:Object.keys(config?.chains||{}).map(source=>({source})),total=list.length;
  const snapshots=H.snapshots(list,meta),buckets={priced:0,verify:0,unavailable:0,stale:0,partial:0},assignments=[];
  const checked=pricesChecked??(cart.length>0&&cart.every(item=>records.has(item.barcode)));
  for(let i=0;i<list.length;i++){
   const state=O.service(list[i],config,place);let group;
   // Exactly one category; priority is explicit and does not change eligibility.
   if(['hidden','unsupported','outside'].includes(state.status))group='unavailable';
   else if(!loaded)group='verify';
   else if(!H.fresh(snapshots[i],now))group='stale';
   else if(!cart.length||!checked)group='verify';
   else if(cart.some(item=>H.priceStatus(records.get(item.barcode)?.get(i),snapshots[i],'last',now)!=='תקין'))group='partial';
   else if(!state.eligible||state.status!=='available')group='verify';
   else group='priced';
   buckets[group]++;assignments.push({chain:i,source:list[i].source,group});
  }
  const text='מתוך '+total+' רשתות: '+buckets.priced+' מציגות מחיר, '+buckets.verify+' דורשות בדיקת זמינות באתר הרשת, '+buckets.unavailable+' לא זמינות בעירך, '+buckets.stale+' לא עדכניות, '+buckets.partial+' מחיר חלקי';
  return {total,...buckets,assignments,text,pending:!loaded||!cart.length||!checked};
 }
 return {summarize};
});
