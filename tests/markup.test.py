from pathlib import Path
from html.parser import HTMLParser
import re
root=Path(__file__).resolve().parents[1]
class Audit(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=[];self.stack=[];self.parents={};self.scripts=[];self.text=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id']);self.parents[a['id']]=self.stack[:]
  if tag=='script':self.scripts.append(a.get('src',''))
  if tag not in ['input','meta','link','br','hr','img','source','area','wbr']:self.stack.append(a.get('id',tag))
 def handle_endtag(self,tag):
  if self.stack:self.stack.pop()
 def handle_data(self,text):self.text.append(text)
a=Audit();html=(root/'index.html').read_text();a.feed(html)
assert len(a.ids)==len(set(a.ids));print('PASS markup has no duplicate IDs')
for id in ['home','receipt','networks','basket-drawer','basket-lines','result-summary','step-build','step-networks','step-compare']:assert id in a.ids
print('PASS all entry, step and persistent-basket controls exist')
assert 'compare' in a.parents['chain-select'];print('PASS chain selection tucked into comparison options')
assert 'dir="rtl"' in html;print('PASS RTL document preserved')
assert all((root/src.split('?')[0]).is_file() for src in a.scripts if src);print('PASS every startup script exists locally')
assert 'tesseract' not in ' '.join(a.scripts);print('PASS OCR dependency not loaded at startup')
assert not re.search(r'עזרה מ.?AI|בני הבית|אלרגיות|בעלי חיים',' '.join(a.text));print('PASS no household or AI cart-builder flow in UI')
css=(root/'styles.css').read_text()
assert '@media(max-width:600px)' in css and '.basket-dock{position:fixed' in css and '.receipt-row{display:block' in css
print('PASS mobile 390px applicable layout rules present (static audit only)')

assert '.receipt-row input:not([type=checkbox]),.receipt-row select,#receipt-text,.mini-row input,.cart-row input{font-size:16px}' in css
print('PASS mobile text-entry fields use 16px to avoid iOS focus zoom')
