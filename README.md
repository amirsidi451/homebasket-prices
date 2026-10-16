# HomeBasket Static 1.2

Open README_HE.html for Hebrew instructions. v1.1 retained separately; no live site modified.

Changed: data fetch cache=reload plus meta.generated_at query version; explicit missing chain source error; collapsed separate promotion search; distinct missing vs stale messages; standard commas; similar same-unit +/-25% package suggestions with explicit target-chain approval; separate approved-substitution subtotal; fair common-product column and highlighted cheapest comparable total.

Core comparison remains exact-barcode only. Approved alternatives never silently alter the fair comparison group. Cart storage key remains unchanged. Approval storage includes source ordering. Quantity changes invalidate approvals.

Tests:
node tests/core.test.cjs
node tests/compact.test.cjs
node tests/interface.test.cjs
node tests/large-catalog.test.cjs
node tests/v12.test.cjs

No external libraries/build/server required. Real user data and actual server-cache/mobile visual checks not run here.
