/* Synthetic fixed TEST configuration, never production data.
 * 1.9: availability:'known' filters full cities; 'verify' includes unknown coverage
 * with a warning. visible:false hides a chain without removing its data index.
 * Explicit unsupported modes (false) remain excluded, including pickup-only chains.
 * Pickup fees use estimatedPickupFee in SHEKELS.
 * Edit this file locally. See CONFIG_HE.md. No customer location is stored here.
 * null = unknown, false = unavailable, true = enabled by the operator.
 * serviceAreas: {delivery:['אור יהודה'], pickup:['אור יהודה']} or a shared city array.
 * '*' explicitly means all cities. known: empty lists exclude. verify: empty lists require retailer confirmation.
 * Fees are estimated SHEKELS, not agorot; null means unknown, 0 means free.
 * priceBasis:'estimate' uses the export's last scalar, NOT a verified online price.
 * Change to 'online' ONLY after the exporter actually supplies the online source.
 * deepLink is an optional static HTTPS URL on the same origin as orderUrl.
 * It does not transfer a cart automatically. Never insert a location into URLs.
 */
window.HB_CONFIG = {
 serviceAreasFile:'chain_service_areas.json', dataBase:'./data/', maxInflatedBytes:160*1024*1024,
 chains:{
  VICTORY_NEW_SOURCE:{availability:'verify',visible:true,name:'ויקטורי',orderUrl:'https://www.victoryonline.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate'},
  RAMI_LEVY:{availability:'known',visible:true,name:'רמי לוי',orderUrl:'https://www.rami-levy.co.il/he',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:true,pickup:true,estimatedDeliveryFee:35.9,priceBasis:'estimate'},
  SHUFERSAL:{availability:'verify',visible:true,name:'שופרסל',orderUrl:'https://www.shufersal.co.il/online/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate'},
  YOHANANOF:{availability:'verify',visible:true,name:'יוחננוף',orderUrl:'https://yochananof.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:false,pickup:true,estimatedDeliveryFee:null,estimatedPickupFee:15,priceBasis:'estimate'},
  YAYNO_BITAN_AND_CARREFOUR:{availability:'verify',visible:true,name:'יינות ביתן / קרפור',orderUrl:'https://www.carrefour.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate'},
  OSHER_AD:{availability:'known',visible:false,name:'אושר עד',orderUrl:'',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:false,pickup:false,estimatedDeliveryFee:null,priceBasis:'estimate'},
  HAZI_HINAM:{availability:'known',visible:true,name:'חצי חינם',orderUrl:'https://shop.hazi-hinam.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:true,pickup:true,estimatedDeliveryFee:35.9,priceBasis:'estimate'},
  TIV_TAAM:{availability:'verify',visible:true,name:'טיב טעם',orderUrl:'https://www.tivtaam.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:29.9,priceBasis:'estimate'}
 }
};
