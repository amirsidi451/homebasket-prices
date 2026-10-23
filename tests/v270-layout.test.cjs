const fs=require('node:fs'),assert=require('node:assert/strict');
const css=fs.readFileSync(require.resolve('../redesign.css'),'utf8'),html=fs.readFileSync(require.resolve('../index.html'),'utf8'),table=fs.readFileSync(require.resolve('../network-table.js'),'utf8');
function test(n,f){f();console.log('PASS v270 accessibility '+n)}
const lum=h=>{const c=h.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
for(const [fg,bg]of [['#ffffff','#08766c'],['#ffffff','#227c64'],['#ffffff','#086257'],['#ffffff','#1a6752'],['#12332f','#ffffff'],['#4b6660','#ffffff'],['#e3f3eb','#182a23'],['#b1c9bc','#182a23'],['#684300','#f8f0df'],['#ffe1a3','#43351d']])test('AA palette '+fg+' on '+bg,()=>assert.ok(contrast(fg,bg)>=4.5));
test('dark theme explicitly overrides inherited dark button ink',()=>assert.match(css,/--brand:#227c64;--brand-ink:#fff/));
test('compact labels in one non-wrapping sort control',()=>{assert.match(table,/\['coverage','כיסוי'\]/);assert.match(css,/\.network-sort button\{white-space:nowrap\}/)});
test('quantity controls have at least 44px touch area',()=>assert.match(css,/\.product-card \.bottom button\{[^}]*min-height:44px/));
test('visible keyboard focus',()=>assert.match(css,/button:focus-visible,a:focus-visible,input:focus-visible,summary:focus-visible\{outline:3px/));
test('footer release and stable workflow anchors retained',()=>{for(const id of ['app-version','comparison','order-close','order-continue','step-build','step-location','step-compare'])assert.ok(html.includes('id="'+id+'"'))});
