
/* v1.1: independently switchable authoritative raster WMS layers.
   MFE layer names must be confirmed against GetCapabilities before production use.
   SoilGrids WMS depicts model estimates, not laboratory measurements. */
let officialMfeOn=false,officialPhOn=false;
const officialMfe=L.tileLayer.wms('https://wms.mapama.gob.es/sig/Biodiversidad/MFE',{
 layers:'LC.LandCoverSurfaces',format:'image/png',transparent:true,version:'1.1.1',
 opacity:.45,attribution:'Mapa Forestal de España · MITECO (WMS)',maxZoom:19
});
const officialPh=L.tileLayer.wms('https://dev-maps.isric.org/mapserv/phh2o',{
 layers:'phh2o_0-5cm_mean',format:'image/png',transparent:true,version:'1.1.1',
 opacity:.58,attribution:'SoilGrids © ISRIC · pH modelizado 0–5 cm',maxZoom:18
});
officialMfe.on('tileerror',()=>{const s=document.getElementById('mfeWmsStatus');if(s)s.textContent='No se ha podido cargar alguna tesela MFE. Comprueba disponibilidad y nombre de capa WMS.'});
officialPh.on('tileerror',()=>{const s=document.getElementById('phWmsStatus');if(s)s.textContent='No se ha podido cargar alguna tesela de SoilGrids.'});
function syncOfficialLayers(){
 if(!['flora','pred'].includes(tab)){map.removeLayer(officialMfe);map.removeLayer(officialPh);return}
 if(officialMfeOn){if(!map.hasLayer(officialMfe))officialMfe.addTo(map)}else map.removeLayer(officialMfe);
 if(officialPhOn&&tab==='flora'){if(!map.hasLayer(officialPh))officialPh.addTo(map)}else map.removeLayer(officialPh);
}
const officialOldPanel=renderPanel;
renderPanel=function(){
 officialOldPanel();
 if(!['flora','pred'].includes(tab))return;
 const block=document.createElement('div');
 block.className='official-source';
 block.innerHTML=`<h3>🌳 MAPA FORESTAL OFICIAL (MITECO)</h3>
 <label><input type="checkbox" id="mfeWmsToggle" ${officialMfeOn?'checked':''}> Mapa Forestal de España · MITECO (WMS)</label>
 <small>Capa visual WMS oficial para contrastar el mapa de colores con el bosque cartografiado. No modifica automáticamente la puntuación: para eso hacen falta polígonos y especies verificadas.</small>
 <p id="mfeWmsStatus" class="muted">Fuente: MITECO, Mapa Forestal de España. Requiere Internet y disponibilidad del servicio.</p>
 <label><input type="checkbox" id="phWmsToggle" ${officialPhOn?'checked':''}> pH superficial · SoilGrids (0–5 cm)</label>
 <small>Estimación espacial modelizada, no medición local. La imagen WMS se puede superponer; el rango 3–9 todavía no recorta píxeles.</small>
 <p id="phWmsStatus" class="muted">Fuente: ISRIC SoilGrids. Disponibilidad externa no garantizada.</p>`;
 if(tab==='pred'){const soil=block.querySelector('#phWmsToggle');if(soil){const label=soil.closest('label');if(label)label.remove();const status=block.querySelector('#phWmsStatus');if(status)status.remove();block.querySelectorAll('small').forEach(el=>{if(el.textContent.includes('Estimación espacial modelizada'))el.remove()})}}
 $('panelBody').prepend(block);
 // El bloque WMS ya existe: el verificador se monta aquí, no en un wrapper previo.
 if(tab==='flora'){
  const info=document.createElement('div');
  info.id='officialDiagnostics';
  info.innerHTML='<button id="verifyOfficialBtn">Comprobar servicios WMS</button><p>La superposición visual no identifica automáticamente especies ni valores de pH por cuadrícula. El filtro de pH seguirá inactivo hasta disponer de datos numéricos fiables.</p>';
  block.append(info);
  document.getElementById('verifyOfficialBtn').onclick=verifyOfficialSources;
 }

 $('mfeWmsToggle').onchange=e=>{officialMfeOn=e.target.checked;syncOfficialLayers()};
 if($('phWmsToggle'))$('phWmsToggle').onchange=e=>{officialPhOn=e.target.checked;syncOfficialLayers()};
};
// Las capas WMS se sincronizan desde el único adaptador cartográfico posterior (part-08).
