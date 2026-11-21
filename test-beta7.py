from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
a=(root/'src/legacy/part-06.js').read_text()
b=(root/'src/legacy/part-08.js').read_text()
assert 'const officialOldMap=renderMap' not in a
assert 'renderMap=function(){importedOldMap();' in b and 'syncOfficialLayers();redrawVerifiedForest();drawVerifiedPh()' in b
assert json.loads((root/'architecture-audit.json').read_text())['count']<=18
print('Beta 7: sincronización WMS y auditoría correctas')
