from pathlib import Path
s=Path(__file__).resolve().parents[1].joinpath('src/legacy/part-14.js').read_text()
def test_no_score_for_missing_cell():
    assert 'const n=c?gridScore(c):null;' in s
def test_no_route_for_missing_cell():
    assert 'if(c&&Number.isFinite(n))' in s
