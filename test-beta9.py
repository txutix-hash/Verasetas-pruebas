from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-19.js').read_text()
assert 'const visible=map.getBounds().pad(.10)' in s
assert 'if(b[0][0]>visible.getNorth()' in s
assert "map.on('zoomend moveend',()=>{rankingCache=new WeakMap();redrawLabels()})" in s
assert s.index('if(b[0][0]>visible.getNorth()') < s.index("const rank=(viewMode==='all'||zoom>=12)?rankings(c):[];")
assert 'v4.0 beta 22' in (r/'index.html').read_text()
assert json.loads((r/'architecture-audit.json').read_text())['count']==15
print('Beta 9: etiquetas limitadas a celdas visibles')
