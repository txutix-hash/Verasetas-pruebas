from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-22.js').read_text()
assert 'const samples=new Map()' in s
assert 'r.getBounds().getCenter()' in s
assert 'rects.length!==gridCells.length' not in s
p=(r/'src/qa/panel.js').read_text()
assert 'runFunctionalChecks' in p and 'Probar las 6 pestañas' in p
assert (r/'src/qa/functional.js').exists()
assert (r/'VERSION.txt').read_text().strip() == '4.0.0-beta.22'
print('OK: corrección de cuadrículas visibles y pruebas de navegación instaladas')
