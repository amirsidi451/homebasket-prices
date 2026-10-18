/* Shared, testable layout limits; measurements supplement CSS, not a browser emulator. */
(function(root){'use strict';
function metrics(width,height,open){const content=Math.max(0,width-60),drawer=open?Math.min(320,height*.42):0;
return{contentWidth:content,controlMin:44,tableColumns:[content*.28,content*.44,content*.28],dockMax:86+drawer,bottomPadding:110+drawer};}
function designMetrics(width,height=844){
 const mobile=width<768,sidebar=width>=1100?288:0,reserve=sidebar?312:0,padding=sidebar?12:mobile?18:24;
 const main=Math.min(1200,width)-reserve,content=main-padding*2,columns=mobile?1:2,gap=14;
 const productWidth=(content-gap*(columns-1))/columns,productInner=productWidth-(mobile?32:36)-2;
 const panelInner=content-(mobile?36:44)-2,chartGap=mobile?8:10,chartSpace=panelInner-chartGap*2;
 const chartRatio=mobile?3.1:3.4;
 return {width,mobile,sidebar,reserve,main,content,columns,productWidth,productInner,addControls:44+58+44+90+6*3,controlMin:44,
 topColumns:mobile?1:2,chartColumns:[chartSpace/chartRatio,chartSpace*(mobile?1.1:1.4)/chartRatio,chartSpace/chartRatio],chartInner:panelInner,chartGap,
 stepWidth:(content-2*(mobile?6:10))/3,dockMax:sidebar?height-48:Math.max(82,height*.25)};
}
let basketHome=null,basketNext=null,basketBusy=false,basketBound=false;
function closeBasket(){const doc=root.document,dialog=doc?.getElementById?.('basket-mobile-dialog'),drawer=doc?.getElementById?.('basket-drawer');if(!dialog?.open)return;if(drawer)drawer.open=false;dialog.close();restoreBasket();}
function restoreBasket(){const doc=root.document,dialog=doc?.getElementById?.('basket-mobile-dialog'),dock=doc?.querySelector?.('.basket-dock');if(!dock||!basketHome)return;basketBusy=true;if(basketNext?.parentNode===basketHome)basketHome.insertBefore(dock,basketNext);else basketHome.appendChild(dock);doc.documentElement?.classList?.remove('basket-modal-open');doc.body?.classList?.remove('basket-modal-open');const drawer=doc.getElementById('basket-drawer');if(drawer)drawer.open=false;basketHome=null;basketNext=null;basketBusy=false;doc.getElementById('basket-drawer')?.querySelector?.('summary')?.focus?.({preventScroll:true});}
function syncBasketModal(){if(basketBusy)return;const doc=root.document,dialog=doc?.getElementById?.('basket-mobile-dialog'),drawer=doc?.getElementById?.('basket-drawer'),dock=doc?.querySelector?.('.basket-dock'),slot=doc?.getElementById?.('basket-mobile-slot');if(!dialog?.showModal||!drawer||!dock||!slot?.appendChild)return;
if(!basketBound){basketBound=true;doc.getElementById('basket-mobile-close').onclick=closeBasket;dialog.addEventListener('close',restoreBasket);dialog.addEventListener('cancel',()=>{if(drawer)drawer.open=false;});}
if(doc.getElementById('order-dialog')?.open){if(dialog.open)closeBasket();drawer.open=false;return;}
if(root.innerWidth>=1100){if(dialog.open)closeBasket();return;}
if(drawer.open&&!dialog.open){basketBusy=true;basketHome=dock.parentNode;basketNext=dock.nextSibling;slot.appendChild(dock);doc.documentElement?.classList?.add('basket-modal-open');doc.body?.classList?.add('basket-modal-open');dialog.showModal();doc.getElementById('basket-mobile-close').focus?.();basketBusy=false;}else if(!drawer.open&&dialog.open)closeBasket();}
function syncOrderModal(){const doc=root.document,open=!!doc?.getElementById?.('order-dialog')?.open;for(const element of [doc?.documentElement,doc?.body]){if(open)element?.classList?.add('order-modal-open');else element?.classList?.remove('order-modal-open');}return open;}
function sync(){syncOrderModal();syncBasketModal();const style=root.document?.documentElement?.style,vh=Math.min(root.innerHeight||10000,root.visualViewport?.height||root.innerHeight||844);if(style){if(style.setProperty)style.setProperty('--visual-height',vh+'px');else style['--visual-height']=vh+'px';}const doc=root.document,dock=doc?.querySelector?.('.basket-dock');if(!dock||!doc.body)return;
if(root.innerWidth>=1100){doc.body.style.paddingBottom='32px';if(doc.documentElement)doc.documentElement.style.scrollPaddingBottom='32px';return;}
const box=dock.getBoundingClientRect();doc.body.style.paddingBottom=Math.max(130,Math.ceil(box.height)+24)+'px';
if(doc.documentElement)doc.documentElement.style.scrollPaddingBottom=Math.ceil(box.height+24)+'px';}
let lastScroll=0,scrollFrame=false,scrollLockUntil=0;
function lockScrollChrome(){scrollLockUntil=Date.now()+700;const nav=root.document?.getElementById?.('workflow-nav');nav?.setAttribute('data-scroll-hidden','false');}
function scrollChrome(){scrollFrame=false;const nav=root.document?.getElementById?.('workflow-nav'),y=root.scrollY||0,previous=lastScroll;lastScroll=y;if(!nav)return;const editing=nav.contains?.(root.document.activeElement);if(Date.now()<scrollLockUntil){nav.setAttribute('data-scroll-hidden','false');return;}if(root.innerWidth>=1100||y<80||y<previous-24||editing)nav.setAttribute('data-scroll-hidden','false');else if(y>120&&y>previous+24)nav.setAttribute('data-scroll-hidden','true');}
const api={metrics,designMetrics,sync,scrollChrome,lockScrollChrome,closeBasket,syncBasketModal,syncOrderModal};if(typeof module!=='undefined')module.exports=api;else root.HB_LAYOUT=api;
if(root.addEventListener){root.addEventListener('resize',sync);root.addEventListener('hashchange',lockScrollChrome);root.addEventListener('pageshow',lockScrollChrome);root.addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;(root.requestAnimationFrame||root.setTimeout)(scrollChrome);}},{passive:true});root.visualViewport?.addEventListener('resize',()=>{const drawer=root.document?.getElementById('basket-drawer');const editing=drawer?.contains?.(root.document.activeElement);if(drawer&&root.visualViewport.height<450&&!editing)drawer.open=false;sync();});}
})(globalThis);
