
/* Verified offline geospatial inputs. Does not silently treat OSM as MFE25. */
let mfeFeatures=[],mfeLayer=L.geoJSON(null),mfeImportName='',phSamples=[],phByCell=new Map();
const MFE_CODES={
 '21':['pino','Pino silvestre'],'24':['pino','Pino carrasco'],'26':['pino','Pino resinero'],'23':['pino','Pino piñonero'],
 '41':['roble','Rebollo'],'45':['roble','Roble común'],'44':['roble','Quejigo'],
 '46':['haya','Haya'],'72':['castano','Castaño'],'43':['encina','Encina'],'42':['alcornoque','Alcornoque']
};
/* Codes above are illustrative candidates ONLY: require explicit name confirmation in input, never infer species from them. */
const mfeNames={
 'pinus sylvestris':['pino','Pino silvestre'],'pinus halepensis':['pino','Pino carrasco'],
 'pinus pinaster':['pino','Pino resinero'],'pinus pinea':['pino','Pino piñonero'],
 'quercus pyrenaica':['roble','Rebollo'],'quercus robur':['roble','Roble común'],
 'quercus faginea':['roble','Quejigo'],'quercus ilex':['encina','Encina'],
 'castanea sativa':['castano','Castaño'],'quercus suber':['alcornoque','Alcornoque'],
 'fagus sylvatica':['haya','Haya'],'betula pendula':['abedul','Abedul'],
 'populus nigra':['ribera','Chopo'],'alnus glutinosa':['ribera','Aliso'],
 'fraxinus angustifolia':['ribera','Fresno'],'salix alba':['ribera','Sauce']
};
function speciesFromProps(props){
 if(typeof props._veraKind==='string'&&typeof props._veraSpecies==='string')return [props._veraKind,props._veraSpecies];
 const fields=['scientific_name','scientificName','species_name','especie_nombre','NOMBRE','ESPECIE_NOMBRE','taxon'];
 const values=fields.map(k=>props[k]).filter(v=>typeof v==='string').map(v=>v.toLowerCase().trim());
 for(const v of values)for(const [name,pair] of Object.entries(mfeNames))if(v===name||v.startsWith(name+' '))return pair;
 return null;
}
function insidePolygon(point,geom){if(!geom)return false;
 function ringHit(ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
 const [xi,yi]=ring[i],[xj,yj]=ring[j],x=point[0],y=point[1];
 if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
 }return inside}
 function polyHit(rings){return rings?.length&&ringHit(rings[0])&&!rings.slice(1).some(ringHit)}
 return geom.type==='Polygon'?polyHit(geom.coordinates):geom.type==='MultiPolygon'?geom.coordinates.some(polyHit):false;
}
function importMfeGeojson(obj,filename){
 if(obj?.type!=='FeatureCollection'||!Array.isArray(obj.features))throw Error('Se requiere un GeoJSON FeatureCollection');
 const filtered=obj.features.filter(f=>['Polygon','MultiPolygon'].includes(f.geometry?.type)).map(f=>{
 const pair=speciesFromProps(f.properties||{});return pair?{...f,properties:{...f.properties,_veraKind:pair[0],_veraSpecies:pair[1]}}:null;
 }).filter(Boolean);
 mfeFeatures=filtered;mfeImportName=filename;
 redrawVerifiedForest();return {total:obj.features.length,recognized:filtered.length};
}
function redrawVerifiedForest(){
 mfeLayer.clearLayers();if(tab!=='flora'){map.removeLayer(mfeLayer);return}
 if(!map.hasLayer(mfeLayer))mfeLayer.addTo(map);
 const selectedFeatures=mfeFeatures.filter(f=>floraActive.has(f.properties._veraKind)&&floraSelection.get(f.properties._veraKind)?.has(f.properties._veraSpecies));
 mfeLayer.addData({type:'FeatureCollection',features:selectedFeatures});
 mfeLayer.setStyle(f=>({color:FLORA_GROUPS.find(g=>g[0]===f.properties._veraKind)?.[2]||'#777',weight:1.3,fillOpacity:.48}));
 mfeLayer.eachLayer(layer=>layer.bindPopup('<b>'+esc(layer.feature.properties._veraSpecies)+'</b><br>Importación local: '+esc(mfeImportName)+'<br>Fuente declarada por el usuario; sin validación de procedencia.'));
 if(mfeFeatures.length){$('legend').innerHTML+='<br><small>Polígonos importados: '+selectedFeatures.length+' visibles · '+mfeFeatures.length+' reconocidos</small>'}
}
function parsePhCsv(text){
 const lines=text.trim().split(/\r?\n/);if(lines.length<2)throw Error('CSV vacío');
 const delim=lines[0].includes(';')?';':',';const header=lines.shift().split(delim).map(x=>x.trim().toLowerCase());
 const ix=header.indexOf('lat'),iy=header.indexOf('lon'),iz=header.indexOf('ph');
 if([ix,iy,iz].some(x=>x<0))throw Error('Se requieren columnas lat,lon,ph');
 const samples=[];
 for(const line of lines){const a=line.split(delim);const lat=Number(a[ix]),lon=Number(a[iy]),ph=Number(a[iz]);
 if(Number.isFinite(lat)&&Number.isFinite(lon)&&ph>=0&&ph<=14&&lat>39&&lat<41&&lon>-7&&lon<-4)samples.push({lat,lon,ph})}
 if(!samples.length)throw Error('No hay puntos válidos de pH en La Vera');
 phSamples=samples;phByCell=new Map();for(const c of gridCells){const v=samples.filter(p=>p.lat>=c.bounds[0][0]&&p.lat<c.bounds[1][0]&&p.lon>=c.bounds[0][1]&&p.lon<c.bounds[1][1]);if(v.length)phByCell.set(c.id,v.reduce((a,b)=>a+b.ph,0)/v.length)}
 drawVerifiedPh();return {samples:samples.length,cells:phByCell.size};
}
const phFilterLayer=L.layerGroup();
function drawVerifiedPh(){phFilterLayer.clearLayers();if(tab!=='flora'||!$('phEnabled')?.checked||!phByCell.size){map.removeLayer(phFilterLayer);return}
 const lo=Number($('phMin').value),hi=Number($('phMax').value);let count=0;
 for(const c of gridCells){const p=phByCell.get(c.id);if(p==null||p<lo||p>hi)continue;count++;
 const color=p<5?'#de7e43':p<6?'#f2bf6c':p<7?'#b2c86c':p<8?'#5fb8a7':'#4b91d1';
 L.rectangle(c.bounds,{color,weight:1,fillColor:color,fillOpacity:.35,interactive:false}).addTo(phFilterLayer)}
 if(!map.hasLayer(phFilterLayer))phFilterLayer.addTo(map);
 $('phMessage').textContent=count?`${count} cuadrículas con muestras importadas en el rango. Media de puntos, no cobertura continua.`:'Ninguna zona cae en este rango (entre las cuadrículas con muestras).';
}
const importedOldPanel=renderPanel;
renderPanel=function(){importedOldPanel();if(!['flora','pred'].includes(tab))return;
 const block=document.createElement('div');block.id='verifiedForestBox';
 block.innerHTML=`<h3>DATOS VECTORIALES Y pH NUMÉRICO</h3>
 <p>Importa un GeoJSON <b>en EPSG:4326</b> con polígonos y un campo de nombre científico. Los códigos MFE no se interpretan automáticamente: sin diccionario verificado se omiten para evitar clasificaciones falsas.</p>
 <label>Polígonos forestales GeoJSON <input id="mfeGeoInput" type="file" accept=".geojson,.json,application/geo+json"></label>
 <p id="mfeImportStatus">${mfeFeatures.length} polígonos identificados en memoria. Solo se reconocen nombres científicos explícitos.</p>
 <label>pH superficial, CSV con columnas lat,lon,ph <input id="phCsvInput" type="file" accept=".csv,text/csv"></label>
 <p id="phImportStatus">${phSamples.length} muestras · ${phByCell.size} cuadrículas. pH en escala 0–14, no pH×10.</p>
 <p>Para SoilGrids, exporta los valores numéricos de 0–5 cm y divide entre diez los valores codificados como pH×10. No se imputan cuadrículas sin datos.</p>`;
 if(tab==='pred'){const soil=block.querySelector('#phWmsToggle');if(soil){const label=soil.closest('label');if(label)label.remove();const status=block.querySelector('#phWmsStatus');if(status)status.remove();block.querySelectorAll('small').forEach(el=>{if(el.textContent.includes('Estimación espacial modelizada'))el.remove()})}}
 $('panelBody').prepend(block);
 $('mfeGeoInput').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const r=importMfeGeojson(JSON.parse(await f.text()),f.name);$('mfeImportStatus').textContent=`${r.recognized} de ${r.total} polígonos reconocidos por nombre científico. Fuente no autenticada.`}catch(err){$('mfeImportStatus').textContent='Error: '+err.message}};
 $('phCsvInput').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const r=parsePhCsv(await f.text());$('phImportStatus').textContent=`${r.samples} muestras, ${r.cells} cuadrículas con datos.`}catch(err){$('phImportStatus').textContent='Error: '+err.message}};
};
const importedOldMap=renderMap;
renderMap=function(){importedOldMap();const floraPhCard=$('floraPhCard');if(floraPhCard)floraPhCard.classList.toggle('hidden',tab!=='flora');if(tab==='flora')drawFlora();syncOfficialLayers();redrawVerifiedForest();drawVerifiedPh()};
const importedOldDrawFlora=drawFlora;
drawFlora=function(){importedOldDrawFlora();redrawVerifiedForest();drawVerifiedPh()};
['phMin','phMax','phEnabled'].forEach(id=>$(id).addEventListener(id==='phEnabled'?'change':'input',()=>drawVerifiedPh()));
