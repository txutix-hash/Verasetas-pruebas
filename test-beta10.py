from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-02.js').read_text()
assert 'const results=gridCells.map(c=>evaluateExplore(c));' in s
assert 'const cellByPosition=new Map' in s
assert 'const cellIndex=new Map' in s
assert 'results[cellIndex.get(x)]?.pass' in s
assert 'neighbors.filter(x=>evaluateExplore(x)' not in s
assert 'gridCells.filter(x=>Math.abs(x.row-c.row)' not in s
assert "version:'4.0.0-beta.22'" in (r/'src/main.js').read_text()
assert 'v4.0 beta 22' in (r/'index.html').read_text()
assert json.loads((r/'architecture-audit.json').read_text())['count']==15
print('Beta 10: optimización Explora, versiones y auditoría coherentes')
