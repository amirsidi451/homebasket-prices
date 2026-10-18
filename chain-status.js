/* Display statistics only. Never changes filtering, ranking, pricing or data fetching. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./online-core.js'));else root.HBChainStatus=factory(root.HB,root.HBOnline);})(typeof globalThis!=='undefined'?globalThis:this,function(H,O){'use strict';
 function summarize({networks=[],config,place,meta,cart=[],records=new Map(),loaded=false,now=Date.now()}){
  const total=networks.length||Object.keys(config?.chains||{}).length;
  if(!loaded)return {total,priced:0,verify:0,stale:0,text:'מתוך '+total+' רשתות — טוענים נתונים; מחיר ועדכניות טרם נבדקו'};
  const snapshots=H.snapshots(networks,meta);let priced=0,verify=0,stale=0;
  for(let i=0;i<networks.length;i++){
   const state=O.service(networks[i],config,place);
   if(state.eligible||['unknown','location'].includes(state.status))verify++;
   if(!H.fresh(snapshots[i],now)){stale++;continue;}
   if(cart.some(item=>H.priceStatus(records.get(item.barcode)?.get(i),snapshots[i],'last',now)==='תקין'))priced++;
  }
  return {total,priced,verify,stale,text:'מתוך '+total+' רשתות '+priced+' מציגות מחיר, '+verify+' דורשות בדיקת זמינות, '+stale+' לא עדכניות'};
 }
 return {summarize};
});
