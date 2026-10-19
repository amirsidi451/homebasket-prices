/* Synthetic customer-reported coverage and subtotal scenarios. No live prices. */
const barcodes=['7290003996117','7290008409582','7290017088051','7290108359282','7290006374684','7290001201602','7290000408316','7290000046327','7290005287206','7290018825020','100','200'],cart10=barcodes.slice(0,10).map((barcode,i)=>({barcode,qty:i===2?2:i===6?4:i===9?2:1}));
function scenario(city,size,spec,mode='pickup',networks,config,meta){const cart=size===10?cart10.map(i=>({...i})):barcodes.slice(0,size).map((barcode,i)=>({barcode,qty:size===8&&i===0?1.5:1})),records=new Map(cart.map(i=>[i.barcode,new Map()]));for(const n of networks){const [coverage,total]=spec[n.source]||[Math.min(size,4),35000],included=cart.slice(0,coverage),pivot=included.find(i=>i.qty===1);if(!pivot)continue;const base=included.filter(i=>i!==pivot).reduce((sum,i)=>sum+Math.round(100*i.qty),0);for(const i of included)records.get(i.barcode).set(n.index,{last:i===pivot?total-base:100});}return{cart,records,networks,meta,config,place:{city,mode}}}
const specs=[
 ['תל אביב',10,{VICTORY_NEW_SOURCE:[10,31726],SHUFERSAL:[9,30000],YAYNO_BITAN_AND_CARREFOUR:[8,27500],TIV_TAAM:[7,25450],RAMI_LEVY:[8,25000],HAZI_HINAM:[7,10000],YOHANANOF:[10,2000]},'VICTORY_NEW_SOURCE'],
 ['מצפה רמון',7,{VICTORY_NEW_SOURCE:[7,30000],SHUFERSAL:[6,20000],YAYNO_BITAN_AND_CARREFOUR:[5,10000],TIV_TAAM:[4,17000],RAMI_LEVY:[5,25000],HAZI_HINAM:[4,10000],YOHANANOF:[7,2000]},'VICTORY_NEW_SOURCE'],
 ['חיפה',8,{SHUFERSAL:[8,40000],VICTORY_NEW_SOURCE:[7,35000],YAYNO_BITAN_AND_CARREFOUR:[6,10000],TIV_TAAM:[5,26000],RAMI_LEVY:[8,25000],HAZI_HINAM:[6,10000],YOHANANOF:[8,2000]},'SHUFERSAL'],
 ['נתניה',6,{SHUFERSAL:[6,30000],VICTORY_NEW_SOURCE:[5,25000],YAYNO_BITAN_AND_CARREFOUR:[6,6870],TIV_TAAM:[5,30000],RAMI_LEVY:[6,25000],HAZI_HINAM:[5,10000],YOHANANOF:[6,2000]},'SHUFERSAL'],
 ['הוד השרון',12,{SHUFERSAL:[12,50000],VICTORY_NEW_SOURCE:[12,49000],YAYNO_BITAN_AND_CARREFOUR:[12,48000],TIV_TAAM:[11,45000],RAMI_LEVY:[12,25000],HAZI_HINAM:[11,15860],YOHANANOF:[12,2000]},'YAYNO_BITAN_AND_CARREFOUR']
];

module.exports={barcodes,cart10,specs,scenario};
