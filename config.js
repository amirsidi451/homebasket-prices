/* v2.4 fulfilment amounts/minimumOrder/tiers.above: SHEKELS. basis: estimate | published.
 * User-supplied rates, not independently verified. UI always says estimated.
 * Minima apply to BOTH modes unless edited per mode. Tiers are strictly ABOVE the threshold.
 * Keep your serviceAreas/dataBase when upgrading; copy new fulfilment rules into your config.
 */
/* 1.9: availability:'known' filters full cities; 'verify' includes unknown coverage
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
 // Quotation only, disabled. All amounts below are SHEKELS; percent: 5 means 5%.
 // perChain uses source keys (e.g. RAMI_LEVY), not a numeric chain index.
 // See FEES_README_HE.md. No collection or retailer agreement exists here.
 fees:{
  enabled:false,
  customerFee:{type:'fixed',fixedAmount:5,percent:0,minAmount:0,maxAmount:null,perChain:{}},
  chainCommission:{type:'fixed',fixedAmount:5,percent:0,minAmount:0,maxAmount:null,perChain:{}}
 },
 serviceAreasFile:null, dataBase:'./data/', maxInflatedBytes:160*1024*1024,
 chains:{
  VICTORY_NEW_SOURCE:{availability:'verify',visible:true,name:'ויקטורי',orderUrl:'https://www.victoryonline.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:12,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":250},"pickup":{"amount":12,"minimumOrder":250}}},
  RAMI_LEVY:{availability:'known',visible:true,name:'רמי לוי',orderUrl:'https://www.rami-levy.co.il/he',deepLink:null,serviceAreas:{"delivery": ["מבשרת ציון", "פסגת זאב", "מעלה אדומים", "מודיעין", "שוהם", "רחובות", "נס ציונה", "תל אביב (מרכז וצפון, עד ארלוזורוב)", "פתח תקווה", "ראש העין", "גבעתיים", "רמת גן", "חולון", "בת ים", "אזור", "גבעת שמואל", "גני תקווה", "קריית אונו", "הרצליה", "רמת השרון", "הוד השרון", "כפר סבא", "רעננה", "אבן יהודה", "אשדוד", "גן יבנה", "אלקנה", "חדרה", "קיסריה", "אור עקיבא", "פרדס חנה כרכור", "זכרון יעקב", "בנימינה", "כפר יונה", "תל מונד", "נתניה", "חיפה", "עכו", "נשר", "נהריה", "כרמיאל", "קריית שמונה", "קצרין", "שדרות", "מעלות תרשיחא"], "pickup": []},delivery:true,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:null,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":0},"pickup":{"amount":null,"minimumOrder":0}}},
  SHUFERSAL:{availability:'verify',visible:true,name:'שופרסל',orderUrl:'https://www.shufersal.co.il/online/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:15,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":0},"pickup":{"amount":15,"minimumOrder":0,"tiers":[{"above":750,"amount":10}]}}},
  YOHANANOF:{availability:'verify',visible:true,name:'יוחננוף',orderUrl:'https://yochananof.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:false,pickup:true,estimatedDeliveryFee:null,estimatedPickupFee:15,priceBasis:'estimate',fulfilment:{"basis":"estimate","delivery":{"amount":null,"minimumOrder":0},"pickup":{"amount":15,"minimumOrder":0}}},
  YAYNO_BITAN_AND_CARREFOUR:{availability:'verify',visible:true,name:'יינות ביתן / קרפור',orderUrl:'https://www.carrefour.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:15,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":200},"pickup":{"amount":15,"minimumOrder":200}}},
  OSHER_AD:{availability:'known',visible:false,name:'אושר עד',orderUrl:'',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:false,pickup:false,estimatedDeliveryFee:null,priceBasis:'estimate',estimatedPickupFee:null,fulfilment:{"basis":"estimate","delivery":{"amount":null,"minimumOrder":0},"pickup":{"amount":null,"minimumOrder":0}}},
  HAZI_HINAM:{availability:'known',visible:true,name:'חצי חינם',orderUrl:'https://shop.hazi-hinam.co.il/',deepLink:null,serviceAreas:{"delivery": ["אור יהודה", "אורנית", "אזור", "אריאל", "אשדוד", "באר יעקב", "בני ברק", "בת ים", "גבעת שמואל", "גבעתיים", "גדרה", "גליל ים", "גני תקווה", "הוד השרון", "הרצליה", "חולון", "יבנה", "יהוד", "כוכב יאיר", "כפר סבא", "לוד", "מודיעין", "מזכרת בתיה", "מכבים", "נס ציונה", "נתניה", "סביון", "עץ אפרים", "פתח תקווה", "קריית עקרון", "קריית אונו", "ראש העין", "ראשון לציון", "רחובות", "רמלה", "רמת גן", "רמת השרון", "רעות", "רעננה", "תל אביב", "אלקנה", "אלפי מנשה", "גן שורק", "כפר חב\"ד", "כפר שמריהו", "צור יגאל", "צור יצחק"], "pickup": ["הוד השרון", "חולון", "ראשון לציון"]},delivery:true,pickup:true,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:35.9,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":500},"pickup":{"amount":35.9,"minimumOrder":500}}},
  TIV_TAAM:{availability:'verify',visible:true,name:'טיב טעם',orderUrl:'https://www.tivtaam.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:29.9,priceBasis:'estimate',estimatedPickupFee:15,fulfilment:{"basis":"estimate","delivery":{"amount":29.9,"minimumOrder":300,"tiers":[{"above":750,"amount":0}]},"pickup":{"amount":15,"minimumOrder":300}}}
 }
};
