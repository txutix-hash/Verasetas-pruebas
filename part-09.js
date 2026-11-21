
/* v1.8: carga automática de datos ya procesados y servidos junto a la aplicación.
   No sustituye la adquisición y procesamiento de los archivos oficiales. */
async function loadProcessedSources(){
 const status=document.createElement('div');status.id='processedStatus';
 status.style.cssText='position:absolute;right:12px;bottom:64px;z-index:850;background:#163527;color:#d8e9d9;padding:7px 10px;border-radius:8px;font-size:11px;max-width:260px;pointer-events:none';
 document.body.appendChild(status);
 const messages=[];
 try{
  const r=await fetch('./data/manifest.json',{cache:'no-store'});
  if(!r.ok)throw Error('Sin datos procesados');
  const m=await r.json();
  if(m.forest!=='no disponible'){
   const f=await fetch('./data/mfe_lavera.geojson');if(!f.ok)throw Error('No se pudo leer GeoJSON MFE');
   const obj=await f.json();const result=importMfeGeojson(obj,'MFE25 procesado');
   messages.push('MFE: '+result.recognized+' polígonos con taxón identificado');
  }
  if(m.ph!=='no disponible'){
   const r=await fetch('./data/ph_lavera.csv');if(!r.ok)throw Error('No se pudo leer CSV pH');
   const result=parsePhCsv(await r.text());
   messages.push('SoilGrids: '+result.cells+' cuadrículas con pH estimado');
  }
  status.textContent=messages.length?messages.join(' · '):'Sin archivos de MFE/pH procesados';
 }catch(e){status.textContent='Fuentes espaciales no precargadas; usa importación manual o ejecutar procesar_fuentes.py';console.info(e)}
}
if(location.protocol!=='file:')loadProcessedSources();
