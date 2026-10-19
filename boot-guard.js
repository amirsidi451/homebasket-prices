/* Loaded inline before deferred application scripts: independent of HB and E. */
(function(){'use strict';let failed=false;
 function show(){if(!failed||!document.body)return;let box=document.getElementById('startup-error');if(!box){box=document.createElement('section');box.id='startup-error';box.className='panel warning';box.setAttribute('role','alert');box.innerHTML='<h1>האתר לא נטען במלואו</h1><p>ייתכן שהחיבור איטי או שקובץ לא נטען. הסל השמור נשאר במכשיר.</p><button type="button">נסו שוב</button>';box.querySelector('button').onclick=function(){location.reload();};document.body.prepend(box);}box.scrollIntoView?.({block:'start'});}
 addEventListener('error',function(e){if(e.target?.tagName==='SCRIPT'||e instanceof ErrorEvent){failed=true;show();}},true);
 addEventListener('unhandledrejection',function(){failed=true;show();});
 addEventListener('DOMContentLoaded',show);
})();
