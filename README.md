# HomeBasket 1.7
Buildless Hebrew RTL static comparison app. Read README_HE.html.
Original 1.6 UX folder/ZIP retained; no hosted-site changes.
## Run
Close the previous local server; double-click START_LOCAL.bat (Python required).
Static files served only at http://127.0.0.1:8787; no OCR/backend upload endpoint.
Choose existing exported data directory if ./data is not populated.
## Basket consent
Production always starts with an empty active cart. Previously saved cart is pending
until explicit resume. Saving future visits is opt-in. A new unsaved visit does not
overwrite a pending saved basket. Test helpers explicitly model consenting users;
v17 tests separately exercise real no-consent startup.
Only identical barcodes merge; a substitute is tagged using separate provenance data.
## Data unchanged
chains.json index/source; compact fields/p product and agorot price exports;
prices_1..9 splitting; meta.per_chain_freshness[source].latest_snapshot_at determines
48h freshness, never a product's last_updated. No promotion deductions without links.
## Receipt processing
Tesseract.js 6.0.1, lazy Hebrew/English worker and language downloads.
Local preprocessing in receipt-image.js, <=3MP/3000px, small-image upscaling,
grayscale/contrast/adaptive threshold with opt-out. No image or receipt text persistence.
Receipt-core filters non-products, performs bounded token fuzzy matching and uses
actual price coverage for candidate ranking. Grade corrections remain unverified suggestions.
Pieces are distinct from purchase packages; explicit approval remains mandatory.
## Mobile
layout.js measures the dock and pads body/scroll area; CSS has bounded drawer height,
44px quantity controls, a compact 3-column primary table and scrollable detailed tables.
Mathematical layout audits are not real-browser/mobile visual QA.
## Tests
Run each tests/*.test.cjs with Node, then python tests/markup.test.py.
See VALIDATION.txt and test-results.txt. Legacy UI assertions were adapted to the
requested collapsed-table UI and explicit consent, not deleted.
No real photographed-receipt accuracy measurement or real browser run performed here.
