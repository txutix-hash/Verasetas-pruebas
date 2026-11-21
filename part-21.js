
// v3.7: smaller visual grid, explicitly reusing the original regional weather cell.
(function(){
 if(typeof gridDraw!=='function'||typeof gridCells==='undefined'||typeof gridLayer==='undefined')return;
 let divisions=2;
 let automatic=true;
 const control=document.createElement('div');control.id='vsGridSize';
 control.style.cssText='position:absolute;z-index:800;top:114px;right:10px;background:#17382deF;color:white;padding:7px 9px;border-radius:9px;box-shadow:0 2px 9px #0005;font:12px system-ui;max-width:155px';
 control.innerHTML='<label for="vsGridSizeSelect" style="display:block;margin-bottom:3px">Tamaño visual de casillas</label><select id="vsGridSizeSelect" style="width:100%;padding:5px;background:white;color:#17382d;border-radius:5px"><option value="1">Original (~8–12 km)</option><option value="2" selected>Mitad (~4–6 km)</option><option value="4">Cuarto (~2–3 km)</option><option value="8">Octavo (~1–1,5 km)</option></select><label style="display:flex;align-items:center;gap:5px;margin-top:5px"><input id="vsAutoGrid" type="checkbox" checked> Automático al acercar</label><small style="display:block;margin-top:4px;line-height:1.3">Mismos datos regionales; no mayor precisión.</small>';
 const wrap=document.getElementById('mapWrap');if(!wrap)return;wrap.appendChild(control);
 control.querySelector('select').onchange=e=>{automatic=false;control.querySelector('#vsAutoGrid').checked=false;divisions=Number(e.target.value);scheduleGridDraw()};
 control.querySelector('#vsAutoGrid').onchange=e=>{automatic=e.target.checked;if(automatic)updateGridZoom()};
 function updateGridZoom(){if(!automatic||typeof map?.getZoom!=='function')return;const z=map.getZoom(),next=z>=14?8:z>=12?4:z>=10?2:1;if(next!==divisions){divisions=next;control.querySelector('select').value=String(next);scheduleGridDraw()}}
 // Agrupa los eventos de zoom y desplazamiento en un solo redibujado por fotograma.
 let pendingFrame=0;
 function scheduleGridDraw(){
  if(pendingFrame)return;
  pendingFrame=requestAnimationFrame(()=>{pendingFrame=0;if(tab==='pred')gridDraw()});
 }
 map.on('zoomend',updateGridZoom);
 map.on('moveend',()=>{if(tab==='pred'&&divisions>1)scheduleGridDraw()});
 const oldDraw=gridDraw;
 gridDraw=function(){
  oldDraw();control.style.display=tab==='pred'?'block':'none';
  if(tab!=='pred'||divisions===1)return;
  // Un solo componente para dibujar la subdivisión visible.
  window.VeraSetasVisualGrid.draw({map,L,gridCells,gridLayer,divisions,gridScore,markerColor,showGridDetail});
  const missing=gridCells.filter(c=>gridScore(c)===null).length;
  const legend=document.getElementById('legend');
  if(legend&&missing&&!legend.textContent.includes('zonas sin índice'))legend.innerHTML+=' · ⚠ '+missing+' zonas sin índice (faltan datos)';
  if(legend&&!legend.textContent.includes('Casillas visuales ~'))legend.innerHTML+=' · Casillas visuales ~'+(divisions===2?'4–6':divisions===4?'2–3':'1–1,5')+' km; <b>datos regionales repetidos, no mayor precisión</b>';

 };
 const oldDetail=showGridDetail;
 showGridDetail=function(lat,lon){oldDetail(lat,lon);if(tab!=='pred'||divisions===1)return;
  const el=document.getElementById('detail');if(!el)return;
  const note=document.createElement('p');note.className='grid-note';note.textContent='Casilla visual subdividida: el porcentaje, la lluvia y la temperatura proceden de la cuadrícula regional original (~8–12 km). Las subdivisiones no son predicciones independientes.';el.appendChild(note);
 };
 updateGridZoom();gridDraw();
})();
