/* VeraSetas 4.0 alpha.6: almacén meteorológico único, API compatible con Safari. */
(function(){
 'use strict';
 const KEY='verasetas:v4:weather:region16',OLD='verasetas_weather_v399_region_16',COOLDOWN='verasetas_weather_429_until';
 const storage=()=>{try{return window.localStorage}catch{return null}};
 function today(){const d=new Date();d.setHours(12,0,0,0);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
 function valid(v,count){return v&&Number.isFinite(v.savedAt)&&v.savedAt>0&&v.savedAt<=Date.now()+60000&&Array.isArray(v.results)&&v.results.length===count&&v.results.every(r=>Array.isArray(r?.daily?.time))}
 function read(count){
  const st=storage();if(!st)return null;
  try{
   let v=JSON.parse(st.getItem(KEY)||'null');
   if(!valid(v,count)){
    const old=JSON.parse(st.getItem(OLD)||'null');
    if(!valid(old,count))return null;
    v={savedAt:old.savedAt,day:new Date(old.savedAt).toLocaleDateString('en-CA',{timeZone:'Europe/Madrid'}),results:old.results};
    try{st.setItem(KEY,JSON.stringify(v))}catch{}
   }
   return v;
  }catch{return null}
 }
 function write(results){const st=storage();if(!st||!valid({savedAt:Date.now(),results},16))return false;try{st.setItem(KEY,JSON.stringify({savedAt:Date.now(),day:today(),results}));return true}catch{return false}}
 function cooldownUntil(){try{return Number(storage()?.getItem(COOLDOWN)||0)||0}catch{return 0}}
 function limitForHours(hours){try{storage()?.setItem(COOLDOWN,String(Date.now()+hours*3600000))}catch{}}
 function clearCooldown(){try{storage()?.removeItem(COOLDOWN)}catch{}}
 window.VeraSetasWeatherStore=Object.freeze({read,write,cooldownUntil,limitForHours,clearCooldown});
})();
