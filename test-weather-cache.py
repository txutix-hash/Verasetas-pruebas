from pathlib import Path
p=Path(__file__).resolve().parents[1]
s=(p/'src/legacy/part-02.js').read_text()
cache=(p/'src/weather/cache.js').read_text()
h=(p/'index.html').read_text()
assert 'VeraSetasWeatherStore.read(16)' in s
assert 'setInterval(vsRefreshIfDue,60*60*1000)' in s
assert 'vsCacheRead(),fresh=' in s
assert 'cached.day===dateKey()' in s
assert 'limitForHours(6)' in s
assert h.index('src/weather/cache.js')<h.index('src/weather/forecast.js')<h.index('src/legacy/part-02.js')
assert 'verasetas_weather_v399_region_16' in cache
print('weather cache checks OK')
