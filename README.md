# HomeBasket Static v2.7.1

אתר סטטי בעברית: עיר ואופן קבלה → בניית סל → השוואה → מעבר לאתר הרשת.

## התחלה
1. חלצו את כל החבילה לתיקייה רגילה.
2. השאירו/העתיקו אליה את תיקיית `data/` האמיתית הקיימת. היא לא נכללה במקור ולכן אינה ב־ZIP זה. אין להשתמש ב־fixtures כמחירי אמת.
3. במחשב Windows לחצו פעמיים על `START_LOCAL.bat`, או הריצו `python launch_local.py`.
4. לפרסום, העלו את קובצי האתר והנכסים לצד `data/` הקיימת. אין צורך בשרת יישום או ב־ChatGPT. חבילה זו לא פורסמה אוטומטית.

`config.js` הוא הקובץ שסופק, ללא שינוי בתים:
`187b03ab8286544f999e3e3ade6be73d50fae88707b353e9a7084a278cdfdb0b`

## בדיקות
Python 3 ו־Node.js נדרשים לבדיקות אופליין:
```bash
python run_tests.py
```

סיור Playwright עצמאי (דורש התקנת Playwright ו־Chromium ממקורם הרשמי):
```bash
npm install --no-save playwright
npx playwright install chromium
python -m http.server 8080 --bind 127.0.0.1
```
במסוף שני, באותה תיקייה:
```bash
node tests/v271.playwright.cjs
```
ברירת המחדל היא `http://127.0.0.1:8080/`. אפשר להגדיר `HB_TEST_URL` לשרת בדיקות מקומי אחר.
הסיור משתמש בנתוני בדיקה סינתטיים, חוסם בקשות מחוץ למקור המקומי, ובודק קובץ מקבילים תקין/חסר/פגום ברוחבים 1280, 390, 640@2x ו־320. הוא אינו פונה לאתרי הרשתות.

חלופה לבדיקת פריסה בדפדפן מותקן, ללא Playwright:
```bash
node tests/prepare-v271-browser.cjs
python -m http.server 8081 --bind 127.0.0.1 --directory .qa-v271
```
פתחו `http://127.0.0.1:8081/tests/v271.browser.html` ולחצו על כפתור הבדיקה. זוהי בדיקת רוחבי iframe בדפדפן אמיתי, לא אמולציית טלפון או בדיקת DPR2.

ראו `VALIDATION.txt` לתוצאות שנמדדו בפועל, `HANDOFF.md` למבנה הקוד ולמגבלות, ו־`EQUIVALENTS_HE.md` לתיעוד הקובץ האופציונלי החדש.
