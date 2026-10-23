const zlib=require('node:zlib'),chains=require('./fixtures/v262-provenance.json');
function fixture(variant='with',stamp=new Date().toISOString()){
 const products={fields:['name','unit','quantity','weighted'],p:{'7290102398065':['חלב 3%','ליטר',2,0],'7290013121028':['לחם מלא','גרם',750,0],'7290110115845':['קולה','מיליליטר',1500,0]}};
 const prices={fields:['chain','last','min','median','max','stores','last_updated','src'],unit:'agorot',p:Object.fromEntries(Object.keys(products.p).map((code,i)=>[code,chains.flatMap((n,c)=>code==='7290110115845'&&c===5?[]:[[c,10000+c*100+i*50,10000+c*100+i*50,10000+c*100+i*50,10000+c*100+i*50,1,'2020-01-01',...(c===5?['online_branch']:[])]])]))};
 const eq=structuredClone(require('./fixtures/equivalents-v270.json'));eq.export_generated_at=stamp;
 const data={'chains.json':chains,'meta.json':{generated_at:stamp,price_files:['prices.json.gz'],per_chain_freshness:Object.fromEntries(chains.map(n=>[n.source,{latest_snapshot_at:stamp}]))},'products.json.gz':products,'prices.json.gz':prices,'promotions.json.gz':{fields:['promotion_id','description','starts','ends','club_id','stores'],by_chain:{}}};if(variant==='with')data['equivalents.json.gz']=eq;if(variant==='broken')data['equivalents.json.gz']='broken fixture';return data;
}
module.exports={fixture,bytes:(name,value)=>name.endsWith('.gz')?zlib.gzipSync(typeof value==='string'?value:JSON.stringify(value)):Buffer.from(JSON.stringify(value))};
