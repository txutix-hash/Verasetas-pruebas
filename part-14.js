
/* v2.2: mapa de favorabilidad orientativa y salto a coordenadas de referencia.
   Nunca se representa el índice como probabilidad calibrada ni como lugar de recolección permitido. */
(function(){
 if(typeof map==='undefined'||typeof gridCells==='undefined'||typeof gridScore!=='function')return;
 const wrap=document.getElementById('mapWrap');if(!wrap)return;
 const pane=document.createElement('section');pane.id='vsHotspots';pane.setAttribute('aria-label','Zonas más favorables');
 pane.innerHTML='<button type="button" class="vsHotspotToggle" aria-expanded="false">🍄 Ver zonas favorables</button><div class="vsHotspotList" hidden></div>';
 wrap.appendChild(pane);
 const toggle=pane.querySelector('.vsHotspotToggle'),list=pane.querySelector('.vsHotspotList');
 const candidateList=()=>gridCells.map(c=>({c,n:gridScore(c)})).filter(x=>Number.isFinite(x.n)).sort((a,b)=>b.n-a.n);
 const appleMaps=(lat,lon)=>'https://maps.apple.com/?ll='+lat.toFixed(5)+','+lon.toFixed(5)+'&q=Zona%20orientativa%20VeraSetas';
 function openCell(c){map.setView([c.t[1],c.t[2]],Math.max(map.getZoom(),12));showGridDetail(c.t[1],c.t[2]);}
 function refresh(){
   pane.hidden=tab!=='pred';if(tab!=='pred')return;
   const candidates=candidateList();const inView=candidates.filter(x=>map.getBounds().contains([x.c.t[1],x.c.t[2]]));
   const chosen=(inView.length?inView:candidates).slice(0,5);
   list.replaceChildren();
   const desc=document.createElement('small');desc.textContent='Índice experimental, no probabilidad real. La meteorología tiene resolución regional (~8–12 km). No indica accesos ni permisos de recolección.';list.appendChild(desc);
   if(!chosen.length){const e=document.createElement('p');e.textContent='Esperando datos meteorológicos. Comprueba la conexión y vuelve a intentarlo.';list.appendChild(e);return}
   for(const {c,n} of chosen){
     const b=document.createElement('button');b.type='button';
     const color=markerColor(n);const sw=document.createElement('span');sw.className='vs-swatch';sw.style.background=color;b.appendChild(sw);
     b.appendChild(document.createTextNode(n+' / 100 · '+nearestTown(c.t[1],c.t[2])[0]+' (sector '+(c.row+1)+'-'+(c.col+1)+')'));
     b.onclick=()=>{openCell(c);list.hidden=true;toggle.setAttribute('aria-expanded','false')};list.appendChild(b)
   }
 }
 toggle.onclick=()=>{list.hidden=!list.hidden;toggle.setAttribute('aria-expanded',String(!list.hidden));if(!list.hidden)refresh()};
 const originalDraw=gridDraw;
 gridDraw=function(){originalDraw();if(tab==='pred'){
   gridLayer.eachLayer(l=>{if(typeof l.on!=='function'||typeof l.getBounds!=='function')return;
     l.options.interactive=true;
     l.on('click',e=>{if(e.originalEvent&&L.DomEvent)L.DomEvent.stopPropagation(e.originalEvent);showGridDetail(e.latlng.lat,e.latlng.lng)});
   });
   const legend=document.getElementById('legend');if(legend){legend.innerHTML+=' · <span style="color:#56be70">● alto</span> <span style="color:#f1c45b">● medio</span> <span style="color:#d87965">● bajo</span> <span style="color:#8c9b95">● sin datos</span>'}
 }refresh()};
 const oldDetail=showGridDetail;
 showGridDetail=function(lat,lon){oldDetail(lat,lon);if(tab!=='pred')return;
   const c=cellFor(lat,lon),el=document.getElementById('detail');if(!el)return;
   const n=c?gridScore(c):null;const note=document.createElement('p');note.className='grid-note';note.textContent='Este punto representa el centro de una cuadrícula meteorológica, no un setal comprobado. Comprueba caminos, propiedad privada, restricciones de recolección y seguridad antes de desplazarte.';el.appendChild(note);
   if(c&&Number.isFinite(n)){const a=document.createElement('a');a.id='vsRoute';a.href=appleMaps(c.t[1],c.t[2]);a.target='_blank';a.rel='noopener noreferrer';a.textContent='📍 Ver sector en Mapas del iPhone';el.appendChild(a)}
 };
 // Alpha 4: refresh() ya se ejecuta desde gridDraw y moveend; se elimina el envoltorio de renderMap.
 map.on('moveend',()=>{if(!list.hidden)refresh()});
 refresh();
})();
