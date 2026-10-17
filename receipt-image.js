/* Bounded local preprocessing: contrast + grayscale + adaptive threshold. */
(function(root){'use strict';
function dimensions(w,h){if(!w||!h||w*h>50000000)throw Error('התמונה גדולה מדי. צלמו קטע קצר יותר.');
const upscale=w<1000?Math.min(2.5,1000/w):1,scale=Math.min(upscale,3000/Math.max(w,h),Math.sqrt(3000000/(w*h)));
return{width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale))};}
function enhance(data,w,h){const size=w*h;if(data.length!==size*4||size>3000000)throw Error('גודל תמונה לא נתמך');
const gray=new Uint8Array(size),sum=new Float64Array((w+1)*(h+1)),stride=w+1;
for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){const i=y*w+x,k=i*4,alpha=data[k+3]/255;const lum=(.299*data[k]+.587*data[k+1]+.114*data[k+2])*alpha+255*(1-alpha);gray[i]=Math.max(0,Math.min(255,(lum-128)*1.2+128));row+=gray[i];sum[(y+1)*stride+x+1]=sum[y*stride+x+1]+row;}}
const radius=15;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const x0=Math.max(0,x-radius),x1=Math.min(w,x+radius+1),y0=Math.max(0,y-radius),y1=Math.min(h,y+radius+1);
const mean=(sum[y1*stride+x1]-sum[y0*stride+x1]-sum[y1*stride+x0]+sum[y0*stride+x0])/((x1-x0)*(y1-y0));
const k=(y*w+x)*4,v=gray[y*w+x]>Math.max(0,mean-12)?255:0;data[k]=data[k+1]=data[k+2]=v;data[k+3]=255;}
return data;}
const api={dimensions,enhance};if(typeof module!=='undefined')module.exports=api;else root.HBReceiptImage=api;
})(globalThis);
