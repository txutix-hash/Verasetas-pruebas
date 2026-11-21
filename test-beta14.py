from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-19.js').read_text()
assert "const name=viewMode==='all'?(best?species[best.i].short:'Sin datos'):species[selected].short;" in s
assert "const score=viewMode==='all'?(best?.n??null):current;" in s
assert "(viewMode==='all'||zoom>=12)?rankings(c):[]" in s
assert "Number.isFinite(score)?" in s
assert (r/'VERSION.txt').read_text().strip()=='4.0.0-beta.22'
print('Beta 14: etiquetas y puntuaciones alineadas por modo')
