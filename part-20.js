
/* v3.6: confidence in input coverage, NOT probability or accuracy of the mushroom model. */
(function(){
 if(typeof gridDraw!=='function'||typeof showGridDetail!=='function'||typeof gridCells==='undefined')return;
 const layer=L.layerGroup().addTo(map);
 function confidence(c){
  if(!c||!c.t)return {level:'Baja',weatherOK:false,altitudeOK:false,forestOK:false,source:'Sin celda regional',issues:['No hay una cuadrícula regional válida para esta ubicación.']};
  const d=daily(c.t),rain=rainBefore(c.t),alt=c.t[3];
  const weatherOK=!!d&&Number.isFinite(d.max)&&Number.isFinite(d.min)&&Number.isFinite(rain);
  const altitudeOK=Number.isFinite(alt);
  // The underlying grid is regional and unvalidated, so do not present 'high confidence'.
  let source='Sin vegetación identificada',forestOK=false,official=false;
  if(typeof mfeFeatures!=='undefined'&&mfeFeatures.length){
   const ev=forestEvidence(c);
   if(ev.source==='MFE25'&&['match','different'].includes(ev.state)){
    official=true;forestOK=true;source='MFE25 vectorial importado';
   }
  }
  if(!forestOK&&typeof forestData!=='undefined'&&forestData){
   const ev=forestEvidence(c);
   if(['match','different'].includes(ev.state)){forestOK=true;source='OpenStreetMap (cobertura parcial)'}
  }
  const issues=[];
  if(!weatherOK)issues.push('Faltan temperatura o lluvia acumulada completas para la fecha seleccionada.');
  if(!altitudeOK)issues.push('No hay altitud válida para la celda.');
  if(!forestOK)issues.push('No se ha identificado vegetación arbórea para esta celda.');
  else if(!official)issues.push('La identificación forestal procede de OSM, con cobertura incompleta.');
  if(weatherOK&&altitudeOK)issues.push('Meteorología modelizada y resolución regional (~8–12 km), no mediciones en el setal.');
  const level=(!weatherOK||!altitudeOK)?'Baja':official?'Media':'Baja';
  return {level,weatherOK,altitudeOK,forestOK,source,issues};
 }
 function redraw(){
  layer.clearLayers();if(tab!=='pred'||map.getZoom()<11)return;
  for(const c of gridCells){
   if(!c?.bounds||!map.getBounds().intersects(L.latLngBounds(c.bounds)))continue;
   const q=confidence(c),b=c.bounds;
   const lat=b[1][0]-(b[1][0]-b[0][0])*.12,lon=b[0][1]+(b[1][1]-b[0][1])*.14;
   const html='<div class="vs-confidence">Datos: '+q.level+'</div>';
   L.marker([lat,lon],{icon:L.divIcon({className:'vs-confidence-icon',html,iconSize:[94,22],iconAnchor:[0,0]}),interactive:false,keyboard:false}).addTo(layer);
  }
 }
 const oldDraw=gridDraw;
 gridDraw=function(){oldDraw();redraw();if(tab==='pred'){
  const el=document.getElementById('legend');if(el)el.innerHTML+=' · Datos: baja/media = cobertura de fuentes, no certeza de hallar setas';
 }};
 const oldDetail=showGridDetail;
 showGridDetail=function(lat,lon){oldDetail(lat,lon);if(tab!=='pred')return;
  const c=cellFor(lat,lon),q=confidence(c),el=document.getElementById('detail');if(!el)return;
  const section=document.createElement('section');section.className='vs-confidence-detail';
  const h=document.createElement('strong');h.textContent='🛡️ Confianza en los datos: '+q.level;section.appendChild(h);
  const p=document.createElement('p');p.textContent='Meteorología: '+(q.weatherOK?'completa':'incompleta')+' · Altitud: '+(q.altitudeOK?'disponible':'no disponible')+' · Bosque: '+q.source+'.';section.appendChild(p);
  const ul=document.createElement('ul');for(const reason of q.issues){const li=document.createElement('li');li.textContent=reason;ul.appendChild(li)}section.appendChild(ul);
  const note=document.createElement('p');note.textContent='Esta etiqueta evalúa la cobertura de los datos de entrada, NO la exactitud del índice ni la probabilidad de encontrar setas. El modelo no está calibrado con hallazgos reales.';section.appendChild(note);
  el.appendChild(section);
 };
 map.on('zoomend',redraw);
 window.veraConfidenceForTest=confidence;
 redraw();
})();
