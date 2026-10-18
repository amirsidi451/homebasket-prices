/* Pure quotation calculator. All public amounts including basketTotal are SHEKELS.
   No payments, storage, network or DOM. Chain commission is NOT customer debt. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else{root.HBFees=factory();root.computeFees=root.HBFees.computeFees;}})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function valid(n){if(typeof n!=='number'||!Number.isFinite(n)||n<0)throw new RangeError('הגדרת דמי שירות אינה תקינה: נדרש מספר לא שלילי');return n;}
 // Decimal rational arithmetic avoids 1.005 / 2.675 binary half-cent errors.
 function fraction(n){valid(n);const [coefficient,exponent='0']=String(n).toLowerCase().split('e'),[integer,decimal='']=coefficient.split('.');let a=BigInt(integer+decimal),b=1n,power=Number(exponent)-decimal.length;if(power>=0)a*=10n**BigInt(power);else b=10n**BigInt(-power);return [a,b];}
 function cents([a,b]){const v=(a*100n*2n+b)/(2n*b);if(v>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError('סכום גדול מדי לחישוב דמי שירות');return Number(v);}
 function add([a,b],[c,d]){return [a*d+c*b,b*d];}
 function policy(base,key){
  if(base===undefined)return {type:'fixed',fixedAmount:0,percent:0,minAmount:0,maxAmount:null};
  if(!base||typeof base!=='object'||Array.isArray(base))throw new TypeError('הגדרת דמי שירות אינה תקינה');
  const overrides=base.perChain;
  if(overrides!==undefined&&(!overrides||typeof overrides!=='object'||Array.isArray(overrides)))throw new TypeError('הגדרת דמי שירות אינה תקינה');
  const override=overrides&&own(overrides,key)?overrides[key]:{};
  if(!override||typeof override!=='object'||Array.isArray(override))throw new TypeError('הגדרת דמי שירות אינה תקינה');
  const p={type:'fixed',fixedAmount:0,percent:0,minAmount:0,maxAmount:null,...base,...override};
  if(!['fixed','percent','mixed'].includes(p.type))throw new TypeError('הגדרת דמי שירות אינה תקינה: סוג לא מוכר');
  for(const k of ['fixedAmount','percent','minAmount'])valid(p[k]);if(p.maxAmount!==null){valid(p.maxAmount);if(p.maxAmount<p.minAmount)throw new RangeError('הגדרת דמי שירות אינה תקינה: מקסימום קטן ממינימום');}
  return p;
 }
 function calculate(basketCents,p){
  let value=[0n,1n];
  if(p.type!=='percent')value=add(value,fraction(p.fixedAmount));
  if(p.type!=='fixed'){const [a,b]=fraction(p.percent);value=add(value,[BigInt(basketCents)*a,10000n*b]);}
  const minimum=fraction(p.minAmount);if(value[0]*minimum[1]<minimum[0]*value[1])value=minimum;
  if(p.maxAmount!==null){const maximum=fraction(p.maxAmount);if(value[0]*maximum[1]>maximum[0]*value[1])value=maximum;}
  return cents(value);
 }
 function computeFees(basketTotal,chainKey,config){
  const basket=cents(fraction(basketTotal));
  if(config?.fees?.enabled!==true)return {customerFee:0,chainCommission:0,total:basket/100};
  // Empty baskets never incur a fee, even when a fixed fee or minimum is set.
  const customer=policy(config.fees.customerFee,chainKey),chain=policy(config.fees.chainCommission,chainKey);
  const customerFee=basket?calculate(basket,customer):0,chainCommission=basket?calculate(basket,chain):0;
  if(!Number.isSafeInteger(basket+customerFee))throw new RangeError('סכום גדול מדי לחישוב דמי שירות');
  return {customerFee:customerFee/100,chainCommission:chainCommission/100,total:(basket+customerFee)/100};
 }
 return {computeFees};
});
