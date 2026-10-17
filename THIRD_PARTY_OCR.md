# OCR dependency and privacy
Tesseract.js 6.0.1, Apache-2.0:
https://github.com/naptha/tesseract.js/releases/tag/v6.0.1
API reference: https://github.com/naptha/tesseract.js/blob/master/docs/api.md
Bundled script: vendor/tesseract.min.js
License: vendor/TESSERACT_LICENSE.md and vendor/tesseract.min.js.LICENSE.txt
Lazy worker: https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js
Core directory: https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0
Languages: https://tessdata.projectnaptha.com/4.0.0/{heb,eng}.traineddata.gz
The app passes a locally decoded/downscaled canvas to the browser worker.
No application receipt upload endpoint, analytics, AI API or paid OCR service.
Asset hosts receive ordinary GET requests, including network information;
they do not receive the receipt image or receipt text from application code.
Local static server supports static GET/HEAD; receipt analysis runs in browser.
No offline-first promise: asset downloads may fail, especially on restrictive networks.
Use plaintext review if the worker fails, or reshoot a sharper/shorter receipt.
Actual photograph recognition accuracy has not been measured in this environment.

Version 1.7 adds local adaptive threshold/contrast, grayscale, bounded small-image upscaling, 3MP/3000px cap and an enhancement opt-out. Timing display is approximate, not a recognition SLA.
