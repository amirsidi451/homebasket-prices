/* Shared, testable layout limits; measurements supplement CSS, not a browser emulator. */
(function(root){'use strict';
function metrics(width,height,open){const content=Math.max(0,width-60),drawer=open?Math.min(320,height*.42):0;
return{contentWidth:content,controlMin:44,tableColumns:[content*.28,content*.44,content*.28],dockMax:86+drawer,bottomPadding:110+drawer};}
function sync(){const doc=root.document,dock=doc?.querySelector?.('.basket-dock');if(!dock||!doc.body)return;
if(root.innerWidth>=1100){doc.body.style.paddingBottom='32px';if(doc.documentElement)doc.documentElement.style.scrollPaddingBottom='32px';return;}
const box=dock.getBoundingClientRect();doc.body.style.paddingBottom=Math.max(130,Math.ceil(box.height)+24)+'px';
if(doc.documentElement)doc.documentElement.style.scrollPaddingBottom=Math.ceil(box.height+24)+'px';}
const api={metrics,sync};if(typeof module!=='undefined')module.exports=api;else root.HB_LAYOUT=api;
if(root.addEventListener){root.addEventListener('resize',sync);root.visualViewport?.addEventListener('resize',()=>{const drawer=root.document?.getElementById('basket-drawer');const editing=drawer?.contains?.(root.document.activeElement);if(drawer&&root.visualViewport.height<450&&!editing)drawer.open=false;sync();});}
})(globalThis);
