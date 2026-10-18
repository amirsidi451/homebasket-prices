/* Comparison presentation model. No schema change, substitutions, fee or price mutation. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./online-core.js'));else root.HBComparison=factory(root.HB,root.HBOnline);})(typeof globalThis!=='undefined'?globalThis:this,function(H,O){'use strict';
 function model({cart,records,networks,meta,config,place,selected=[],automatic=true,now=Date.now()}){
  const snapshots=H.snapshots(networks,meta),coverage=H.coverage(cart,records,networks.length,'last',now,snapshots),byChain=new Map(coverage.map(r=>[r.chain,r]));
  const all=networks.map((network,chain)=>{
   const row=byChain.get(chain),state=O.service(network,config,place),age=H.ageHours(snapshots[chain],now),current=H.fresh(snapshots[chain],now);
   const quote=O.quote(network,config,place?.mode,row.total);
   const missing=cart.filter(i=>H.priceStatus(records.get(i.barcode)?.get(chain),snapshots[chain],'last',now)!=='תקין');
   let reason='';
   if(state.status==='hidden')reason='מוסתרת – אין שירות אונליין';
   else if(!state.eligible)reason=['outside','unsupported'].includes(state.status)?'לא זמינה בעירך או באופן הקבלה שנבחר':O.availabilityLabel(place?.mode);
   else if(!current)reason='לא עדכנית';
   else if(missing.length)reason=missing.length===1?'חסר מוצר אחד':'חסרים '+missing.length+' מוצרים';
   else if(quote.belowMinimum)reason=O.minimumLabel(quote);
   else reason='סל מלא';
   return {...row,...quote,network,eligible:state.eligible,current,age,snapshot:snapshots[chain],missing,reason,full:cart.length>0&&state.eligible&&current&&!missing.length};
  });
  const full=all.filter(r=>r.full),partial=all.filter(r=>r.eligible&&r.current&&r.missing.length).sort((a,b)=>b.coverage-a.coverage||a.total-b.total||a.chain-b.chain);
  const usable=all.filter(r=>r.eligible&&r.current&&r.coverage>0).map(r=>r.chain);
  let group=null,usedAutomatic=automatic;
  const candidate=ids=>{if(ids.length<2)return null;const common=H.commonAcross(cart,records,ids,'last',now,snapshots);return common.included.length?common:null;};
  if(!automatic)group=candidate([...new Set(selected)].filter(c=>usable.includes(c)));
  if(!group){usedAutomatic=true;let bestSize=0,bestCoverage=-1;for(let i=0;i<usable.length;i++)for(let j=i+1;j<usable.length;j++){
   const ids=[usable[i],usable[j]],test=candidate(ids),size=test?.included.length||0,sum=byChain.get(ids[0]).coverage+byChain.get(ids[1]).coverage;
   if(size>bestSize||size===bestSize&&size>0&&sum>bestCoverage){group=test;bestSize=size;bestCoverage=sum;}
  }}
  return {all,full,partial,common:group,automaticCommon:usedAutomatic,snapshots};
 }
 return {model};
});
