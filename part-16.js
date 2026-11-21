
/* v3.1: official MFE polygon evidence only when verified taxon names are available.
   No unverified MFE numeric codes are mapped to species. */
(function(){
 if(typeof forestEvidence!=='function'||typeof insidePolygon!=='function'||typeof mfeFeatures==='undefined')return;
 const oldEvidence=forestEvidence;
 const habitat={0:['roble','castano'],1:['pino'],2:['roble','castano'],3:[],4:['encina','roble'],5:['roble','pino','castano'],9:[],10:['roble','castano']};
 const samples=c=>{const b=c.bounds,out=[];for(const dy of [.2,.5,.8])for(const dx of [.2,.5,.8])out.push([b[0][1]+(b[1][1]-b[0][1])*dx,b[0][0]+(b[1][0]-b[0][0])*dy]);return out};
 function officialEvidence(c){
   if(!mfeFeatures.length)return null;
   const wants=habitat[selected]||['roble','pino','castano'];
   if(!wants.length)return {state:'neutral',source:'MFE25',reason:'Especie con hábitat variado: sin bonificación forestal'};
   let matched=0,identified=0;
   for(const point of samples(c)){
     const kinds=new Set();
     for(const f of mfeFeatures){if(insidePolygon(point,f.geometry))kinds.add(f.properties._veraKind)}
     if(kinds.size){identified++;if([...kinds].some(k=>wants.includes(k)))matched++}
   }
   if(matched)return {state:'match',matched,identified,source:'MFE25',reason:'MFE25: '+matched+'/9 muestras con especie compatible'};
   if(identified)return {state:'different',matched:0,identified,source:'MFE25',reason:'MFE25: '+identified+'/9 muestras identificadas, ninguna compatible'};
   return {state:'unknown',source:'MFE25',reason:'MFE25 disponible, sin especies identificadas en las muestras'};
 }
 forestEvidence=function(c){const official=officialEvidence(c);if(official&&official.state!=='unknown')return official;const osm=oldEvidence(c);return {...osm,source:'OpenStreetMap',reason:official&&osm.state==='unknown'?'MFE25 y OSM: sin especies identificadas en las muestras':osm.reason}};
 const oldImport=importMfeGeojson;
 importMfeGeojson=function(obj,filename){const result=oldImport(obj,filename);if(typeof gridDraw==='function')gridDraw();return result};
 const oldDetail=showGridDetail;
 showGridDetail=function(lat,lon){oldDetail(lat,lon);if(tab!=='pred')return;
   const c=cellFor(lat,lon),ev=forestEvidence(c),root=document.getElementById('detail');if(!root)return;
   const block=document.createElement('p');block.id='vsMfeStatus';
   block.textContent='🌳 Fuente forestal usada en el índice: '+ev.source+'. '+ev.reason+'. '+(mfeFeatures.length?'Polígonos MFE con taxón reconocido: '+mfeFeatures.length+'.':'Aún no se han cargado polígonos MFE25 interpretables; la capa WMS solo se muestra visualmente.');
   root.appendChild(block);
 };
})();
