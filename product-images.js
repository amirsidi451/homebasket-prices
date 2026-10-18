/* Optional standalone barcode -> URL map. Never alters the product export schema. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HBImages=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 function safeURL(value){if(typeof value!=='string'||value.length>2048)return null;if(/^images\/[\w\-/%.]+\.(?:png|jpe?g|webp|avif)$/i.test(value)&&!value.includes('..')){try{if(!decodeURIComponent(value).includes('..'))return value;}catch{}return null;}try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
 function parse(raw){const out=new Map();if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;for(const [barcode,value]of Object.entries(raw)){const url=safeURL(value);if(/^\d{1,14}$/.test(barcode)&&url)out.set(barcode,url);}return out;}
 function placeholder(name){const clean=String(name||'').replace(/^[\s\-'.’]+/u,'');return{letter:clean.match(/[\p{L}\p{N}]/u)?.[0]||'ס',tone:[...clean].reduce((sum,c)=>sum+c.codePointAt(0),0)%4};}
 return {safeURL,parse,placeholder};
});
