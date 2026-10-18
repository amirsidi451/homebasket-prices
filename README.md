# HomeBasket 2.2.4
Buildless Hebrew RTL static comparison app. Read README_HE.html.
Original 2.2.3 folder/ZIP retained; no hosted-site changes.
## Focused fixes in 2.2.4
Exclusive chain counter: exactly one assignment per original source index; total remains 8 for real exports. Priority: unavailable in city/mode (including no online ordering) > stale scan > partial checked basket (including zero priced originals) > unknown/verify availability > full fresh known-city priced basket. Before all basket prices/data load, or with an empty cart, remaining fresh supported chains await verification, not a fabricated partial/full price. Totals always sum to original source count. Counter is display-only; no rank/filter arithmetic changed.
Top3 and remaining chain cards list normalized names and quantities of original products lacking fresh prices, plus a clear missing-products warning. Approved substitutes remain separately labelled; no silent original-barcode coverage changes.
Optional service areas are NEVER requested over HTTP: direct local-file stream read only when actually present. Production cities remain in config.js; explicit manual import preserved. SVG icon linked explicitly; real favicon.ico at static root plus alternate icon link handles legacy browser probes. Cache tokens updated.
765 checks = all 727 retained + 38 new. Deterministic 512-scenario partition invariant included as one test. No browser console/live-site or real data run here; tests use static assets, real gzip streams, local-file API and browser API stubs.
For install: extract to a new folder; KEEP YOUR CURRENT config.js if you already filled real cities/dataBase. This release makes no config changes. Keep your existing data exports. Launch START_LOCAL.bat. Do not overwrite custom data/config with empty example defaults.

## Historical focused display fixes in 2.2.3
Footer reads immutable HBRelease.VERSION from release.js; no hardcoded footer version.
One global chain-status strip remains visible on all routes. Original source indexes and filtering unchanged. Total uses the original loaded chain array, including offline/outside-city chains (8 in the real dataset), or config before loading. Priced = fresh price for at least one original product in current basket among loaded cached records; verify = potential online chain requiring address/service confirmation; stale = missing/expired snapshot. In 2.2.3 groups overlapped; this is superseded by the exclusive 2.2.4 classification. No network call is added for counters; before loading, status is explicitly unknown rather than stale.
Search/cart coverage remains per-product relevant-chain count, labelled separately without a conflicting global denominator; manual selected count refers only to the common/promotions group.
Rank 2/3 descriptions say shipping/pickup estimate, not collected operational fees. No actual collection exists even when fees quotation is enabled.
Only rank 1 with FULL basket gets primary retailer CTA/style. Every partial card is secondary with a missing-products warning; if all partial, no primary retailer CTA. Sorting/calculations unchanged.
390px CSS constrains cards/pages, wraps controls/long labels, keeps 44px touch targets and shrinkable chart columns. Wide detailed tables remain scrollable INSIDE bounded regions; no page-level clipping used to conceal layout issues. Browser visual QA not performed here.
727 checks (680 retained + 47 new); prior expectations updated only for changed labels/counter/version.

## Fee quotations in 2.2.2
See FEES_README_HE.md (Hebrew). Production fees.enabled is false; all 596 previous regression cases are retained. 84 new cases cover exact decimal rounding, fixed/percent/mixed rules, independent limits and perChain source overrides, disabled behavior and integration.
computeFees(basketTotal, chainKey, config) accepts/returns SHEKELS. total = rounded product basket + customerFee only. Chain commission is never customer debt and never affects rank or public presentation. Percentage base excludes shipping and all fees; clamp then half-up to agora. Zero-value basket has no fees.
When enabled, customer fee has a separate summary/Top3 line, is included once in totals/ranking, and is kept consistent in savings. Unknown shipping/pickup remains unknown. No payment, server, checkout SDK or agreement implementation. Handoff explicitly says fees are a demonstration, not collected or sent to the chain.
Static config is publicly readable; do not store secrets or confidential agreements. No charge is made even when the quote flag is on.

## Savings audit in 2.2.1
All eight source indexes remain visible in a separate reference table even if offline, outside the city, unsupported for the selected mode, or outside Top 3. Availability is labelled; no extra checkout links are added. Only fresh full original-barcode baskets contribute to savings, arithmetic mean and CSS bars. Partial/zero/stale rows remain visible separately.
Uniform basis: if every full basket has a known service fee, compare totals; otherwise compare product subtotals for EVERY full reference row. Unknown fees/grand totals stay null. Per-row and mean/highest savings use the reference amount as the percentage denominator; cheaper references are labelled as added expense.
The selected chain defaults to full Top 3 winner; if unavailable, choose cheapest relevant full chain. No unavailable/offline reference becomes a purchase recommendation. The headline uses the cheapest relevant full chain and discloses unavailable reference prices. No promo deductions or automatic alternatives.
49 added savings checks plus all 547 prior checks pass. Tests are offline synthetic, not a browser or live-price verification.

## Top 3 in 2.2
Full baskets rank first. For pickup with any unknown fee, ALL relevant priced chains rank by product price; fees are separate. With all pickup fees known, use products + pickup fee. Delivery ranking remains based on known total.
Partial baskets rank below full, then by greater coverage and known total at equal coverage.
Unknown fees remain null, never zero. Pickup product-price ranking is explicitly before pickup fees.
Positive differences/savings only compare two full baskets on the same declared basis: products before pickup fees, or total with known fees. Places 2/3 show their delta from place 1.
Top 1 primary handoff button, others secondary. Remaining eligible chains collapsed.
Original product/common-group comparisons remain as separately labelled collapsed detail.
Top ranking covers all city/mode-relevant chains; manual selection still controls common group/promos.
No promotion deductions or guessed minimum-order completions.

## Retained 2.0 fixes
Unsupported delivery modes are absent from chain tables, selectors and handoff cards.
Rami unknown pickup is verified on the retailer site, not blocked by missing city lists.
Search invalidates immediately on input, displays loading, and only renders the last query.
Natural Hebrew counts, display-only name cleanup and direction-isolated clipboard text.
Tests use tests/fixtures/config.js, never empty-city assumptions about production config.
765 checks pass. The prior 2.0 nonempty production city isolation report is retained as historical evidence.
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

## Other 2.2 fixes
Zero-price chains have no order CTA; runtime handoff also refuses baskets without priced
originals/approved alternatives. Active baskets suppress pending saved-cart counts.
Visible chain lists and counts share city/mode eligibility; source indexes stay unchanged.
Central mode-specific availability labels, local SVG favicon, no hosted service-area JSON fetch.
Manual/local-file service-area import retained. 390px CSS/layout checks, not visual browser QA.
