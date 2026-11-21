from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-21.js').read_text()
assert 'function scheduleGridDraw()' in s
assert 'pendingFrame=requestAnimationFrame' in s
assert 'scheduleGridDraw()' in s
assert "!legend.textContent.includes('Casillas visuales ~')" in s
assert (r/'VERSION.txt').read_text().strip() == '4.0.0-beta.22'
print('OK: coalescencia de eventos y leyenda sin duplicados')
