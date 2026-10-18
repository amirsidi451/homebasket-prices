"""Run offline Node regression suites + Python markup audit (no third-party packages)."""
from pathlib import Path
import shutil
import subprocess
import sys
root=Path(__file__).resolve().parent
node=shutil.which('node')
if not node:
 print('Tests require Node.js (free). The app itself does not require Node.js.')
 sys.exit(2)
logs=[]
failed=[]
for test in sorted((root/'tests').glob('*.test.cjs')):
 result=subprocess.run([node,str(test)],cwd=root,text=True,capture_output=True,encoding='utf-8')
 log=test.name+'\n'+result.stdout+result.stderr
 logs.append(log)
 print(test.name+': '+str(sum(line.startswith('PASS ') for line in result.stdout.splitlines()))+' checks; '+('OK' if result.returncode==0 else 'FAILED'))
 if result.returncode:failed.append(test.name)
result=subprocess.run([sys.executable,str(root/'tests/markup.test.py')],cwd=root,text=True,capture_output=True,encoding='utf-8')
logs.append('markup.test.py\n'+result.stdout+result.stderr)
if result.returncode:failed.append('markup.test.py')
text='\n'.join(logs)
count=sum(line.startswith('PASS ') for line in text.splitlines())
(root/'test-results.txt').write_text(text,encoding='utf-8')
print('TOTAL: '+str(count)+' PASS; failures: '+str(len(failed)))
if failed:print('\n'.join(failed))
sys.exit(bool(failed))
