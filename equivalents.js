/* Optional exporter suggestions. Nothing is selected until an explicit approval. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'));else root.HBEquivalents=factory(root.HB);})(globalThis,function(H){'use strict';
 const empty=()=>({offers:new Map(),stamp:null});
 function packaged(p){return !!p&&!p.weighted&&!/^(?:עגבני|מלפפון|כרוב|תפוח|בננ|אבוקדו|בצל|גזר|תפוז|לימון|אגס|ענבים|אבטיח|מלון|קישוא|פלפל|חציל|חסה|פטרוזיליה|כוסברה)/u.test(H.cleanName(p.name));}
 function parse(raw,meta,networks,catalog){
  const result=empty();if(!raw||typeof raw!=='object'||!meta.generated_at||raw.export_generated_at!==meta.generated_at||!raw.i||!raw.e||!raw.chains)return result;
  result.stamp=raw.export_generated_at;
  for(const [code,entry] of Object.entries(raw.e)){
   if(!packaged(catalog.get(code))||!entry||!Array.isArray(entry.s)||entry.s.length!==3||!['g','ml','u','m'].includes(entry.s[1])||!(entry.s[0]>0)||!Number.isInteger(entry.s[2])||entry.s[2]<1)continue;
   for(const [id,rows]of Object.entries(entry.c||{})){
    const n=networks.find(n=>n.source===raw.chains[id]);if(!n||!Array.isArray(rows)||!Array.isArray(raw.i[id]))continue;
    const offers=[],seen=new Set();
    for(const row of rows.slice(0,3)){
     if(!Array.isArray(row))continue;const [idx,score,brand,sizeCmp,flavour]=row,item=raw.i[id][idx];
     if(!Number.isInteger(idx)||idx<0||!Array.isArray(item)||item.length!==7||!Number.isFinite(score)||score<0||score>100||![0,1].includes(brand)||!['s','-','+'].includes(sizeCmp)||!['s','o','u'].includes(flavour))continue;
     const [itemCode,name,size,unit,pack,price,key]=item;
     if(typeof itemCode!=='string'||!itemCode||itemCode.length>80||typeof name!=='string'||!name||name.length>500||!Number.isFinite(size)||size<=0||unit!==entry.s[1]||!Number.isInteger(pack)||pack<1||!Number.isSafeInteger(price)||price<0||!(key===null||typeof key==='string')||seen.has(itemCode))continue;
     if(key&&catalog.has(key)&&!packaged(catalog.get(key)))continue;
     if(!packaged({name,weighted:false}))continue;
     const actual=size*pack,base=entry.s[0]*entry.s[2],cmp=actual===base?'s':actual<base?'-':'+';if(cmp!==sizeCmp)continue;
     seen.add(itemCode);offers.push({original:code,chain:n.index,source:n.source,barcode:itemCode,key,name,size,unit,pack,price,score,sameBrand:brand===1,sizeCmp,flavour});
    }
    if(offers.length)result.offers.set(n.index+':'+code,offers);
   }
  }return result;
 }
 function suggestions(data,code,chain,records){if(records.get(code)?.get(chain)?.last!=null)return [];return data?.offers.get(chain+':'+code)||[];}
 function accepted(data,code,chain,approval,records){if(!approval?.equivalent)return null;return suggestions(data,code,chain,records).find(o=>o.barcode===approval.barcode)||null;}
 function effective(cart,records,approved,data){const result=new Map(records);for(const item of cart){const base=records.get(item.barcode)||new Map();let copied=null;for(const [k,a]of approved){if(!a?.equivalent||!k.endsWith(':'+item.barcode))continue;const chain=Number(k.slice(0,k.indexOf(':'))),offer=accepted(data,item.barcode,chain,a,records);if(!offer)continue;if(!copied){copied=new Map(base);result.set(item.barcode,copied);}copied.set(chain,{last:offer.price,min:offer.price,median:offer.price,max:offer.price,equivalent:offer,src:'approved_equivalent'});}}return result;}
 function prune(approved,data,records){let changed=false;for(const [key,a]of approved){if(!a?.equivalent)continue;const split=key.indexOf(':'),chain=Number(key.slice(0,split)),code=key.slice(split+1);if(!accepted(data,code,chain,a,records)){approved.delete(key);changed=true;}}return changed;}
 function unitPrice(o){const amount=o.size*o.pack;return {amount:o.price/amount*(['g','ml'].includes(o.unit)?100:1),label:{g:'ל־100 גרם',ml:'ל־100 מ״ל',u:'ליחידה',m:'למטר'}[o.unit]};}
 function labels(o){return [o.sameBrand?'אותו מותג':'מותג אחר',o.sizeCmp==='s'?'אותו גודל':(o.sizeCmp==='-'?'גודל קטן יותר':'גודל גדול יותר')+' ('+o.size+' '+({g:'גרם',ml:'מ״ל',u:'יחידות',m:'מטר'}[o.unit])+' × '+o.pack+')',o.flavour==='o'?'טעם/ריח אחר':o.flavour==='u'?'טעם/ריח לא מצוין':'אותו טעם/ריח'];}
 return {empty,packaged,parse,suggestions,accepted,effective,prune,unitPrice,labels};
});
