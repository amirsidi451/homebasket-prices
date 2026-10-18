# HomeBasket 2.5.6
Built from the supplied upload_v255_base.zip (2.5.5), not from an older template.
Keep the included config.js: it is byte-identical to your uploaded full production config.
Four shown chains and all service lists are preserved. Pricing/data formats unchanged.
Supplied legal.html and email placeholder preserved, linked from footer and order warning.
Autocomplete uses a bundled government locality snapshot, independent of retailer coverage.
Order modal hides the basket dock and scrolls all content/actions with safe-area padding.

Windows: extract to a new folder, keep your existing data/dataBase, run START_LOCAL.bat.
No real price data is bundled. No live-site changes.
1352 automated checks passed; see test-results.txt and VALIDATION.txt for QA limits.
Run tests with Python and Node: python run_tests.py. Scenarios use tests/fixtures.
Start with START_HERE_v2.5.6_HE.txt. Original archive in backups/upload_v255_base.zip.
