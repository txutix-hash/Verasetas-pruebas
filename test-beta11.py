from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
flora=(r/'src/legacy/part-05.js').read_text()
official=(r/'src/legacy/part-08.js').read_text()
assert 'renderMap=function()' not in flora
assert "if(tab==='flora')drawFlora();syncOfficialLayers();redrawVerifiedForest();drawVerifiedPh()" in official
assert "if(floraPhCard)floraPhCard.classList.toggle" in official
a=json.loads((r/'architecture-audit.json').read_text())
assert a['count']==15
assert not any(x['file']=='src/legacy/part-05.js' and x['function']=='renderMap' for x in a['legacy_overrides'])
print('Beta 11: coordinación Flora + capas oficiales verificada')
