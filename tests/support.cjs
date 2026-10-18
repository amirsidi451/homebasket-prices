/* Browser API stubs exercise UI wiring and real gzip streams; not visual browser QA. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.join(__dirname,'..');
function setup(storage={},options={consent:true}){
 class Element{constructor(id){this.id=id;this.value='';this.hidden=false;this.style={};this.dataset={};this.listeners={};this.textContent='';this.innerHTML='';}addEventListener(name,fn){this.listeners[name]=fn;}setAttribute(name,value){this[name]=value;}showModal(){this.open=true;}close(){this.open=false;}}
 const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
 get('metric').value='last';get('mode').value='full';
 const views=['search','cart','compare','info'].map(get),nav=views.map(v=>({hash:'#'+v.id,setAttribute(){},removeAttribute(){}}));
 const ctx={console,setTimeout,clearTimeout,URL,AbortSignal,Response,ReadableStream,TextDecoder,DecompressionStream,Blob,Date,Map,Set,Intl,JSON,Number,Math,String,Error,confirm:()=>true,navigator:{clipboard:{writeText:async()=>{}}},location:{hash:'#search',href:'file:///test/index.html',protocol:'file:'},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},document:{getElementById:get,querySelectorAll:s=>s==='.view'?views:nav,addEventListener(){}},addEventListener(){},print(){}};
 ctx.window=ctx;vm.createContext(ctx);for(const file of ['release.js','tests/fixtures/config.js','core.js','online-core.js','fees.js','top-ranking.js','savings.js','chain-status.js','comparison-view.js','product-images.js','localities.js','city-picker.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
 // Explicit synthetic service configuration, never production defaults.
 if(options.service!==false)vm.runInContext("for(const source of ['A','B','C',...Array.from({length:8},(_,i)=>'C'+i)])HB_CONFIG.chains[source]={orderUrl:'https://shop.example.test/',delivery:true,pickup:true,serviceAreas:['עיר בדיקה'],estimatedDeliveryFee:0};servicePlace={city:'עיר בדיקה',mode:'delivery'};",ctx);
 if(options.consent){vm.runInContext('if(pendingSavedCart.length)resumeSavedCart();saveCartEnabled=true;',ctx);} // Explicit test-user consent; production starts empty.
 return{ctx,get,storage,run:s=>vm.runInContext(s,ctx)};
}
async function loadFixture(env,split=false){const stamp=new Date().toISOString();const prices={fields:['chain','last','min','median','max','stores','last_updated'],unit:'agorot',p:{'3073781199918':[[0,1000,900,1050,1100,5,'2020-01-01'],[1,1200,1100,1200,1300,7,'2020-01-01']]}};const data={'chains.json':[{source:'A',name:'רשת א'},{source:'B',name:'רשת ב'}],'meta.json':{generated_at:stamp,per_chain_freshness:{A:{latest_snapshot_at:stamp},B:{latest_snapshot_at:stamp}},price_files:split?['prices_3.json.gz']:['prices.json.gz']},'products.json.gz':{fields:['name','unit','quantity','weighted'],p:{'3073781199918':['גבינה בדיקה','יחידות','1.00',0]}},'promotions.json.gz':{fields:['promotion_id','description','starts','ends','club_id','stores'],by_chain:{'0':[]}}};data[split?'prices_3.json.gz':'prices.json.gz']=prices;
 env.ctx.fixture=new Map(Object.entries(data).map(([name,value])=>[name,{stream:()=>new Blob([name.endsWith('.gz')?zlib.gzipSync(JSON.stringify(value)):JSON.stringify(value)]).stream()}]));
 env.get('query').value='גבינה';await env.run('files=fixture;load()');await env.run('renderProducts()');
}

module.exports={setup,loadFixture};
