from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
a=json.loads((r/'architecture-audit.json').read_text())
assert a['count']==15
assert not any(x['file']=='src/legacy/part-18.js' and x['function']=='gridDraw' for x in a['legacy_overrides'])
s18=(r/'src/legacy/part-18.js').read_text()
s19=(r/'src/legacy/part-19.js').read_text()
assert 'gridDraw=function' not in s18
assert 'gridScore=function(c)' in s18
assert 'Índice limitado por temporada de cada especie' in s19
assert 'if(!c)return []' in s19
assert '4.0.0-beta.22' == (r/'VERSION.txt').read_text().strip()
print('Beta 13: aviso estacional conservado, wrapper eliminado y detalle protegido')
