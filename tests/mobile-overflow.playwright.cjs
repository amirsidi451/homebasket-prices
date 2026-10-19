/* Real-browser regression. Run against this release served at HB_TEST_URL.
   Requires Playwright + its Chromium installed in the external QA environment.
   No production prices required: intercept only data files with isolated fixtures. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),zlib=require('node:zlib'),{make}=require('./fixtures/four-shown.cjs');
(async()=>{const browser=await chromium.launch();try{
 const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});
 const page=await context.newPage(),fixture=make(),provenance=require('./fixtures/v262-provenance.json');fixture.prices.fields.push('src');for(const rows of Object.values(fixture.prices.p))for(const row of rows){const source=fixture.sources[row[0]];if(source==='HAZI_HINAM')row.push('online_branch');if(source==='TIV_TAAM')row.push('picking_branches');if(source==='YOHANANOF')row.push('branch_modal_estimate');}
 const data={'meta.json':{generated_at:fixture.stamp,per_chain_freshness:Object.fromEntries(fixture.sources.map(source=>[source,{latest_snapshot_at:fixture.stamp}])),price_files:['prices.json.gz']},'chains.json':fixture.sources.map(source=>provenance.find(n=>n.source===source)||{source,name:source}),'products.json.gz':fixture.products,'prices.json.gz':fixture.prices,'images.json.gz':{},'promotions.json.gz':{fields:['promotion_id','description','starts','ends','club_id','stores'],by_chain:{}}};
 await page.route('**/*',async route=>{const name=new URL(route.request().url()).pathname.split('/').pop();if(!(name in data))return route.continue();const bytes=JSON.stringify(data[name]);await route.fulfill({status:200,contentType:name.endsWith('.gz')?'application/gzip':'application/json',body:name.endsWith('.gz')?zlib.gzipSync(bytes):bytes,headers:{'access-control-allow-origin':'*'}});});
 await page.goto(process.env.HB_TEST_URL||'http://127.0.0.1:8080/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof ready!=='undefined'&&ready);
 await page.evaluate(async()=>{applyService('רחובות','delivery');cart=[{barcode:'7290000000012',qty:2},{barcode:'7290000000029',qty:2}];location.hash='#compare';await renderCompare();});
 async function widthCheck(stage){await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.querySelector('.network-table'));const sizes=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,tableWidth:document.querySelector('.network-table').getBoundingClientRect().width}));assert.equal(sizes.innerWidth,390,stage+': layout viewport zoomed out '+JSON.stringify(sizes));assert.ok(sizes.scrollWidth<=390,stage+': page horizontally overflows '+JSON.stringify(sizes));console.log('PASS browser 390px isMobile '+stage,JSON.stringify(sizes));}
 assert.equal(await page.locator('.network-table tbody>tr').count(),7,'all seven visible networks');
 await widthCheck('before product comparison');
 await page.locator('.network-product-details>summary').click();
 await widthCheck('after product comparison');
 assert.equal(await page.locator('.network-table tbody>tr').count(),7,'all seven rows after disclosure');
 await page.locator('[data-network-sort="coverage"]').first().click();
 await widthCheck('after sorting');
 assert.equal(await page.locator('.network-sort [data-network-sort="coverage"]').getAttribute('aria-pressed'),'true');
 console.log('PASS browser sorting button clickable');
 }finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
