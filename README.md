# HomeBasket 2.5
Presentation redesign of 2.4. Static, Hebrew RTL, mobile-first. No live-site deployment.
No changes to export schemas, chain order, ranking, fulfilment/minimum rules or cart matching.
Exact original 2.4 ZIP included in backups/. Original source hashes: BACKUP_v2.4_SHA256.txt.

## Run on your Windows computer
1. Extract the ZIP to a NEW folder and keep your 2.4 copy.
2. You may copy your filled config.js FROM 2.4 unchanged: no config field changed in 2.5.
   Keep the same real exports; none are bundled or modified. For versions older than 2.4,
   follow CONFIG_HE.md to retain cities and add the 2.4 fulfilment policies.
3. Close the previous START_LOCAL window (port 8787), double-click START_LOCAL.bat here.
   Python is needed for the static local launcher; no new installation for the app.
4. Load the existing export folder in הנתונים שלנו if needed. Enter city/delivery or pickup.
5. Scroll/click between 1 city, 2 build, 3 compare on the SAME workspace. Receipt, cart editing
   and data information remain available as auxiliary screens. No new receipt/cart logic.
6. Compare, then use the existing retailer handoff. Payments remain on retailer sites only.
Hebrew instructions: README_HE.html. Do not replace real data with schema examples.

## Presentation changes
Local variable Heebo font (WOFF, OFL included), turquoise primary + lime saving accent,
rounded cards, compact headers, visible three-stage navigation and progress. Explanations
behind native keyboard-accessible disclosures. Progress marks only genuinely completed
location/build steps; opening comparison with an empty cart does not mark building complete.

Product search, quantity +/−, inline add and optional lazy images retain their original
handlers. Letter placeholders remain. Persistent cart docks to bottom on mobile and left
side of RTL desktop at >=1100px. Editable list scrolls internally so compare CTA remains visible.
Primary full-basket winner spans both columns; runners-up use secondary cards. Amounts and
saving explanations are the existing computed values, not a new calculation. Unknown fees
and minimum restrictions keep the same warnings/qualification as 2.4.

Savings chart lists every original network, including partial/stale/offline reference rows.
Only complete qualified reference baskets get scaled price bars. Others have explicit text
and dashed placeholders, never an invented zero price. Reference availability remains visible.
The detailed price table and source/status reasons are collapsible. Full-basket savings,
shared/partial baskets, confirmed alternatives and unlinked promotions remain separate.

Automatic dark theme via prefers-color-scheme; no theme preference is stored. Focus rings,
44px+ controls, actual native file inputs reachable from keyboard, reduced-motion support,
correct Hebrew/shekel/Latin font glyphs. Receipt OCR retains its existing on-demand resources.

## Performance
No new JS or CSS framework, no extra price/promotion fetch, no full-page render on search.
Local font is 76,684 bytes. Startup assets estimated under Node gzip: 158,593 bytes vs
74,361 in 2.4; +84,232 bytes (mostly the self-hosted font). This is a packaging estimate,
not a measured network waterfall. Data exports and first-use OCR are excluded.
The same cached/lazy loading and bounded 40-promotion rendering remain unchanged.

## Tests
1,055 PASS = all 949 prior checks + 106 new design/accessibility/invariant checks.
Test-results.txt contains the full output. Run python run_tests.py with free Node.js.
New checks cover 360,390,768,1280 geometry/CSS contracts, light/dark contrast, variable WOFF
Hebrew/shekel glyphs, keyboard upload, focus/reduced motion, one-page workflow, winner/runner
hierarchy, all-network chart, no fake partial bars, startup transfer bound, unchanged files
and functions. See VALIDATION.txt and DESIGN_SIZE_REPORT.json.
No visual browser/mobile test or screenshots were run in this environment. CSS/math tests
do not guarantee an actual browser has no overflow; validate with your real data before launch.
