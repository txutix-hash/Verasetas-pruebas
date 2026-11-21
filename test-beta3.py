from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
a=json.loads((r/'architecture-audit.json').read_text())
assert a['count']==len(a['legacy_overrides'])<=18
assert 'installRuntimeMonitor' in (r/'src/main.js').read_text()
assert 'unhandledrejection' in (r/'src/qa/runtime.js').read_text()
assert 'runtimeErrors' in (r/'src/qa/panel.js').read_text()
assert 'unhandledrejection' in (r/'src/qa/functional.js').read_text()
print('OK: monitor de errores, promesas y auditoría')
