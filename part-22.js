
/* v3.8: local, sub-cell terrain and forest evidence. No invented source data. */
(function(){
 if(typeof gridDraw!=='function'||typeof gridCells==='undefined')return;
 const tileData=new Map();let loaded=false;let detailMode=false;
 const ctrl=document.createElement('div');ctrl.id='vsHighRes';ctrl.style.cssText='position:absolute;z-index:810;top:260px;right:10px;background:#17382def;color:#fff;padding:8px;border-radius:9px;font:12px system-ui;max-width:180px;box-shadow:0 2px 9px #0005';
 ctrl.innerHTML='<b>Relieve y bosque detallados</b><div id="vsHrStatus" style="margin:5px 0">Sin datos locales de alta resolución</div><label style="display:block;cursor:pointer;background:#fff;color:#17382d;padding:5px;border-radius:5px;text-align:center">Cargar datos GeoJSON<input id="vsHrInput" type="file" accept=".geojson,.json,application/geo+json" style="display:none"></label><small style="display:block;margin-top:5px">Solo se corrigen las casillas con datos reales. Sin datos: índice regional.</small>';
 const wrap=document.getElementById('mapWrap');if(!wrap)return;wrap.appendChild(ctrl);
 const status=ctrl.querySelector('#vsHrStatus');
 function key(lat,lon){return lat.toFixed(5)+','+lon.toFixed(5)}
 function center(c,y,x,n){const b=c.bounds;return [b[0][0]+(y+.5)*(b[1][0]-b[0][0])/n,b[0][1]+(x+.5)*(b[1][1]-b[0][1])/n]}
 function forestType(k){let t=String(k||'').toLowerCase();if(/casta|castanea/.test(t))return 'castano';if(/pino|pinus/.test(t))return 'pino';if(/quercus ilex|encina/.test(t))return 'encina';if(/quercus suber|alcornoque/.test(t))return 'encina';if(/quercus|roble|rebollo/.test(t))return 'roble';if(/populus|chopo|alamo/.test(t))return 'chopo';return null}
 function speciesHabitat(){const name=String(species[selected]?.short||species[selected]?.name||'').toLowerCase();if(/aereus/.test(name))return ['encina','roble'];if(/pinophilus|n.scalo/.test(name))return ['pino'];if(/reticulatus|edulis|trompeta|cornucopioides/.test(name))return ['roble','castano'];if(/chopo|aegerita/.test(name))return ['chopo'];return []}
 function adjusted(c,lat,lon,info){if(!c?.t||!info)return null;const base=gridScore(c);if(!Number.isFinite(base))return null;let n=base;
 if(Number.isFinite(info.elevation)&&Number.isFinite(c.t[3])){const sp=species[selected];const was=c.t[3]<sp.min||c.t[3]>sp.max,now=info.elevation<sp.min||info.elevation>sp.max;n+=(was&&!now?16:!was&&now?-16:0)}
 const wanted=speciesHabitat(),kind=forestType(info.forest);
 if(kind&&wanted.length)n+=wanted.includes(kind)?6:-5;
 return Math.max(0,Math.min(100,Math.round(n)))}
 function ingest(obj){if(obj?.type!=='FeatureCollection'||!Array.isArray(obj.features))throw Error('Se requiere GeoJSON FeatureCollection');if(obj.features.length>20000)throw Error('Archivo demasiado grande: máximo 20.000 entidades');let count=0;
 for(const f of obj.features){if(f.geometry?.type!=='Point')continue;const q=f.geometry.coordinates,p=f.properties||{};if(!Array.isArray(q)||!Number.isFinite(q[0])||!Number.isFinite(q[1])||Math.abs(q[0])>180||Math.abs(q[1])>90)continue;const elevation=p.elevation==null?NaN:Number(p.elevation),forest=typeof p.forest==='string'?p.forest:null;if(!Number.isFinite(elevation)&&!forest)continue;tileData.set(key(q[1],q[0]),{elevation:Number.isFinite(elevation)?elevation:null,forest,source:p.source||'Archivo local'});count++}
 if(!count)throw Error('No hay puntos válidos con elevation o forest');loaded=true;status.textContent=count+' puntos detallados importados';gridDraw();return count}
 ctrl.querySelector('#vsHrInput').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const count=ingest(JSON.parse(await file.text()));alert(count+' puntos importados. La malla solo cambia donde hay muestras coincidentes.')}catch(err){alert('Archivo no compatible: '+err.message)}e.target.value=''};
 // Load only if a verified, processed data file is actually deployed.
 fetch('./data/terreno_vegetacion.geojson',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('sin archivo');return r.json()}).then(ingest).catch(()=>{});
 const previous=gridDraw;
 gridDraw=function(){previous();ctrl.style.display=tab==='pred'?'block':'none';if(tab!=='pred'||!loaded)return;
 const sel=document.getElementById('vsGridSizeSelect');const divisions=Number(sel?.value||2);if(divisions===1)return;
 // El renderizador dibuja solo subcasillas visibles: localizar cada muestra por su centro.
 // Nunca se presupone que hay 64 × divisions² rectángulos ni un orden fijo.
 const samples=new Map();
 for(const c of gridCells)for(let y=0;y<divisions;y++)for(let x=0;x<divisions;x++){
  const [lat,lon]=center(c,y,x,divisions),info=tileData.get(key(lat,lon));
  if(info)samples.set(key(lat,lon),{c,lat,lon,info});
 }
 let applied=0;
 for(const r of gridLayer.getLayers()){
  if(!(r instanceof L.Rectangle))continue;
  const ll=r.getBounds().getCenter(),sample=samples.get(key(ll.lat,ll.lng));
  if(!sample)continue;
  const {c,lat,lon,info}=sample,score=adjusted(c,lat,lon,info);
  if(score===null)continue;
  r.setStyle({fillColor:markerColor(score),weight:1.1,color:'#f5f3e8'});
  r.off('click');r.on('click',()=>showGridDetail(lat,lon));applied++;
 }
 const legend=document.getElementById('legend');if(legend)legend.innerHTML+=' · '+applied+' casillas con corrección local de relieve/bosque';
 };
 const prevDetail=showGridDetail;
 showGridDetail=function(lat,lon){prevDetail(lat,lon);if(tab!=='pred')return;const info=tileData.get(key(lat,lon));if(!info)return;const c=cellFor(lat,lon),n=adjusted(c,lat,lon,info),el=document.getElementById('detail');if(!el)return;const p=document.createElement('p');p.className='grid-note';p.textContent='Datos locales ('+info.source+'): altitud '+(info.elevation==null?'no disponible':Math.round(info.elevation)+' m')+'; bosque '+(info.forest||'no identificado')+'. Índice ajustado de esta subcasilla: '+(n==null?'sin datos':n+'/100')+'. La lluvia y temperatura siguen siendo regionales. La corrección local es experimental.';el.appendChild(p)};
 gridDraw();
})();
