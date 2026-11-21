
/* Detalle cartográfico bajo demanda: los caminos proceden de OSM y NO se infieren de la malla climática. */
(function(){
 const toggle=document.getElementById('trailsToggle'),refresh=document.getElementById('detailRefresh'),note=document.getElementById('detailStatus');
 if(!toggle||typeof window.L==='undefined'||typeof map==='undefined')return;
 const routes=L.layerGroup();let busy=false,loadedKey='',lastFeatures=0;
 const escTrail=t=>String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function info(t){note.textContent=t}
 async function loadTrails(force=false){
   if(!toggle.checked){map.removeLayer(routes);return}
   if(map.getZoom()<12){info('Acerca el mapa al nivel 12 o superior para ver caminos detallados.');return}
   const b=map.getBounds();
   if((b.getNorth()-b.getSouth())>.20||(b.getEast()-b.getWest())>.30){info('La vista es demasiado amplia: acerca un poco más el mapa.');return}
   const bbox=[b.getSouth(),b.getWest(),b.getNorth(),b.getEast()].map(x=>x.toFixed(5)).join(',');
   if(!force&&loadedKey===bbox&&lastFeatures){routes.addTo(map);return}
   if(busy)return;busy=true;info('Consultando caminos de OpenStreetMap…');
   const q=`[out:json][timeout:25];way["highway"~"^(path|track|footway|bridleway)$"](${bbox});out geom;`;
   try{
     const urls=['https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter'];
     let data=null,err=null;
     for(const url of urls){try{const r=await fetch(url,{method:'POST',body:new URLSearchParams({data:q}),signal:AbortSignal.timeout(28000)});if(!r.ok)throw Error('HTTP '+r.status);data=await r.json();break}catch(e){err=e}}
     if(!data)throw err||Error('Servidor no disponible');
     routes.clearLayers();lastFeatures=0;
     for(const e of (data.elements||[]).slice(0,1600)){
       if(!e.geometry||e.geometry.length<2)continue;
       const tag=e.tags||{},type=tag.highway||'path';
       const line=L.polyline(e.geometry.map(pt=>[pt.lat,pt.lon]),{color:type==='track'?'#df8b33':'#d9e854',weight:type==='track'?3.5:2.7,opacity:.93,dashArray:type==='track'?null:'5 5'});
       const title=type==='track'?'Pista':type==='footway'?'Camino peatonal':type==='bridleway'?'Camino ecuestre':'Sendero';
       line.bindPopup('<b>'+title+'</b><p>'+escTrail(tag.name||'Sin nombre')+'</p><small>OpenStreetMap · trazado colaborativo. No garantiza acceso público ni transitabilidad.</small>');
       line.addTo(routes);lastFeatures++;
     }
     loadedKey=bbox;routes.addTo(map);info(lastFeatures+' caminos o senderos cargados en la vista. Fuente OSM, cobertura parcial.');
   }catch(e){info('No se pudieron consultar los caminos. Prueba más tarde o utiliza el mapa Topográfico.');console.warn('Caminos OSM',e)}finally{busy=false}
 }
 toggle.onchange=()=>{if(toggle.checked)loadTrails(true);else{map.removeLayer(routes);info('Caminos desactivados.')} };
 refresh.onclick=()=>{if(toggle.checked)loadTrails(true);else info('Activa primero «Caminos y senderos OSM».')};
 map.on('moveend',()=>{if(toggle.checked){loadedKey='';routes.clearLayers();info('Vista cambiada. Pulsa «Actualizar detalle visible» para consultar los caminos aquí.')}});
})();
