
/* v3.3: modos Mi especie / Todas las setas. Índice heurístico, no probabilidad. */
(function(){
 if(typeof gridDraw!=='function'||typeof gridScore!=='function'||typeof species==='undefined')return;
 const labels=L.layerGroup().addTo(map);
 const baseGridScore=gridScore;
 // Caché efímera: solo válida hasta el siguiente redibujado.
 let rankingCache=new WeakMap();
 let viewMode='mine';
 const modeControl=document.createElement('div');
 modeControl.id='vsModeControl';
 modeControl.innerHTML='<label for="vsModeSelect">Mostrar favorabilidad</label><select id="vsModeSelect" aria-label="Modo de favorabilidad"><option value="mine">Mi especie</option><option value="all">Todas las setas</option></select>';
 document.getElementById('mapWrap').appendChild(modeControl);
 const modeSelect=modeControl.querySelector('select');
 modeSelect.onchange=()=>{viewMode=modeSelect.value==='all'?'all':'mine';gridDraw();};
 gridScore=function(c){if(viewMode==='mine'||tab!=='pred')return baseGridScore(c);const r=rankings(c);return r.length?r[0].n:null;};
 const safeSpecies=species.map((s,i)=>i).filter(i=>!/t[oó]xic|venenos|muscaria|phalloides|pantherina/i.test(species[i].name+' '+species[i].short));
 function rankings(c){
  if(!c)return [];
  if(rankingCache.has(c))return rankingCache.get(c);
  const previous=selected,arr=[];
  try{for(const i of safeSpecies){selected=i;const n=baseGridScore(c);if(Number.isFinite(n))arr.push({i,n})}}
  finally{selected=previous}
  arr.sort((a,b)=>b.n-a.n);rankingCache.set(c,arr);return arr;
 }
 function redrawLabels(){
  labels.clearLayers();if(tab!=='pred')return;
  const zoom=map.getZoom();if(zoom<10)return;
  // Beta 9: solo calcular rankings y etiquetas para celdas dentro de la vista.
  const visible=map.getBounds().pad(.10);
  for(const c of gridCells){
   const b=c.bounds;
   if(b[0][0]>visible.getNorth()||b[1][0]<visible.getSouth()||b[0][1]>visible.getEast()||b[1][1]<visible.getWest())continue;
   // En 'Mi especie' no se necesitan rankings salvo para el detalle visible al ampliar.
   const current=viewMode==='all'?null:baseGridScore(c);
   const rank=(viewMode==='all'||zoom>=12)?rankings(c):[];
   const best=rank[0];
   const score=viewMode==='all'?(best?.n??null):current;
   const name=viewMode==='all'?(best?species[best.i].short:'Sin datos'):species[selected].short;
   const center=[(c.bounds[0][0]+c.bounds[1][0])/2,(c.bounds[0][1]+c.bounds[1][1])/2];
   const html=Number.isFinite(score)?'<div class="vs-cell-label"><div class="vs-cell-pct">'+score+'%*</div><div class="vs-cell-name">🍄 '+esc(name)+'</div>'+(zoom>=12?'<div class="vs-cell-sub">'+(viewMode==='all'?'Mejor índice':best?'Mejor: '+best.n+'/100':'Mi especie')+'</div>':'')+'</div>':'<div class="vs-cell-label vs-empty">Sin datos</div>';
   L.marker(center,{icon:L.divIcon({className:'vs-cell-icon',html,iconSize:[102,54],iconAnchor:[51,27]}),interactive:false,keyboard:false}).addTo(labels);
  }
 }
 const oldDraw=gridDraw;
 gridDraw=function(){rankingCache=new WeakMap();modeControl.style.display=tab==='pred'?'block':'none';oldDraw();redrawLabels();if(tab==='pred'){
  const legend=document.getElementById('legend');if(legend){if(viewMode==='all')legend.innerHTML=legend.innerHTML.replace('🍄 '+esc(species[selected].short)+' ·','🍄 Todas las setas ·');legend.innerHTML+=' · 📅 Índice limitado por temporada de cada especie · <b>%* = '+(viewMode==='all'?'mejor índice entre las especies':'favorabilidad de la especie seleccionada')+'</b> · 🍄 = especie con mayor índice (no probabilidad real)';}
 }};
 const oldDetail=showGridDetail;
 showGridDetail=function(lat,lon){oldDetail(lat,lon);if(tab!=='pred')return;
  const c=cellFor(lat,lon),rank=rankings(c),el=document.getElementById('detail');if(!el)return;
  const block=document.createElement('section');block.className='vs-best-list';
  const mode=document.createElement('p');mode.textContent=viewMode==='all'?'Modo Todas las setas: el color y porcentaje corresponden a la especie mejor puntuada, no a una probabilidad de hallazgo.':'Modo Mi especie: el color y porcentaje corresponden a '+species[selected].name+'.';block.appendChild(mode);
  const h=document.createElement('strong');h.textContent='🍄 Especies con condiciones más favorables';block.appendChild(h);
  if(!rank.length){const p=document.createElement('p');p.textContent='No hay datos suficientes para comparar especies.';block.appendChild(p)}
  for(const item of rank.slice(0,3)){const p=document.createElement('p');p.textContent=species[item.i].name+' · '+item.n+'/100 de favorabilidad';block.appendChild(p)}
  const warning=document.createElement('p');warning.textContent='* Porcentaje del índice experimental, NO probabilidad de presencia. No implica que haya setas ni que sean seguras para consumo.';block.appendChild(warning);
  el.appendChild(block);
 };
 map.on('zoomend moveend',()=>{rankingCache=new WeakMap();redrawLabels()});
 redrawLabels();
})();
