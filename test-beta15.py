from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-19.js').read_text()
assert 'let rankingCache=new WeakMap()' in s
assert 'if(rankingCache.has(c))return rankingCache.get(c)' in s
assert 'rankingCache.set(c,arr)' in s
assert "gridDraw=function(){rankingCache=new WeakMap();" in s
assert "map.on('zoomend moveend',()=>{rankingCache=new WeakMap();redrawLabels()})" in s
assert (r/'VERSION.txt').read_text().strip()=='4.0.0-beta.22'
print('Beta 15: cache de rankings e invalidación')
