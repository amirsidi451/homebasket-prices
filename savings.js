/* Full-basket reference comparison, independent of geographic Top 3 ranking.
   No fetch, storage, promotions arithmetic or substitutions. Amounts are agorot. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'),require('./online-core.js'),require('./fees.js'));else root.HBSavings=factory(root.HB,root.HBOnline,root.HBFees);})(typeof globalThis!=='undefined'?globalThis:this,function(H,O,F){'use strict';
 const money=n=>new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS'}).format(n/100);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function difference(reference,chosen){if(!Number.isFinite(reference)||!Number.isFinite(chosen)||reference<0||chosen<0)return null;const amount=reference-chosen;return {amount,percent:reference>0?100*amount/reference:null};}
 function model({rows,cartSize,networks,config,place,snapshots,now=Date.now(),chosenChain}){
  const source=new Map((rows||[]).map(r=>[r.chain,r]));
  const all=(networks||[]).map((n,chain)=>{
   const r=source.get(chain),fresh=H.fresh(snapshots?.[chain],now),valid=!!r&&Number.isInteger(r.coverage)&&r.coverage>=0&&r.coverage<=cartSize&&Number.isSafeInteger(r.total)&&r.total>=0;
   const coverage=fresh&&valid?r.coverage:0,itemsTotal=coverage>0?r.total:null,quote=O.quote(n,config,place?.mode,itemsTotal),fee=quote.fee;
   const feesEnabled=config?.fees?.enabled===true,customerFee=feesEnabled&&itemsTotal!==null?Math.round(F.computeFees(itemsTotal/100,n.source,config).customerFee*100):0;
   const sum=itemsTotal!==null&&fee!==null?itemsTotal+fee+customerFee:null;
   const total=Number.isSafeInteger(sum)?sum:null,state=O.service(n,config,place);
   let availability=state.label;
   if(state.status==='hidden')availability='אין הזמנות אונליין — מחיר לייחוס בלבד';
   else if(state.status==='outside')availability='לא זמינה בעירך לפי ההגדרות — מחיר לייחוס בלבד';
   else if(state.status==='unknown')availability='יש לבדוק זמינות — אזורי השירות אינם ידועים';
   return {...quote,chain,name:n.name,fresh,coverage,itemsTotal,fee,total,eligible:state.eligible,availability,...(feesEnabled?{feesEnabled:true,customerFee}:{}),full:cartSize>0&&fresh&&valid&&coverage===cartSize&&!quote.belowMinimum};
  });
  const full=all.filter(r=>r.full),partial=all.filter(r=>!r.full);
  // One basis for EVERY reference row. An unknown fee is never assumed to be zero.
  const basis=full.length&&full.every(r=>r.total!==null)?'total':'products';
  full.forEach(r=>{r.amount=basis==='total'?r.total:r.itemsTotal+(r.customerFee||0);});
  full.sort((a,b)=>a.amount-b.amount||a.chain-b.chain);
  const eligible=full.filter(r=>r.eligible),cheapest=eligible[0]||null;
  const nominated=eligible.find(r=>r.chain===chosenChain),chosen=nominated||cheapest;
  const highest=full.length?full[full.length-1].amount:null;
  const average=full.length?full.reduce((sum,r)=>sum+r.amount,0)/full.length:null;
  full.forEach(r=>{r.saving=chosen?difference(r.amount,chosen.amount):null;r.bar=highest>0?100*r.amount/highest:0;});
  return {all,full,partial,basis,...(config?.fees?.enabled===true?{feesEnabled:true}:{}),chosen,chosenFromTop:!!nominated,cheapest,cartSize,highest,average,versusHighest:chosen&&full.length>1?difference(highest,chosen.amount):null,versusAverage:chosen&&full.length>1?difference(average,chosen.amount):null,maximumSaving:cheapest&&full.length>1?difference(highest,cheapest.amount):null};
 }
 function savingText(d){if(!d)return 'אין בסיס להשוואה';if(d.amount===0)return 'אותו מחיר';const p=d.percent===null?'':(' ('+new Intl.NumberFormat('he-IL',{maximumFractionDigits:1}).format(Math.abs(d.percent))+'%)');return (d.amount>0?'חוסך ':'יקר יותר ב־')+money(Math.abs(d.amount))+p;}
 // Presentation only: use the existing model's amounts and comparison groups unchanged.
 function render(m,mode){
  const feeName=mode==='pickup'?'דמי איסוף':'דמי משלוח',basis=m.basis==='total'?(m.feesEnabled?'כולל משלוח/איסוף משוערים ודמי שירות לדוגמה':'כולל משלוח או איסוף משוערים'):(m.feesEnabled?'מוצרים ודמי שירות לדוגמה, לפני משלוח/איסוף':'מחירי מוצרים לפני משלוח או איסוף');
  let headline='אין כרגע רשת רלוונטית עם כיסוי מלא לקביעת חיסכון';
  if(m.cheapest&&m.full.length>1)headline='ברשת הזולה ביותר מבין הרשתות הרלוונטיות תחסוך עד '+money(m.maximumSaving.amount)+' לעומת הרשת היקרה בהשוואה';
  else if(m.cheapest)headline='רק רשת אחת מכסה את כל הסל — אין מספיק נתונים לחישוב חיסכון';
  const row=r=>'<tr'+(r.chain===m.chosen?.chain?' class="savings-chosen"':'')+'><th scope="row"><bdi>'+esc(r.name)+'</bdi>'+(r.chain===m.chosen?.chain?' · הרשת הנבחרת':'')+'<small>'+esc(r.availability)+(r.belowMinimum?' · '+esc(O.minimumLabel(r)):'')+(r.fresh?'':' · הרשת לא עדכנית')+'</small></th><td><bdi>'+(r.itemsTotal===null?'אין מחיר עדכני':money(r.itemsTotal))+'</bdi></td><td><bdi>'+(r.fee===null?feeName+' לא ידועים':money(r.fee))+'</bdi></td>'+(m.feesEnabled?'<td><bdi>'+(r.itemsTotal===null?'לא מחושב':money(r.customerFee))+'</bdi></td>':'')+'<td><bdi>'+(r.total===null?'לא ניתן לחשב סך כולל':money(r.total))+'</bdi></td><td>'+r.coverage+' מתוך '+m.cartSize+' מוצרים</td><td><bdi>'+(r.belowMinimum?esc(O.minimumLabel(r)):(r.full?savingText(r.saving):'מחיר חלקי, לא ניתן להשוות'))+'</bdi></td></tr>';
  const table=rows=>'<div class="table-wrap" tabindex="0" role="region" aria-label="השוואת חיסכון בין הרשתות, אפשר לגלול לצדדים"><table class="savings-table"><thead><tr><th>רשת וזמינות</th><th>סך מוצרים</th><th>'+feeName+' משוערים</th>'+(m.feesEnabled?'<th>דמי שירות (לדוגמה)</th>':'')+'<th>סך כולל משוער</th><th>כיסוי הסל</th><th>בחירה ברשת הנבחרת לעומת רשת זו</th></tr></thead><tbody>'+rows.map(row).join('')+'</tbody></table></div>';
  let html='<section class="panel savings-section" aria-labelledby="savings-heading"><span class="eyebrow">כל '+m.all.length+' הרשתות בתמונה</span><h2 id="savings-heading">כמה אתם חוסכים?</h2><p class="savings-headline">'+esc(headline)+'</p>';
  if(m.versusHighest)html+='<div class="savings-highlights"><p>לעומת היקרה ביותר: <strong><bdi>'+savingText(m.versusHighest)+'</bdi></strong></p><p>לעומת ממוצע '+m.full.length+' הרשתות בעלות הכיסוי המלא (כולל הנבחרת): <strong><bdi>'+savingText(m.versusAverage)+'</bdi></strong></p></div>';
  // Every original chain remains visible. Missing/partial/minimum-failing rows get
  // no comparable bar; no zero price or extrapolated basket is introduced.
  const fullByChain=new Map(m.full.map(r=>[r.chain,r]));
  html+='<figure class="savings-chart"><figcaption>מחיר הסל בכל רשת · '+basis+'</figcaption><ul>'+m.all.map(raw=>{
   const r=fullByChain.get(raw.chain),missing=!r;
   const reason=!raw.fresh?'הרשת לא עדכנית':raw.belowMinimum?O.minimumLabel(raw):raw.coverage===0?'אין מחיר למוצרים בסל':'מחיר חלקי, לא ניתן להשוות';
   return '<li data-chart-chain="'+raw.chain+'"'+(missing?' class="savings-unpriced"':'')+'><span><bdi>'+esc(raw.name)+'</bdi><small>'+esc(raw.availability)+'</small></span><div class="savings-track" aria-hidden="true">'+(r?'<div class="savings-bar'+(r.chain===m.chosen?.chain?' chosen':'')+'" style="width:'+r.bar.toFixed(3)+'%"></div>':'')+'</div><bdi>'+(r?money(r.amount):esc(reason))+'</bdi></li>';
  }).join('')+'</ul></figure>';
  html+='<details class="why savings-why"><summary>למה? איך משווים חיסכון הוגן?</summary><p><strong>בסיס החיסכון והגרף: '+basis+'.</strong> '+(m.basis==='products'?'חסרים דמי משלוח/איסוף בחלק מהרשתות, לכן הם אינם נכללים בחיסכון באף רשת.':'')+'</p><p>מחירי הערכה בלבד. גם רשתות שאינן זמינות בעירך או שאינן מציעות הזמנות אונליין מוצגות כנקודת ייחוס, לא כהמלצה להזמנה. משווים את אותם ברקודים וכמויות, ללא חלופות ומבלי להפחית מבצעים לא מאומתים. מחיר חלקי אינו מחיר סל מלא.</p>';
  if(m.feesEnabled)html+='<p class="warning">דמי השירות הם חישוב לדוגמה בלבד. אין גבייה באתר; התשלום לרשת מתבצע בנפרד באתר שלה.</p>';
  if(m.chosen)html+='<p>הרשת הנבחרת לחישוב החיסכון: <strong><bdi>'+esc(m.chosen.name)+'</bdi></strong>. '+(m.chosenFromTop?'זו הרשת במקום הראשון ב־Top 3. כשחסרים דמי שירות, בסיס החיסכון כאן עשוי להיות שונה מהדירוג שם.':'נבחרה הזולה בכיסוי מלא מבין הרשתות הרלוונטיות לפי בסיס החיסכון הזה.')+'</p>';
  html+='</details><details class="savings-detail"><summary>טבלת מחירים מלאה לכל הרשתות</summary><h3>סל מלא — השוואה הוגנת</h3>'+(m.full.length?table(m.full):'<p>אין רשת עם מחיר עדכני לכל המוצרים בסל.</p>');
  if(m.partial.length)html+='<h3>מחירים חלקיים, מינימום הזמנה או נתונים לא עדכניים</h3><p>מחיר חלקי או סל מתחת למינימום אינם בסיס להשוואה הוגנת. רשתות אלו אינן נכללות בחיסכון, בממוצע או בגרף ההשוואתי; סכום זול יותר אינו מעיד על סל זול יותר.</p>'+table(m.partial);
  return html+'</details></section>';
 }

 return {model,difference,savingText,render};
});
