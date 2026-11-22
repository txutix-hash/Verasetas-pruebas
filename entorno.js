/* Capas visuales locales de suelo y relieve. */
(function(){
 if(!window.vsLeafletMap)return;

 const directory='./data/entorno/';
 let selection='',metadata,metadataRequest,currentLayer,status='';
 const basePanel=renderPanel;
 const baseMap=renderMap;
 const baseDetail=showGridDetail;
 const sampleImages=new Map();

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

 function loadMetadata(){
  metadataRequest??=fetch(directory+'manifest.json').then(response=>{
   if(!response.ok)throw Error('HTTP '+response.status);
   return response.json();
  }).catch(error=>{metadataRequest=null;throw error});
  return metadataRequest;
 }

 function loadSampleImage(file){
  if(!sampleImages.has(file)){
   const image=new Image();
   const pending=new Promise((resolve,reject)=>{
    image.onload=()=>{
     try{
      const canvas=document.createElement('canvas');
      canvas.width=image.naturalWidth;
      canvas.height=image.naturalHeight;
      const context=canvas.getContext('2d',{willReadFrequently:true});
      context.drawImage(image,0,0);
      resolve(canvas);
     }catch(error){reject(error)}
    };
    image.onerror=()=>reject(Error('Imagen no disponible'));
    image.src=directory+file;
   }).catch(error=>{sampleImages.delete(file);throw error});
   sampleImages.set(file,pending);
  }
  return sampleImages.get(file);
 }

 async function sampleClass(key,lat,lon){
  const layer=(await loadMetadata()).layers[key];
  const [southwest,northeast]=layer.bounds;
  const projection=map.options.crs;
  const sw=projection.project(L.latLng(southwest));
  const ne=projection.project(L.latLng(northeast));
  const point=projection.project(L.latLng(lat,lon));
  const x=(point.x-sw.x)/(ne.x-sw.x),y=(ne.y-point.y)/(ne.y-sw.y);
  if(x<0||x>=1||y<0||y>=1)return null;
  const canvas=await loadSampleImage(layer.file);
  const rgba=canvas.getContext('2d').getImageData(Math.floor(x*canvas.width),Math.floor(y*canvas.height),1,1).data;
  if(!rgba[3])return null;
  const color='#'+[...rgba.slice(0,3)].map(channel=>channel.toString(16).padStart(2,'0')).join('');
  return layer.classes.find(entry=>entry[0]===color)?.[1]??null;
 }

 showGridDetail=function(lat,lon){
  baseDetail(lat,lon);
  for(const [key,id] of [['ph','detailEnvironmentPh'],['aspect','detailEnvironmentAspect']]){
   const output=$(id);
   if(!output)continue;
   sampleClass(key,lat,lon).then(value=>{
    output.textContent=value??'Sin datos en este punto';
   }).catch(()=>{output.textContent='No disponible'});
  }
 };

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
   metadata=await loadMetadata();
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
