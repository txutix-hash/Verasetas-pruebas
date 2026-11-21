from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'src/qa/functional.js').read_text()
assert "tab==='catalog'" in s
assert "getElementById('catalogScreen')" in s
assert 'catalogVisible' in s
assert '4.0.0-beta.22' == (r/'VERSION.txt').read_text().strip()
print('Beta 22: catálogo comprobado en pantalla propia')
