/* Synthetic regression carts with the exact customer barcodes; no live prices. */
const F=require('./v266-scenarios.cjs');
const natanyaCodes=['7290107932134','7290001216040','7290003643714','7290100700396','7290000211503','7290000692227'];
function telAviv(networks,config,meta){return F.scenario('תל אביב',10,{VICTORY_NEW_SOURCE:[10,31726],SHUFERSAL:[9,27356],RAMI_LEVY:[9,27000],YAYNO_BITAN_AND_CARREFOUR:[8,26440],TIV_TAAM:[7,25450],HAZI_HINAM:[7,10000],YOHANANOF:[10,2000]},'pickup',networks,config,meta)}
function natanya(networks,config,meta){const x=F.scenario('נתניה',6,{VICTORY_NEW_SOURCE:[6,31000],SHUFERSAL:[6,30000],RAMI_LEVY:[5,27000],YAYNO_BITAN_AND_CARREFOUR:[5,24000],TIV_TAAM:[4,31000],HAZI_HINAM:[4,10000],YOHANANOF:[6,2000]},'pickup',networks,config,meta);const old=x.cart.map(i=>i.barcode);x.cart=x.cart.map((i,j)=>({...i,barcode:natanyaCodes[j]}));x.records=new Map(old.map((c,j)=>[natanyaCodes[j],x.records.get(c)]));return x}
module.exports={telAviv,natanya,natanyaCodes};
