/* Local receipt text parsing. Historical receipt amounts never become comparison prices. */
(function(root){'use strict';
const H=typeof module!=='undefined'?require('./core.js'):root.HB;
function norm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[״"׳']/g,'').replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,'').replace(/\s+/g,' ').trim();}
function words(s){return norm(s).match(/[א-תa-z]{2,}/g)||[];}
function cleanup(value){
 let s=String(value).replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,'');
 let inferred=false;
 if(/ביצ(?:ים|י)/.test(s)){
 s=s.replace(/\bX[1|]\b/gi,()=>{inferred=true;return 'XL';});
 s=s.replace(/ביצים\s+[|I1](?=\s|$)/g,()=>{inferred=true;return 'ביצים L';});
 s=s.replace(/ביצים\s+מ(?=\s|$)/g,()=>{inferred=true;return 'ביצים M';});
 s=s.replace(/\b[a-zA-Z]{2,10}['״׳"]([LM])\b/g,(_,grade)=>{inferred=true;return grade;});
 }
 const hebrew=/[א-ת]/.test(s);
 if(hebrew)s=s.replace(/\b[a-zA-Z]{2,}\b/g,t=>/^(XL|ML|KG)$/i.test(t)?t:' ');
 return {text:s.replace(/\s+/g,' ').trim(),inferred};
}
function nonProduct(raw){
 const s=norm(raw);
 return /^(?:קבלה|חשבונית|מספר קבלה|מספר חשבונית|מספר עסקה|מספר קופה|מספר מסמך|קופאי|תאריך|כתובת|טלפון|רחוב|רח[.]|דרך|שדרות|סניף|חנות|סופרמרקט|סהכ|סך הכל|לתשלום|סכום לתשלום|מע[.]?מ|עוסק|ח[.]?פ|אשראי|מזומן|ויזה|מסטרקארד|אמצעי תשלום|כולל מע[.]?מ|תשלום|עודף|תודה|הנחה|הנחת|מבצע|זיכוי|ביטול|פיקדון)(?:\s|:|$)/.test(s)||/^\d{1,2}[/.]\d{1,2}[/.]\d{2,4}(?:\s|$)/.test(s)||['רמי לוי','שופרסל','ויקטורי','יוחננוף','חצי חינם','טיב טעם','קרפור','אושר עד'].includes(s);
}
function parse(text){
 text=String(text||'');const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 if(text.length>40000||lines.length>200)throw Error('הקבלה ארוכה מדי. הדביקו עד 200 שורות בכל פעם.');
 return lines.map((raw,id)=>{
 const fixed=cleanup(raw);const clean=fixed.text.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,'').replace(/(\d),(\d{2,3})(?!\d)/g,'$1.$2');
 const code=clean.match(/(?:^|\D)(\d{8,14})(?!\d)/)?.[1]||'';
 const skip=/^(?:סה[״"]?כ|סך הכל|לתשלום|סכום לתשלום|עודף|אשראי|מזומן|ויזה|מספר עסקה|מספר קופה|קופאי|תאריך|טלפון|ח[.״"]?פ|עוסק מורשה|תודה|חשבונית|קבלה מספר|הנחת|הנחה|מבצע|זיכוי|ביטול|פיקדון)(?:\s|:|$)/.test(clean);
 let qty=1,qtyCertain=false,weighted=false,qtyKind='packages';
 const weight=clean.match(/(\d+(?:\.\d+)?)\s*(?:ק[״"]?ג|קילוגרם)\s*[xX×*]/);
 const mult=clean.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
 const suffix=clean.match(/(?:^|\s)[xX×]\s*(\d+(?:\.\d+)?)(?=\s|$)/),leading=clean.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*[*×](?=\s|$)/),units=clean.match(/(\d+)\s*(?:יחידות|יחידה|יח[׳']?)(?=\s|$)/),eggPack=/ביצים/.test(clean)?clean.match(/(?:^|\s)(12|18|30)(?=\s|$)/):null;
 const explicit=clean.match(/כמות\s*:?\s*(\d+(?:\.\d+)?)/);
 if(weight){qty=Number(weight[1]);qtyCertain=true;weighted=true;}
 else if(explicit){qty=Number(explicit[1]);qtyCertain=true;}
 else if(mult&&!/^[\s]*(?:גרם|ג[׳']|מ[״"]?ל|ליטר|ק[״"]?ג)/.test(clean.slice(mult.index+mult[0].length))){qty=Number(mult[1]);qtyCertain=true;}
 else if((suffix||leading)&&!mult){qty=Number((suffix||leading)[1]);qtyCertain=true;}
 else if(units||eggPack){qty=Number((units||eggPack)[1]);qtyCertain=true;qtyKind='pieces';}
 const prices=[...clean.matchAll(/(?:^|[^\d.])(\d+\.\d{2})(?!\d)/g)];
 const observedPrice=prices.length?Math.round(Number(prices.at(-1)[1])*100):null;
 let name=clean.replace(code?new RegExp(code):/$^/,'').replace(/כמות\s*:?\s*\d+(?:\.\d+)?/,'');
 if(weight)name=name.replace(/\d+(?:\.\d+)?\s*(?:ק[״"]?ג|קילוגרם)\s*[xX×*]\s*\d+(?:\.\d+)?/,'');
 else if(qtyCertain&&mult)name=name.replace(mult[0],' ');else if(qtyCertain&&(suffix||leading))name=name.replace((suffix||leading)[0],' ');
 if(eggPack&&!units)name=name.replace(/(?:^|\s)(12|18|30)(?=\s|$)/,' $1 יחידות');
 name=name.replace(/₪/g,'').replace(/\s+/g,' ').trim();
 name=name.replace(/(?:\s|^)(?:\d+\.\d{2}\s*₪?\s*)+$/,'').replace(/\s+/g,' ').trim();
 const header=['רמי לוי','שופרסל','ויקטורי','יוחננוף','חצי חינם','טיב טעם','קרפור','אושר עד'].includes(norm(name));
 const knownFood=/^(?:חלב|ביצים|אורז|בסמטי|במבה|שמן|קמח|לחם|עגבניות|גבינה|יוגורט|קפה|תה|פסטה|מלפפון|תפוח)/.test(name);
 const ignored=skip||header||nonProduct(raw)||(!observedPrice&&!code&&!knownFood);
 const valid=words(name).length>0&&!ignored;
 return {id,raw,name,barcode:code,qty,qtyCertain,weighted,qtyKind,inferred:fixed.inferred,observedPrice,ignored,kind:valid?'product':'unrecognized',reason:ignored?'שורה שאינה מוצר — אין התאמה אוטומטית':valid?'':'לא זוהה שם מוצר',selected:'',include:false,options:[]};
 });
}
const indexCache=new WeakMap();
function index(catalog){
 if(indexCache.has(catalog))return indexCache.get(catalog);
 const inverted=new Map();for(const p of catalog.values())for(const w of new Set(words(p.name))){if(!inverted.has(w))inverted.set(w,[]);inverted.get(w).push(p.barcode);}
 const out={catalog,inverted,fuzzy:new Map(),corrections:new Map()};indexCache.set(catalog,out);return out;
}
function candidates(row,ix,limit=4,coverage=new Map()){
 if(row.ignored&&!row.manual)return[];
 if(row.barcode&&ix.catalog.has(row.barcode))return [ix.catalog.get(row.barcode)];
 const cleaned=cleanup(row.name).text;const terms=[...new Set(words(cleaned).filter(w=>!['גרם','ליטר','מיליליטר','קילוגרם','יחידות','כמות'].includes(w)))];
 if(!terms.length)return[];
 const scores=new Map();
 for(const t of terms){
 let posting=ix.inverted.get(t);
 if(!posting&&t.length>=3){
 if(ix.fuzzy.has(t))posting=ix.fuzzy.get(t);
 else{posting=[];for(const [w,codes]of ix.inverted){if(Math.abs(w.length-t.length)>1)continue;let edits=0,a=0,b=0;while(a<t.length&&b<w.length){if(t[a]===w[b]){a++;b++;}else{if(++edits>1)break;if(t.length>w.length)a++;else if(w.length>t.length)b++;else{a++;b++;}}}edits+=(t.length-a)+(w.length-b);if(edits<=1){posting.push(...codes.slice(0,200));if(!ix.corrections.has(t))ix.corrections.set(t,w);}if(posting.length>4000)break;}ix.fuzzy.set(t,posting);}
 }
 for(const code of posting||[])scores.set(code,(scores.get(code)||0)+1);
}

 const best=[...scores].filter(([,n])=>n>=Math.max(1,Math.ceil(terms.length*.5))).sort((a,b)=>b[1]-a[1]).slice(0,2000);
 const pool=new Map(best.map(([code])=>[code,ix.catalog.get(code)]));
 const grade=H.eggGrade(cleaned),query=cleaned.replace(/[א-ת]{3,}/g,t=>ix.corrections.get(t)||t);return H.search(pool,query,coverage).filter(p=>(!row.weighted||p.weighted)&&(!grade||H.eggGrade(p)===grade)).slice(0,limit);
}
function merge(cart,rows,catalog){
 const next=cart.map(i=>({...i}));let added=0;
 for(const row of rows){if(!row.include)continue;const p=catalog.get(row.selected),qty=Number(row.qty);
 if(!p||!Number.isFinite(qty)||qty<=0||qty>999||(!p.weighted&&!Number.isInteger(qty)))throw Error('בדקו מוצר וכמות בכל שורה שסומנה.');
 const old=next.find(i=>i.barcode===p.barcode);
 if(old){if(old.qty+qty>999)throw Error('הכמות המצטברת גדולה מדי. הקטינו את הכמות.');old.qty=Math.round((old.qty+qty)*1000)/1000;}else next.push({barcode:p.barcode,qty:Math.round(qty*1000)/1000});
 added++;
 }
 if(!added)throw Error('סמנו לפחות שורת מוצר אחת שאישרתם.');
 return {cart:next,added};
}
function packageQuantity(row,p){
 if(row.qtyKind==='pieces'&&p.weighted)return {qty:0,note:'כמות ביחידות אינה משקל. הזינו משקל בק״ג לפני האישור.'};
 const gradeWarning=row.inferred?' מידת הביצים הוסקה מטקסט משובש — בדקו אותה.':(/ביצים/.test(row.name||'')&&!H.eggGrade(row.name)?' מידת הביצים לא זוהתה; בדקו אותה לפני אישור.':'');
 if(row.qtyKind==='pieces'&&p.unit==='יחידות'&&p.quantity>1){
 const qty=Math.round(row.qty/p.quantity*1000)/1000;
 return {qty,note:row.qty+' יחידות בקבלה / '+p.quantity+' באריזה = '+qty+' אריזות. '+(!Number.isInteger(qty)?'בחרו אריזה תואמת או תקנו את הכמות.':'בדקו לפני האישור.')+gradeWarning};
 }return {qty:row.qty,note:gradeWarning.trim()};
}
const api={cleanup,nonProduct,packageQuantity,parse,index,candidates,merge,norm};if(typeof module!=='undefined')module.exports=api;else root.HBReceipt=api;
})(globalThis);
