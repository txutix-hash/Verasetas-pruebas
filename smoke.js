/** VeraSetas 4.0 beta 1 — pruebas no destructivas; no envían solicitudes. */
export function runSmokeChecks(){
 const checks=[];
 const add=(name,ok,detail='')=>checks.push({name,ok:!!ok,detail});
 const map=window.vsLeafletMap;
 add('Mapa Leaflet',!!map&&typeof map.getBounds==='function');
 add('Seis pestañas', ['pred','explore','spots','climate','flora','catalog'].every(t=>!!document.querySelector(`[data-tab="${t}"]`)));
 add('Panel de controles',!!document.getElementById('panelBody'));
 add('Leyenda de predicción',!!document.getElementById('legend'));
 add('Selector de zona',!!document.getElementById('areaSelect'));
 add('Cuadrícula visual',typeof window.VeraSetasVisualGrid?.draw==='function');
 add('Almacén meteorológico',typeof window.VeraSetasWeatherStore?.read==='function'&&typeof window.VeraSetasWeatherStore?.cooldownUntil==='function');
 add('Estado y eventos',!!window.VeraSetas4?.events&&typeof window.VeraSetas4?.getState==='function');
 add('Datos de flora',!!document.querySelector('[data-tab="flora"]'));
 add('Catálogo',!!document.querySelector('[data-tab="catalog"]'));
 const pending=window.VeraSetasWeatherStore?.cooldownUntil?.()||0;
 const cached=window.VeraSetasWeatherStore?.read?.(16);
 return {at:new Date().toISOString(),checks,passed:checks.filter(x=>x.ok).length,total:checks.length,
  weather:{cachedAt:cached?.savedAt||null,cooldownUntil:pending||null,online:navigator.onLine},
  note:'Pruebas de presencia e integración básica; no comprueban predicción real ni conexión con Open-Meteo.'};
}
