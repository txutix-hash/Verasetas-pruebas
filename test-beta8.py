from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
climate=(root/'src/legacy/part-04.js').read_text()
draw=(root/'src/legacy/part-10.js').read_text()
base=(root/'src/legacy/part-02.js').read_text()
assert 'const climateOldMap=renderMap' not in climate
assert "gridDraw=function(){if(tab==='climate'){renderClimateGrid();return}previousDraw()}" in draw
assert 'renderMap=function(){oldRenderMap();' in base
assert 'function renderClimateGrid()' in climate
assert json.loads((root/'architecture-audit.json').read_text())['count']==15
assert 'v4.0 beta 22' in (root/'index.html').read_text()
print('Beta 8: ruta climática única y auditoría correctas')
