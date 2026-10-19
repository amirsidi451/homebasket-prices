/* v2.4 fulfilment amounts/minimumOrder/tiers.above: SHEKELS. basis: estimate | published.
 * User-supplied rates, not independently verified. UI always says estimated.
 * Minima apply to BOTH modes unless edited per mode. Tiers are strictly ABOVE the threshold.
 * Keep your serviceAreas/dataBase when upgrading; copy new fulfilment rules into your config.
 */
/* 1.9: freeAbove:null,availability:'known' filters full cities; 'verify' includes unknown coverage
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
  VICTORY_NEW_SOURCE:{freeAbove:null,availability:'verify',visible:true,name:'ויקטורי',orderUrl:'https://www.victoryonline.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:12,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":250},"pickup":{"amount":12,"minimumOrder":250}}},
  RAMI_LEVY:{freeAbove:null,availability:'known',visible:true,name:'רמי לוי',orderUrl:'https://www.rami-levy.co.il/he',deepLink:null,serviceAreas:{"delivery": ["מבשרת ציון", "פסגת זאב", "מעלה אדומים", "מודיעין", "שוהם", "רחובות", "נס ציונה", "תל אביב (מרכז וצפון, עד ארלוזורוב)", "פתח תקווה", "ראש העין", "גבעתיים", "רמת גן", "חולון", "בת ים", "אזור", "גבעת שמואל", "גני תקווה", "קריית אונו", "הרצליה", "רמת השרון", "הוד השרון", "כפר סבא", "רעננה", "אבן יהודה", "אשדוד", "גן יבנה", "אלקנה", "חדרה", "קיסריה", "אור עקיבא", "פרדס חנה כרכור", "זכרון יעקב", "בנימינה", "כפר יונה", "תל מונד", "נתניה", "חיפה", "עכו", "נשר", "נהריה", "כרמיאל", "קריית שמונה", "קצרין", "שדרות", "מעלות תרשיחא"], "pickup": []},delivery:true,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:null,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":0},"pickup":{"amount":null,"minimumOrder":0}}},
  SHUFERSAL:{freeAbove:null,availability:'verify',visible:true,name:'שופרסל',orderUrl:'https://www.shufersal.co.il/online/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:15,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":0},"pickup":{"amount":15,"minimumOrder":0,"tiers":[{"above":750,"amount":10}]}}},
 // v2.6-data (19 Oct 2026): Yochananof PICKUP ONLY (no delivery), picking fee 15, 22 pickup branches (list not encoded -> verify), no published minimum. Prices = branch modal ESTIMATE (export src=branch_modal_estimate).
  YOHANANOF:{freeAbove:null,availability:'verify',visible:true,name:'יוחננוף',orderUrl:'https://yochananof.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:false,pickup:true,estimatedDeliveryFee:null,estimatedPickupFee:15,priceBasis:'estimate',fulfilment:{"basis":"estimate","delivery":{"amount":null,"minimumOrder":0},"pickup":{"amount":15,"minimumOrder":0}}},
  YAYNO_BITAN_AND_CARREFOUR:{freeAbove:null,availability:'verify',visible:true,name:'יינות ביתן / קרפור',orderUrl:'https://www.carrefour.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:35.9,priceBasis:'estimate',estimatedPickupFee:15,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":200},"pickup":{"amount":15,"minimumOrder":200}}},
  OSHER_AD:{freeAbove:null,availability:'known',visible:false,name:'אושר עד',orderUrl:'',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:false,pickup:false,estimatedDeliveryFee:null,priceBasis:'estimate',estimatedPickupFee:null,fulfilment:{"basis":"estimate","delivery":{"amount":null,"minimumOrder":0},"pickup":{"amount":null,"minimumOrder":0}}},
 // v2.6-data: Hazi Hinam delivery towns = 88 towns from shop.hazi-hinam.co.il/Regulations (+5 locality-name aliases), pickup 35.9 from 4 branches (Hod HaSharon Sharonim, Holon Merkava, Holon Kishor, Rishon Lehi), handling 35.9, min 500. Prices = online branch 103.
  HAZI_HINAM:{freeAbove:null,availability:'known',visible:true,name:'חצי חינם',orderUrl:'https://shop.hazi-hinam.co.il/',deepLink:null,serviceAreas:{"delivery": ["אור יהודה", "אורנית", "אזור", "אחיעזר", "אייל", "אירוס", "אלישמע", "אלפי מנשה", "אלקנה", "אריאל", "אשדוד", "באר יעקב", "בית דגן", "בית חנן", "בית עובד", "בני ברק", "בת ים", "גאליה", "גבעת ברנר", "גבעת השלושה", "גבעת שמואל", "גבעתיים", "גדרה", "גליל ים", "גן שורק", "גנות", "גני תקווה", "הוד השרון", "הרצליה", "זיתן", "חגור", "חולון", "חורשים", "חמד", "חרות", "יבנה", "יגל", "יהוד", "יציץ", "ירחיב", "ירקונה", "כוכב יאיר", "כפר בילו", "כפר גיבתון", "כפר הנגיד", "כפר חב\"ד", "כפר מל\"ל", "כפר סבא", "כפר סירקין", "כפר שמריהו", "לוד", "מודיעין", "מזכרת בתיה", "מכבים", "משמר השבעה", "מתן", "נווה ירק", "נטעים", "ניר צבי", "נירית", "נס ציונה", "נען", "נצר סרני", "נתניה", "סביון", "סלעית", "סתריה", "עדנים", "עץ אפרים", "פתח תקווה", "צור יגאל", "צור יצחק", "צור נתן", "קיבוץ עינת", "קריית עקרון", "קרית אונו", "ראש העין", "ראשון לציון", "רחובות", "רמות השבים", "רמלה", "רמת גן", "רמת השרון", "רעות", "רעננה", "רשפון", "שערי תקווה", "תל אביב", "יהוד-מונוסון", "גיבתון", "מודיעין-מכבים-רעות", "כוכב יאיר-צור יגאל", "עינת"], "pickup": ["הוד השרון", "חולון", "ראשון לציון"]},delivery:true,pickup:true,estimatedDeliveryFee:35.9,priceBasis:'online',estimatedPickupFee:35.9,fulfilment:{"basis":"estimate","delivery":{"amount":35.9,"minimumOrder":500},"pickup":{"amount":35.9,"minimumOrder":500}}},
 // v2.6-data: Tiv Taam fees APPROXIMATE (third-party sources, not verified on tivtaam.co.il): delivery 29.9, pickup 15, min 300; freeAbove 750 carried over from the earlier config, unverified. Prices = modal of picking branches 514/519/502/503/512/515.
  TIV_TAAM:{freeAbove:750,availability:'verify',visible:true,name:'טיב טעם',orderUrl:'https://www.tivtaam.co.il/',deepLink:null,serviceAreas:{delivery:[],pickup:[]},delivery:null,pickup:null,estimatedDeliveryFee:29.9,priceBasis:'online',estimatedPickupFee:15,fulfilment:{"basis":"estimate","delivery":{"amount":29.9,"minimumOrder":300,"tiers":[{"above":750,"amount":0}]},"pickup":{"amount":15,"minimumOrder":300}}}
 }
};

