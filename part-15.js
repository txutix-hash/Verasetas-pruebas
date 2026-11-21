
/* v3.1: consulta voluntaria de OSM y transparencia de lluvia + evidencia por celda. */
(function(){
 if(typeof gridScore!=='function'||typeof map==='undefined')return;
 document.addEventListener('click',async e=>{
  if(e.target?.id!=='vsForestPred')return;
  const btn=e.target;btn.disabled=true;btn.textContent='🌳 Consultando bosques…';
  try{if(typeof window.vsLoadForests!=='function')throw Error('El cargador de bosques no está disponible. Recarga la página.');const loaded=await window.vsLoadForests();if(loaded&&typeof gridDraw==='function')gridDraw()}catch(err){console.error('Bosques OSM',err);const status=document.getElementById('vsForestPredStatus');if(status)status.textContent='❌ Error al procesar bosques: '+String(err.message||err)}
  finally{btn.disabled=false;btn.textContent='🌳 Cruzar con bosques OSM visibles'}
 });
 const oldShow=showGridDetail;
 showGridDetail=function(lat,lon){oldShow(lat,lon);if(tab!=='pred')return;
  const c=cellFor(lat,lon),box=document.getElementById('detail');if(!box)return;
  const rain=rainBefore(c.t),ev=forestEvidence(c),el=document.createElement('div');el.className='vs-evidence';
  el.textContent='🌧️ Lluvia acumulada ('+rainWindow+' días): '+(rain===null?'sin datos completos':rain.toFixed(1)+' mm')+' · Open-Meteo, datos modelizados. 🌳 Hábitat: '+ev.reason+' · OpenStreetMap, cobertura parcial. Índice orientativo; no señala setales ni garantiza accesos.';
  box.appendChild(el);
 };
})();
