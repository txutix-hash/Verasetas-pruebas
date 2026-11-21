/* VeraSetas 4.0 alpha.2: componente meteorológico aislado, sin estado de mapa ni UI. */
(function(){
 'use strict';
 const ENDPOINT='https://api.open-meteo.com/v1/forecast';
 async function fetchRegion(points,today){
  if(!Array.isArray(points)||points.length<1||points.length>16)throw Error('Número de zonas no permitido');
  const u=new URL(ENDPOINT);
  Object.entries({latitude:points.map(p=>p.latitude).join(','),longitude:points.map(p=>p.longitude).join(','),daily:'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_mean,wind_speed_10m_max',hourly:'relative_humidity_2m',timezone:'Europe/Madrid',past_days:61,forecast_days:15}).forEach(([k,v])=>u.searchParams.set(k,v));
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(u,{signal:controller.signal});
   if(!response.ok){let reason='';try{reason=(await response.json()).reason||''}catch{}const err=Error('Open-Meteo HTTP '+response.status+(reason?': '+reason:''));err.status=response.status;throw err}
   const json=await response.json(),results=Array.isArray(json)?json:[json];
   if(results.length!==points.length)throw Error('Número de zonas inesperado');
   for(const raw of results){if(!Array.isArray(raw?.daily?.time)||!raw.daily.time.includes(today))throw Error('Serie meteorológica incompleta')}
   return results;
  }finally{clearTimeout(timer)}
 }
 window.VeraSetasWeather=Object.freeze({fetchRegion});
})();
