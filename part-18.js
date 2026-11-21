
/* v3.5: estacionalidad aplicada a todas las puntuaciones, también a rankings. */
(function(){
 if(typeof gridScore!=='function'||typeof CAT_SPECIES==='undefined')return;
 const beforeSeason=gridScore;
 const caps=[20,45,75,100];
 function predictionMonth(){const d=new Date();d.setDate(d.getDate()+dateOffset);return d.getMonth()}
 function seasonInfo(i){const m=predictionMonth(),name=species[i]?.name;
  const cat=CAT_SPECIES.find(x=>x.scientific===name);
  if(!cat||!Array.isArray(cat.levels)||cat.levels.length!==12)return null;
  const level=cat.levels[m];if(!Number.isInteger(level)||level<0||level>=caps.length)return null;return {month:m,level,cap:caps[level],name:['fuera de temporada habitual','aparición ocasional','temporada secundaria','temporada principal'][level]};
 }
 gridScore=function(c){const raw=beforeSeason(c);if(!Number.isFinite(raw))return null;
  const season=seasonInfo(selected);return season?Math.min(raw,season.cap):raw;
 };
 const oldDetail=showGridDetail;
 showGridDetail=function(lat,lon){oldDetail(lat,lon);if(tab!=='pred')return;
  const el=document.getElementById('detail'),info=seasonInfo(selected);if(!el||!info)return;
  const p=document.createElement('p');p.className='vs-season-note';
  p.textContent='📅 Estacionalidad de '+species[selected].short+': '+info.name+'. Tope estacional del índice: '+info.cap+'/100. Se aplica a la fecha elegida y a la comparación de todas las especies. Calendario orientativo para la zona; puede variar según el año, la altitud y las lluvias.';
  el.appendChild(p);
 };
 window.veraSeasonForTest=undefined;
})();
