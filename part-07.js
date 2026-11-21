
/* Official-source validation: browser-side, with explicit CORS/network errors. */
const mfeCapabilities='https://wms.mapama.gob.es/sig/Biodiversidad/MFE?service=WMS&request=GetCapabilities';
const soilCapabilities='https://dev-maps.isric.org/mapserv/phh2o?service=WMS&request=GetCapabilities';
async function verifyWms(url,desired){
 const res=await fetch(url,{signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw Error('HTTP '+res.status);
 const doc=new DOMParser().parseFromString(await res.text(),'text/xml');
 if(doc.querySelector('parsererror'))throw Error('Respuesta no XML');
 const names=[...doc.getElementsByTagName('Name')].map(n=>n.textContent.trim());
 if(!names.includes(desired))throw Error('La capa '+desired+' no figura en GetCapabilities');
 return 'Servicio accesible; capa '+desired+' confirmada';
}
async function verifyOfficialSources(){
 const status=document.getElementById('officialDiagnostics');if(!status)return;
 status.textContent='Comprobando servicios oficiales desde tu navegador…';
 const results=await Promise.allSettled([verifyWms(mfeCapabilities,'LC.LandCoverSurfaces'),verifyWms(soilCapabilities,'phh2o_0-5cm_mean')]);
 status.innerHTML=results.map((r,i)=>`<p><b>${i?'ISRIC SoilGrids':'MITECO MFE'}:</b> ${r.status==='fulfilled'?r.value:'No verificable: '+String(r.reason?.message||r.reason)+'. Puede ser red, CORS o servicio no disponible.'}</p>`).join('');
}
