/* Capas visuales locales de suelo y relieve. */
(function(){
 if(!window.vsLeafletMap)return;

 const directory='./data/entorno/';
 let selection='',metadata,metadataRequest,currentLayer,status='';
 const basePanel=renderPanel;
 const baseMap=renderMap;

 function showStatus(){
  const output=$('environmentStatus');
  if(output)output.textContent=status;
 }

 function showLegend(){
  const legend=$('environmentLegend');
  if(!legend)return;
  legend.replaceChildren();
  const layer=metadata?.layers[selection];
  if(!layer)return;
  const note=document.createElement('p');
  note.textContent=layer.description;
  legend.append(note);
  const entries=document.createElement('ul');
  for(const [color,label] of layer.classes){
   const item=document.createElement('li');
   const swatch=document.createElement('span');
   swatch.style.color=color;
   swatch.textContent='● ';
   swatch.setAttribute('aria-hidden','true');
   item.append(swatch,label);
   entries.append(item);
  }
  legend.append(entries);
 }

 async function showLayer(){
  if(currentLayer)map.removeLayer(currentLayer);
  currentLayer=null;
  status='';
  showStatus();
  showLegend();
  if(tab!=='flora'||!selection)return;

  const requested=selection;
  status='Cargando capa…';
  showStatus();
  try{
   metadataRequest??=fetch(directory+'manifest.json').then(response=>{
    if(!response.ok)throw Error('HTTP '+response.status);
    return response.json();
   }).catch(error=>{metadataRequest=null;throw error});
   metadata=await metadataRequest;
   if(tab!=='flora'||selection!==requested||currentLayer)return;
   showLegend();
   const layer=metadata.layers[requested];
   const overlay=L.imageOverlay(directory+layer.file,layer.bounds,{
    opacity:.72,attribution:layer.attribution,alt:layer.name
   });
   currentLayer=overlay;
   overlay.on('load',()=>{
    if(currentLayer!==overlay)return;
    status='';showStatus();
   });
   overlay.on('error',()=>{
    if(currentLayer!==overlay)return;
    map.removeLayer(overlay);
    currentLayer=null;
    status='No se pudo cargar la capa.';
    showStatus();
   });
   overlay.addTo(map).bringToBack();
  }catch(error){
   if(tab!=='flora'||selection!==requested)return;
   status='No se pudo cargar la capa.';
   showStatus();
  }
 }

 renderPanel=function(){
  basePanel();
  if(tab!=='flora')return;
  const panel=document.createElement('div');
  panel.className='official-source';
  panel.innerHTML=`<h3>Suelo y laderas</h3>
   <label for="environmentLayer">Capa del mapa</label>
   <select id="environmentLayer">
    <option value="">Ninguna</option>
    <option value="ph">pH superficial estimado</option>
    <option value="slope">Pendiente</option>
    <option value="aspect">Orientación de las laderas</option>
   </select>
   <p id="environmentStatus" role="status"></p>
   <div id="environmentLegend"></div>`;
  $('verifiedForestBox').after(panel);
  const control=$('environmentLayer');
  control.value=selection;
  control.onchange=()=>{selection=control.value;showLayer()};
  showStatus();
  showLegend();
 };
 renderMap=function(){
  baseMap();
  if(tab!=='flora'&&currentLayer){
   map.removeLayer(currentLayer);
   currentLayer=null;
  }
  if(tab==='flora'&&selection&&!currentLayer)showLayer();
 };
})();
