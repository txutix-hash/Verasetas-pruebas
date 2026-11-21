from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
s=(r/'src/legacy/part-07.js').read_text()
assert 'const verifiedOldPanel=renderPanel' not in s
assert 'renderPanel=function()' not in s
s=(r/'src/legacy/part-06.js').read_text()
assert s.index("$('panelBody').prepend(block)") < s.index("info.id='officialDiagnostics'") < s.index("document.getElementById('verifyOfficialBtn').onclick=verifyOfficialSources")
assert "if(tab==='flora')" in s
assert 'verifyWms(mfeCapabilities' in (r/'src/legacy/part-07.js').read_text() and 'verifyWms(soilCapabilities' in (r/'src/legacy/part-07.js').read_text()
j=json.loads((r/'architecture-audit.json').read_text())
assert j['count']<=18 and len(j['legacy_overrides'])==j['count']
assert (r/'VERSION.txt').read_text().strip() == '4.0.0-beta.22'
print('OK: verificación WMS en orden y wrapper retirado')
