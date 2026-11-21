from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
assert html.index('src/map/visualGrid.js')<html.index('src/legacy/part-21.js')
code=(root/'src/map/visualGrid.js').read_text()
assert 'getBounds().pad(.15)' in code
assert 'gridScore(c)' in code
assert 'fetch(' not in code
assert 'intersects(bounds,visible)' in code
assert 'VeraSetasVisualGrid.draw' in (root/'src/legacy/part-21.js').read_text()
print('OK: módulo visual, vista y sin llamadas de red')
