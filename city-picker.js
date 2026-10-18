/* Display-only local city suggestions. This list does NOT imply service coverage. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./online-core.js'),require('./localities.js'));else root.HBCityPicker=factory(root.HBOnline,root.HBLocalities);})(typeof globalThis!=='undefined'?globalThis:this,function(O,localities){'use strict';localities=localities||[];
 const defaults=['אור יהודה','תל אביב-יפו','ירושלים','חיפה','באר שבע','פתח תקווה','רמת גן','בני ברק','ראשון לציון','חולון','בת ים','קריית אונו','גבעתיים','יהוד-מונוסון','נתניה','אשדוד','אילת'];
 const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\u0591-\u05C7]/g,'').replace(/["'׳״’‘“”\s.,־–—-]/g,'');
 function options(query,configured=[],extra=[]){const raw=String(query||'').trim().slice(0,80),q=normalize(O.canonicalCity(raw)),seen=new Set();const names=[...localities,...configured,...extra,...defaults].map(x=>O.canonicalCity(x)).filter(x=>typeof x==='string'&&x.trim()).filter(x=>{const k=normalize(x);if(seen.has(k))return false;seen.add(k);return true;});
 const matches=names.filter(x=>!q||normalize(x).includes(q)).sort((a,b)=>Number(normalize(b).startsWith(q))-Number(normalize(a).startsWith(q))||a.localeCompare(b,'he')).slice(0,8).map(value=>({value,label:value,free:false}));
 if(raw&&!matches.some(x=>normalize(x.value)===q))matches.push({value:raw,label:'שימוש בכתובת או בעיר שהקלדתם: '+raw,free:true});return matches;}
 return {normalize,options};
});
