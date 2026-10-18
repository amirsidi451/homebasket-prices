# HomeBasket 2.4
Hebrew RTL, mobile-first static grocery comparison. No server-side processing or payments.
Backup: original 2.3 directory and ZIP retained, hashes in BACKUP_v2.3_SHA256.txt.
An exact copy of the original 2.3 ZIP is included under backups/.
No live-site edits or publishing. Data exports remain unchanged. Merge existing serviceAreas/dataBase into the NEW config.js; do not overwrite new fulfilment rules with the old config.

## Run
1. Extract to a new folder; copy your filled serviceAreas/dataBase/fees fields into the new config.js (see CONFIG_HE.md); keep its new fulfilment policies.
2. Double-click START_LOCAL.bat (Python already installed). It serves only static files on 127.0.0.1:8787.
3. Load the existing export folder if data are not connected. Choose city and delivery/pickup.
4. Search, choose exact barcode/size and quantity, add. The dock has quantity/remove controls.
5. Click השווה מחירים. Advanced chain/mode settings and technical explanations are collapsed.
Read README_HE.html for the short Hebrew guide. No data exports are bundled.

## Comparison
Top 3 and full-basket savings use complete original-barcode baskets meeting chain minimums. Fulfilment fees (including strictly-above thresholds) are included when known. A below-minimum chain stays visible with the exact deficit, without a primary rank or a misleading saving. Thresholds use product subtotal, excluding delivery/pickup and platform fees.
Partial baskets never disappear: separate visible table, sorted by coverage then available
product subtotal, explicit missing count/list and opt-in substitute action via similarProducts.
Zero priced originals is NOT a free basket and has no order CTA. No price is invented.
All eight original source indexes have visible status summaries, including offline, city/mode
unavailable and stale sources. More-than-72h sources have a dated reason, not a price.
If no complete basket exists, shared mode compares identical products/quantities. Automatic
choice maximizes shared product count between a relevant fresh pair, then summed coverage;
manual selection with a nonempty intersection is respected. Auto fallback from an empty
manual intersection is explicitly disclosed and does not change manual promotion selection.
Shared totals are before shipping/customer fees and never represented as full-basket savings.
Substitutions remain explicit approvals, separate from original-barcode totals.

## Freshness
One MAX_PRICE_AGE_HOURS = 72 in core.js. Use meta.per_chain_freshness[source].latest_snapshot_at,
NOT a product price-change date. A source at exactly 72h is usable; older than 72h excluded
from all price calculations but retained with an explanation. Age labels always available;
24h+ labels have warning emphasis. Unknown/invalid/excessively future snapshots are rejected.

## Unchanged data contracts
chains.json remains an original array with stable source/index values.
products.json.gz: {fields:[name,unit,quantity,weighted], p:{barcode:[...]}}.
prices.json.gz or shard files: {fields:[chain,last,min,median,max,stores,last_updated],unit:'agorot',p:{barcode:[[...]]}}.
prices are integer agorot, catalog quantities/weighted kilograms unchanged.
Promotions remain lazy, indexed once, debounced 300ms and limited to 40 visible results;
unlinked offers are not subtracted from totals. No category/brand field required.

## Optional images
No startup image-map fetch or existence probe. No default image download.
Local images.json is read lazily when present in selected exports, or set config.imagesFile
only AFTER publishing a real map. See IMAGE_MAP_HE.md. Standalone barcode->URL map; no product
or price schema change. Safe HTTPS or site images/ paths. Letter/tone fallback if absent,
invalid or broken. Images use loading=lazy, decoding=async, referrerpolicy=no-referrer.

## Retained features
Daily-export cache reload/version guards, receipt review/OCR privacy, consent-based cart
storage, exact package/egg-grade substitutes, fee quote block disabled by default, no payment,
manual local city import without optional HTTP probe, SVG+ICO favicon and all audit files.
Cart service/receipt data are not uploaded. Initial OCR resources need internet on first use;
configured external product pictures use normal image requests without page referrer.

## Validation
949 PASS = 855 prior checks + 94 new v2.4 checks. Only prior release/favicon version expectations changed. No tests removed.
Node/real gzip/browser API stubs, synthetic 97,096 products and 60,000 promotions; 100-item
low-coverage regression (71 single-chain, 29 shared). Markup/contrast/CSS/390px geometry checks.
No real browser/mobile screenshots or real full dataset available here; no claim of real
phone/retailer/WhatsApp/photo OCR validation. Test results and limitations in VALIDATION.txt.
Run python run_tests.py (free Node.js needed for tests only). No new third-party dependencies.

## 2.4 fulfilment policies
All config amounts are shekels; calculations return integer agorot. `fulfilment.basis`
accepts `estimate` or `published`; supplied rates are set to `estimate` and UI always
labels them estimated. `fulfilment.delivery` and `.pickup` each define `amount`,
`minimumOrder`, and optional `tiers:[{above:750,amount:0}]`. The tier applies strictly
above 750, not at 750. User-specified minima apply to BOTH modes until edited separately.
Rami Levy pickup cost is unknown (not zero); existing common product-price ranking rule
for unknown pickup fees is retained, with explicit warning. No charge/payment is performed.
City affects availability only. Basic address extraction uses configured city names locally;
ambiguous/unknown addresses require entering the city alone. Clearing city removes old results.
City/mode input rebuilds current results, information, coverage, modal context and dock.
In-place +/− and amount input persist per product during suggestion rerenders; pack quantities
must be whole, weighed quantities use kilograms. Substitute close cancels pending responses.
