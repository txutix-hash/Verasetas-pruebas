
/* v1.8 stability and usability: preserve existing data and avoid fabricated readings. */
(function(){
 const panel=document.getElementById('appHealth'),out=document.getElementById('healthText');
 document.getElementById('healthClose').onclick=()=>panel.remove();
 function status(){if(!panel.isConnected)return;const online=navigator.onLine;
 panel.classList.toggle('offline',!online);
 out.textContent=(online?'Conectado':'Sin conexión')+' · clima '+gridLoaded+'/'+gridCells.length+' cuadrículas'+(gridErrorCount?' · '+gridErrorCount+' errores':'');
 }
 window.addEventListener('online',status);window.addEventListener('offline',status);
 window.addEventListener('unhandledrejection',e=>{console.error('VeraSetas',e.reason);status()});
 window.addEventListener('error',e=>{console.error('VeraSetas',e.message);status()});
 const previousFetch=fetchGrid;
 fetchGrid=async function(c){try{return await previousFetch(c)}finally{status()}};
 status();
 // A single daily date is a valid interval; other dates must be fully available.
 const previousDraw=gridDraw;
 gridDraw=function(){if(tab==='climate'){renderClimateGrid();return}previousDraw()};
 // Climate cards show the exact aggregated model value and data provenance.
 const previousDetail=showGridDetail;
 showGridDetail=function(lat,lon){previousDetail(lat,lon);if(tab!=='climate')return;
 const c=cellFor(lat,lon),v=climateValue(c),u=climateLayer==='rain'?'mm':climateLayer==='wind'?'km/h':'%';
 const el=document.createElement('div');el.className='card';
 el.innerHTML='<b>Clima · '+(climateLayer==='rain'?'Precipitación':climateLayer==='wind'?'Viento':'Humedad')+'</b><p>'+(v==null?'Datos insuficientes para el intervalo':v.toFixed(1)+' '+u)+'</p><small>Open-Meteo · datos modelizados en el centro de la cuadrícula · '+dateKey(climateFrom)+' a '+dateKey(climateTo)+'</small>';
 document.getElementById('detail').appendChild(el);
 };
 // Provide a working climate legend and click action for the entire grid.
 renderClimateGrid=function(){
 gridLayer.clearLayers();layersOverlay.clearLayers();
 for(const c of gridCells){const val=climateValue(c);
 const shape=L.rectangle(c.bounds,{color:'#172d24',weight:.65,fillColor:climateColor(val),fillOpacity:val==null?.22:.67}).addTo(gridLayer);
 shape.on('click',e=>showGridDetail(e.latlng.lat,e.latlng.lng));
 shape.bindTooltip(`${c.t[0]}: ${val==null?'sin datos':val.toFixed(1)+(climateLayer==='hum'?' %':climateLayer==='wind'?' km/h':' mm')}`);
 }
 gridLayer.eachLayer(layer=>{if(typeof layer.bringToFront==="function")layer.bringToFront()});
 document.getElementById('legend').textContent=climateLegend[climateLayer]+' · gris: datos incompletos · modelo Open-Meteo';
 };
 // Show measured / estimated pH in the existing clicked-cell detail, only if imported.
 const phDetail=showGridDetail;
 showGridDetail=function(lat,lon){phDetail(lat,lon);const c=cellFor(lat,lon),v=phByCell.get(c.id);
 if(v==null||!['pred','flora','explore'].includes(tab))return;
 const card=document.createElement('div');card.className='card';card.innerHTML='<b>pH superficial estimado</b><p>'+v.toFixed(1)+' · 0–5 cm</p><small>Media de muestras importadas o raster procesado; no es una medición in situ.</small>';
 document.getElementById('detail').appendChild(card);
 };
 // Add a retry action for climate without requiring a full reload.
 const healthButton=document.createElement('button');healthButton.textContent='Reintentar';healthButton.title='Volver a consultar cuadrículas fallidas';
 healthButton.onclick=async()=>{if(gridBusy)return;const pending=gridCells.filter(c=>!c.ready);if(!pending.length){status();return}
 gridErrorCount=0;gridBusy=true;let i=0;async function work(){while(i<pending.length){const c=pending[i++];try{await fetchGrid(c)}catch(e){gridErrorCount++;console.warn(e)}}}
 try{await Promise.all(Array.from({length:3},work))}finally{gridBusy=false;gridDraw();status()}};
 if(panel.isConnected)panel.appendChild(healthButton);
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(console.warn);
})();
