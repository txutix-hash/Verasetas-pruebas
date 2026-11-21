from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
def test_all_local_scripts_exist():
    scripts=re.findall(r'<script[^>]+src=["\'](\./src/[^"\']+)',HTML)
    assert len(scripts)>=25
    assert all((ROOT/s[2:]).is_file() for s in scripts)
def test_six_sections():
    text=(ROOT/'src/legacy/part-02.js').read_text()
    assert all("tab==='"+t+"'" in text for t in ('pred','explore','spots','climate','flora'))
    assert "catalog" in text
    assert (ROOT/'src/qa/functional.js').is_file()
def test_no_invalid_cell_confidence():
    assert 'if(!c||!c.t)' in (ROOT/'src/legacy/part-20.js').read_text()
def test_visual_grid_data_guard():
    text=(ROOT/'src/map/visualGrid.js').read_text()
    assert 'Number.isFinite(raw)' in text
