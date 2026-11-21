
/* Climate v1.1: weather is modelled by Open-Meteo. No fabricated station data. */
let climateLayer='rain',climateFrom=-7,climateTo=-1;
let stationsEnabled=false,stationNetwork='AEMET';
try{stationsEnabled=localStorage.getItem('verasetas_stations_on')==='true';stationNetwork=localStorage.getItem('verasetas_station_network')||'AEMET'}catch{}
const climateLegend={
 rain:'Precipitación · mm (1 mm = 1 L/m²) · suma del intervalo',
 wind:'Viento máximo diario · km/h · media de máximos del intervalo',
 hum:'Humedad relativa media diaria · % · media del intervalo'
};
function climateValue(c){
 const rows=exploreSeries.get(c.id);if(!rows)return null;
 const chosen=rows.filter(x=>x.date>=dateKey(climateFrom)&&x.date<=dateKey(climateTo));
 if(chosen.length!==climateTo-climateFrom+1)return null;
 const vals=chosen.map(x=>climateLayer==='rain'?x.rain:climateLayer==='wind'?x.windMax:x.hum);
 if(vals.some(x=>!Number.isFinite(x)))return null;
 return climateLayer==='rain'?vals.reduce((a,b)=>a+b,0):vals.reduce((a,b)=>a+b,0)/vals.length;
}
function climateColor(v){
 if(v==null)return '#78857e';
 if(climateLayer==='rain')return v>=80?'#1e3a8a':v>=40?'#2563eb':v>=15?'#60a5fa':v>=3?'#bfdbfe':'#eff6ff';
 if(climateLayer==='wind')return v>=45?'#991b1b':v>=30?'#ea580c':v>=15?'#facc15':'#bbf7d0';
 return v>=85?'#065f46':v>=70?'#059669':v>=50?'#5eead4':'#fef3c7';
}
function renderClimateGrid(){
 gridLayer.clearLayers();layersOverlay.clearLayers();
 for(const c of gridCells){const val=climateValue(c);
 const shape=L.rectangle(c.bounds,{color:'#172d24',weight:.65,fillColor:climateColor(val),fillOpacity:val==null?.22:.67}).addTo(gridLayer);
 shape.on('click',e=>{if(typeof showGridDetail==='function')showGridDetail(c,e.latlng);else if(typeof showCellDetail==='function')showCellDetail(c,e.latlng)});
 shape.bindTooltip(`${c.t[0]}: ${val==null?'sin datos':val.toFixed(1)+(climateLayer==='hum'?' %':climateLayer==='wind'?' km/h':' mm')}`);
 }
 gridLayer.eachLayer(layer=>{if(typeof layer.bringToFront==="function")layer.bringToFront()});
 $('legend').textContent=climateLegend[climateLayer]+' · gris: datos incompletos · modelo Open-Meteo';
}
const climateOldPanel=renderPanel;
renderPanel=function(){
 climateOldPanel();
 if(tab!=='climate')return;
 const dates=Array.from({length:76},(_,i)=>{const offset=i-60;return `<option value="${offset}">${dateKey(offset)}</option>`}).join('');
 $('panelBody').innerHTML=`
 <p class="muted">Datos meteorológicos modelizados, independientes de cualquier especie. La fecha y el intervalo se aplican a cada cuadrícula de La Vera.</p>
 <h3>CAPA DEL MAPA</h3>
 <div class="field"><label>Variable</label><select id="climateLayerSelect"><option value="rain">Precipitación</option><option value="wind">Viento</option><option value="hum">Humedad</option></select></div>
 <p class="muted" id="climateLayerDesc"></p>
 <div class="field"><label>Desde</label><select id="climateFrom">${dates}</select></div>
 <div class="field"><label>Hasta</label><select id="climateTo">${dates}</select></div>
 <button class="primary" id="climateApply">Actualizar mapa climático</button>
 <h3>ESTACIONES REALES</h3>
 <label><input type="checkbox" id="stationsToggle"> Pluviómetros <b id="stationsIndicator"></b></label>
 <div class="field"><label>Red</label><select id="stationsNetwork"><option>AEMET</option><option>SAIH</option><option>Meteocat</option><option>Euskalmet</option></select></div>
 <div class="climate-station-status" id="stationsStatus"></div>`;
 $('climateLayerSelect').value=climateLayer;
 $('climateFrom').value=String(climateFrom);$('climateTo').value=String(climateTo);
 $('stationsToggle').checked=stationsEnabled;$('stationsNetwork').value=stationNetwork;
 const updateDesc=()=>{$('climateLayerDesc').textContent=climateLegend[$('climateLayerSelect').value]};
 const updateStation=()=>{
 $('stationsIndicator').textContent=stationsEnabled?'ON':'OFF';
 $('stationsStatus').textContent=stationsEnabled
 ?`Red seleccionada: ${stationNetwork}. Pendiente de integrar y verificar la fuente oficial. No se muestran estaciones ni mediciones inventadas.`
 :'Estaciones desactivadas. Los colores del mapa son datos modelizados, no pluviómetros.';
 };
 $('climateLayerSelect').onchange=updateDesc;updateDesc();
 $('climateApply').onclick=()=>{
 const a=+$('climateFrom').value,b=+$('climateTo').value;
 if(a>b){alert('La fecha inicial debe ser anterior o igual a la final');return}
 climateFrom=a;climateTo=b;climateLayer=$('climateLayerSelect').value;
 renderClimateGrid();closePanel();
 };
 $('stationsToggle').onchange=e=>{stationsEnabled=e.target.checked;try{localStorage.setItem('verasetas_stations_on',String(stationsEnabled))}catch{}updateStation()};
 $('stationsNetwork').onchange=e=>{stationNetwork=e.target.value;try{localStorage.setItem('verasetas_station_network',stationNetwork)}catch{}updateStation()};
 updateStation();
};
// Beta 8: el renderizado climático se canaliza por gridDraw (part-10).
// renderMap ya llama a gridDraw; no es necesario volver a pintar aquí.
