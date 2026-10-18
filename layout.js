/* Shared, testable layout limits; measurements supplement CSS, not a browser emulator. */
(function(root){'use strict';
function metrics(width,height,open){const content=Math.max(0,width-60),drawer=open?Math.min(320,height*.42):0;
return{contentWidth:content,controlMin:44,tableColumns:[content*.28,content*.44,content*.28],dockMax:86+drawer,bottomPadding:110+drawer};}
function designMetrics(width,height=844){
 const mobile=width<768,sidebar=width>=1100?304:0,reserve=sidebar?340:0,padding=mobile?18:24;
 const main=Math.min(1120,width-reserve),content=main-padding*2,columns=mobile?1:2,gap=14;
 const productWidth=(content-gap*(columns-1))/columns,productInner=productWidth-(mobile?32:36)-2;
 const panelInner=content-(mobile?36:44)-2,chartGap=mobile?8:10,chartSpace=panelInner-chartGap*2;
 const chartRatio=mobile?3.1:3.4;
 return {width,mobile,sidebar,reserve,main,content,columns,productWidth,productInner,addControls:44+58+44+90+6*3,controlMin:44,
 topColumns:mobile?1:2,chartColumns:[chartSpace/chartRatio,chartSpace*(mobile?1.1:1.4)/chartRatio,chartSpace/chartRatio],chartInner:panelInner,chartGap,
 stepWidth:(content-2*(mobile?6:10))/3,dockMax:sidebar?height-48:height*.48};
}
function sync(){const doc=root.document,dock=doc?.querySelector?.('.basket-dock');if(!dock||!doc.body)return;
if(root.innerWidth>=1100){doc.body.style.paddingBottom='32px';if(doc.documentElement)doc.documentElement.style.scrollPaddingBottom='32px';return;}
const box=dock.getBoundingClientRect();doc.body.style.paddingBottom=Math.max(130,Math.ceil(box.height)+24)+'px';
if(doc.documentElement)doc.documentElement.style.scrollPaddingBottom=Math.ceil(box.height+24)+'px';}
const api={metrics,designMetrics,sync};if(typeof module!=='undefined')module.exports=api;else root.HB_LAYOUT=api;
if(root.addEventListener){root.addEventListener('resize',sync);root.visualViewport?.addEventListener('resize',()=>{const drawer=root.document?.getElementById('basket-drawer');const editing=drawer?.contains?.(root.document.activeElement);if(drawer&&root.visualViewport.height<450&&!editing)drawer.open=false;sync();});}
})(globalThis);
