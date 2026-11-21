from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
a=json.loads((r/'architecture-audit.json').read_text())
assert a['count']==15
assert (r/'VERSION.txt').read_text().strip()=='4.0.0-beta.22'
s=(r/'src/legacy/part-18.js').read_text()
assert 'Number.isInteger(level)' in s
print('Beta 13: inventory and catalog guards OK')
