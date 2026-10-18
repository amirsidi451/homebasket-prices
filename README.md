# HomeBasket 2.5.1 — order-flow fixes
Static Hebrew RTL app, no live-site edits or deployment. Original 2.5 ZIP is in backups/;
BACKUP_v2.5_SHA256.txt verifies the unchanged original source. This ZIP is named with _flow
to distinguish this order-flow build from other same-version design-only packages.

## Windows: three steps
1. Extract to a NEW folder. Copy your filled config.js from 2.5 (or 2.4) unchanged.
2. Close the previous launcher window; double-click START_LOCAL.bat here (same Python).
3. Use the same real exports, choose/confirm city and mode, add products and compare.
No data exports are bundled, altered or converted. See README_HE.html.

## Confirmation and navigation
City/address is a draft until selecting an autocomplete option or clicking confirmation.
Typing again revokes the old approval immediately and removes old success/results/order context.
Changing fulfilment mode immediately updates an already confirmed city; it never confirms a
new city draft. Free text/addresses are accepted with explicit confirmation. Suggestions are
local configured city names plus a small common-city display list; NOT service coverage.
No geocoder, GPS, location storage or location network request was added.

All compare links, including the always-active cart button, guide a missing-city user to the
city field with an embedded alert, highlighted input/confirm and keyboard focus. Empty submit
uses inline validation (novalidate prevents native validation swallowing submit). Combobox
supports partial names, punctuation-insensitive matching, ArrowUp/Down, Enter, Escape, Tab and
pointer selection; closes outside. Before approval product cards say price follows city choice.
Repeated compare on the current comparison route scrolls up and actually recomputes, marking
מעודכן only after a successful current result. Failure, edit and late stale response cannot
leave a false updated label.

## Consistent savings without changing product-price arithmetic
Ranking/fees/minimum/threshold functions, source indexes and compact schemas are unchanged.
Savings REFERENCE COHORT is intentionally corrected: only eligible full baskets in the same
price basis as Top3 enter the maximum/mean. Unavailable networks remain visibly separate as
unavailable placeholders/information, never cheaper comparison bars. Unknown fulfilment fees
are not zero. Ties show equality instead of save-up-to-0.00. This changes comparison membership,
not product prices, fulfilment amounts or the pure saving/rounding formulas.
All currency labels use ₪. Copied product lists are plain logical text with no hidden BiDi
controls, preserving quantities/weighted units. Readability in external messaging apps should
still be checked manually; no WhatsApp/browser test was performed here.

## Layout
Centered 1200px shell; adjacent 288px RTL sidebar, 24px gap at wide widths. Single or two-chain
results occupy the row. Compact nonsticky mobile steps hide on downward scrolling and return
on upward scrolling; focused navigation is kept visible. Dock uses visual viewport height,
including zoom, with an approximately 25% height cap and a minimum 82px to retain touch access
on exceptionally short viewports. Compare target remains at least 44px. Dock contents scroll
internally; safe-area insets may affect physical measurements.

## Tests
1,126 PASS = 1,055 prior checks + 71 new cases for all requested sections.
No tests deleted. Old expectations updated for explicit confirmation instead of debounce
approval, plain instead of isolated copy, eligible instead of offline reference rows, currency,
version, centered geometry and explicitly authorized flow/UI changes. Price/service hash
contracts use ORIGINAL 2.5 functions and unchanged modules; no new price engine.
Run python run_tests.py (free Node.js for tests only). Complete output in test-results.txt.
CSS/math/DOM API stubs do not measure real browser overflow/zoom or mobile screenshots.
Manual real-data browser checklist is in README_HE.html; see VALIDATION.txt for limits.
