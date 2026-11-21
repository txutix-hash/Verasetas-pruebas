from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
paths=re.findall(r'<script[^>]+src="(\./src/[^"]+)"',html)
assert paths, 'No se encontraron scripts locales'
assert all((root/path.removeprefix('./')).exists() for path in paths), 'Script inexistente'
assert paths[-1]=='./src/main.js', 'El módulo principal debe cargar al final'
report=json.loads((root/'architecture-audit.json').read_text())
assert report['count']==len(report['legacy_overrides'])
assert (root/'src/core/diagnostics.js').exists()
print('OK: rutas, orden de carga, auditoría y diagnósticos')
print('Sobrescrituras legadas pendientes:',report['count'])

assert "renderPanel=function" not in (root/"src/legacy/part-23.js").read_text()
assert "renderMap=function" not in (root/"src/legacy/part-23.js").read_text()
assert "renderMap=function" not in (root/"src/legacy/part-14.js").read_text()
print("OK: tres sobrescrituras eliminadas")
