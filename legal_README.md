# legal.html — Hebrew legal / privacy page (DRAFT)

**Draft — must be reviewed by a lawyer before publishing.**

Standalone file (RTL, inline CSS, no external resources). Sections have anchors:
`#terms` (תנאי שימוש), `#privacy` (הצהרת פרטיות), `#prices` (הבהרת מחירים), `#contact` (יצירת קשר).

## Deploy
1. Copy `legal.html` next to `index.html` in the site root (e.g. `HomeBasket_Static_v2_5/`).
2. Replace the placeholder `[אימייל ליצירת קשר]` with the real contact address.
3. Update the date (`18.10.2026`, appears twice) whenever the text changes.

## Link from index.html footer
In `index.html`, inside the existing `<footer>…</footer>` (after the `<small>גרסה …</small>` element), add:

```html
<nav class="footer-legal"><a href="legal.html">תנאי שימוש ופרטיות</a> · <a href="legal.html#prices">הבהרת מחירים</a></nav>
```

Optionally also link `legal.html#prices` from the order dialog (`#order-dialog`) warning text.
The page links back to `index.html` (header brand and footer).
