# HomeBasket 2.0
Buildless Hebrew RTL static comparison app. Read README_HE.html.
Original 1.9 folder/ZIP retained; no hosted-site changes.
## Changes in 2.0
Unsupported delivery modes are absent from chain tables, selectors and handoff cards.
Rami unknown pickup is verified on the retailer site, not blocked by missing city lists.
Search invalidates immediately on input, displays loading, and only renders the last query.
Natural Hebrew counts, display-only name cleanup and direction-isolated clipboard text.
Tests use tests/fixtures/config.js, never empty-city assumptions about production config.
471 checks pass; full rerun with nonempty synthetic production city lists also passes.
No automatic saved downloads, download anchors, file-save APIs or attachment redirects.
Data is still fetched into browser memory; local OCR resources load on demand as before.
Actual WhatsApp rendering and actual-phone/visual browser QA remain manual checks.
Actual chain_service_areas.json still did not arrive; known delivery cities not invented.

## Availability
Read CONFIG_HE.md. Five chains use verify: compare them without city lists,
with retailer address-verification warnings; explicit unsupported modes still excluded.
Rami Levy and Hazi Hinam use known city lists. Their actual chain_service_areas.json
was not supplied; see PENDING_SERVICE_AREAS.txt. Optional auto-load from data/ or
local JSON file selection is implemented; real city lists are NOT populated yet.
Osher Ad hidden without changing any original source index.
Delivery estimates prefilled per request; Yohananof pickup-only estimate 15 NIS.
Fees remain separate from product ranking. City memory-only, never stored/sent.
One scalar last per chain, labelled estimate. No automatic external cart filling.

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
