
/* VeraSetas 3.9.3: different colors per identified plant species, not just per forest group. */
(function(){
 if(typeof FLORA_GROUPS==='undefined'||typeof forestLayer==='undefined')return;
 const palette={
 'Pino silvestre':'#2775c6','Pino carrasco':'#69b5e2','Pino resinero':'#1b9d9e','Pino piñonero':'#7a83d5','Otros pinos':'#69889b',
 'Rebollo':'#248c48','Roble común':'#54c56c','Quejigo':'#a2cc59','Otros robles':'#749e6b',
 'Encina':'#a8b83c','Castaño':'#ed963b','Alcornoque':'#c4a064','Haya':'#5dbaa1','Abedul':'#a4d6c3',
 'Abeto blanco':'#416d91','Pinsapo':'#754d96','Eucalipto':'#9e75c5',
 'Chopo':'#15b4d2','Álamo':'#70d6db','Sauce':'#55aab5','Aliso':'#2a8689','Fresno':'#6ca7a0',
 'Sabina albar':'#899c7a','Sabina mora':'#ab9075','Pastizales':'#c8d85c','Prados':'#b9cd67','Herbazales':'#d3cc8e','Jaras':'#b68b77','Matorral de jara':'#9b7567'
 };
 const safeColor=(sp,k)=>palette[sp]||FLORA_GROUPS.find(g=>g[0]===k)?.[2]||'#89948e';
 function styleOSM(f){const k=floraKind(f),sp=floraSpecies(f,k);const c=safeColor(sp,k);return {color:c,fillColor:c,weight:1.4,fillOpacity:.57}}
 function styleMFE(f){const p=f.properties||{},c=safeColor(p._veraSpecies,p._veraKind);return {color:c,fillColor:c,weight:1.4,fillOpacity:.63}}
 function update(){if(tab!=='flora')return;
  forestLayer.setStyle(styleOSM);forestLayer.eachLayer(l=>{const f=l.feature;if(!f)return;const k=floraKind(f),sp=floraSpecies(f,k);l.bindPopup('<b>'+esc(sp||'Especie no identificada')+'</b><br><small>Fuente: OpenStreetMap · cobertura parcial</small>')});
  if(typeof mfeLayer!=='undefined'){mfeLayer.setStyle(styleMFE)}
  const panel=document.getElementById('floraGroups');if(panel){panel.querySelectorAll('[data-specgroup]').forEach(input=>{const k=input.dataset.specgroup,group=FLORA_GROUPS.find(g=>g[0]===k),sp=group?.[3]?.[Number(input.dataset.specindex)];if(!sp)return;const label=input.closest('label');if(!label)return;let sw=label.querySelector('.vs-sp-color');if(!sw){sw=document.createElement('span');sw.className='vs-sp-color';input.insertAdjacentElement('afterend',sw)}sw.style.background=safeColor(sp,k)})}
  const legend=document.getElementById('legend');if(legend){let el=legend.querySelector('#vsSpeciesLegend');if(!el){el=document.createElement('div');el.id='vsSpeciesLegend';legend.appendChild(el)}const active=[];for(const [k,, ,arr] of FLORA_GROUPS){if(!floraActive.has(k))continue;for(const sp of arr)if(floraSelection.get(k)?.has(sp))active.push([sp,safeColor(sp,k)])}el.innerHTML='<b>Colores por especie</b>'+ (active.length?active.map(([sp,c])=>'<div class="vs-sp-line"><span class="vs-sp-color" style="background:'+c+'"></span>'+esc(sp)+'</div>').join(''):'<small>Selecciona una especie para mostrarla.</small>')+'<small>Solo zonas con identificación disponible; no indica presencia en todos los bosques.</small>'}
 }
 const priorDraw=drawFlora;drawFlora=function(){priorDraw();update()};
 const priorVerified=redrawVerifiedForest;redrawVerifiedForest=function(){priorVerified();update()};
 // Alpha 4: eventos delegados; no se sobrescriben renderPanel ni renderMap.
 // drawFlora ya ejecuta update() cuando se renderiza la pestaña Flora.
 document.addEventListener('change',event=>{
  if(tab==='flora'&&event.target?.closest?.('#floraGroups'))setTimeout(update,0);
 });
 update();
})();
