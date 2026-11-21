from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-05.js').read_text()
assert 'const oldFloraLoad=loadForests' not in s
assert 'loadForests=async function()' not in s
base=(r/'src/legacy/part-02.js').read_text()
assert 'async function loadForests()' in base
assert 'renderForests();renderMap();' in base
assert 'return true;' in base
assert (r/'VERSION.txt').read_text().strip() == '4.0.0-beta.22'
print('OK: carga forestal sin wrapper redundante; resultado preservado')
