
/* v2.1: Copia de seguridad local de setales e importación GPX.
   No transmite ubicaciones a ningún servidor. */
(function(){
 if(typeof renderSpots!=='function'||typeof spots==='undefined')return;
 const previousRenderSpots=renderSpots;
 const safeSpot=(s)=>{const lat=Number(s.lat),lon=Number(s.lon);
   if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
   const name=String(s.name||'Setal sin nombre').trim().slice(0,100);
   return {name:name||'Setal sin nombre',lat,lon};
 };
 const download=(name,content,type)=>{
   const url=URL.createObjectURL(new Blob([content],{type}));
   const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),6000);
 };
 function attach(){
   const root=document.getElementById('spotList');
   if(!root||root.querySelector('.vs-backup'))return;
   const box=document.createElement('section');box.className='vs-backup';
   box.innerHTML='<h3>🔒 Mis setales: copia de seguridad</h3>'+
     '<p>Los setales se guardan solo en este navegador. Si borras los datos de Safari, puedes perderlos. Exporta una copia y guárdala en Archivos o iCloud. No compartas tus coordenadas privadas.</p>'+
     '<div class="vs-actions"><button type="button" id="vsJsonExport">⬇ Copia JSON</button><button type="button" id="vsGpxExport">⬇ Exportar GPX</button>'+
     '<button type="button" id="vsJsonImport">⬆ Importar JSON</button><button type="button" id="vsGpxImport">⬆ Importar GPX</button></div>'+
     '<input id="vsJsonFile" type="file" accept=".json,application/json"><input id="vsGpxFile" type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml">'+
     '<div id="vsBackupMessage" class="vs-message" role="status" aria-live="polite"></div>';
   root.appendChild(box);
   const msg=t=>{const el=document.getElementById('vsBackupMessage');if(el)el.textContent=t};
   document.getElementById('vsJsonExport').onclick=()=>{
     download('verasetas-setales-'+new Date().toISOString().slice(0,10)+'.json',
       JSON.stringify({app:'VeraSetas',version:1,exportedAt:new Date().toISOString(),spots:spots.map(safeSpot).filter(Boolean)},null,2),
       'application/json');msg('Copia generada. Guárdala en un lugar privado.');
   };
   document.getElementById('vsGpxExport').onclick=()=>{if(!spots.length){msg('No hay setales que exportar.');return}exportGpx()};
   document.getElementById('vsJsonImport').onclick=()=>document.getElementById('vsJsonFile').click();
   document.getElementById('vsGpxImport').onclick=()=>document.getElementById('vsGpxFile').click();
   async function handle(file,format){
     if(!file)return;
     try{
       if(file.size>2_000_000)throw Error('El archivo supera 2 MB.');
       const raw=await file.text();let imported=[];
       if(format==='json'){
         const data=JSON.parse(raw);
         if(data.app!=='VeraSetas'||!Array.isArray(data.spots))throw Error('No es una copia de VeraSetas válida.');
         imported=data.spots;
       }else{
         const doc=new DOMParser().parseFromString(raw,'application/xml');
         if(doc.querySelector('parsererror'))throw Error('El GPX contiene XML incorrecto.');
         const root=doc.documentElement;
         if(root.localName!=='gpx')throw Error('El archivo no es GPX.');
         imported=Array.from(doc.getElementsByTagNameNS('*','wpt')).map(el=>({
           lat:el.getAttribute('lat'),lon:el.getAttribute('lon'),
           name:Array.from(el.children).find(c=>c.localName==='name')?.textContent||'Setal GPX'
         }));
       }
       if(imported.length>1000)throw Error('Máximo 1000 puntos por archivo.');
       const valid=imported.map(safeSpot).filter(Boolean);
       if(!valid.length)throw Error('No se encontraron puntos válidos.');
       if(!confirm('¿Importar '+valid.length+' setales? Se conservarán los que ya tienes.'))return;
       const keys=new Set(spots.map(s=>[Number(s.lat).toFixed(5),Number(s.lon).toFixed(5),String(s.name).trim().toLowerCase()].join('|')));
       let added=0;
       for(const s of valid){
         const key=[s.lat.toFixed(5),s.lon.toFixed(5),s.name.toLowerCase()].join('|');
         if(keys.has(key))continue;
         spots.push(s);keys.add(key);added++;
       }
       persist();renderMap();renderSpots();
       const result=document.getElementById('vsBackupMessage');if(result)result.textContent=added+' setales importados; duplicados omitidos.';
     }catch(e){msg('No se pudo importar: '+e.message)}
   }
   document.getElementById('vsJsonFile').onchange=e=>{handle(e.target.files?.[0],'json');e.target.value=''};
   document.getElementById('vsGpxFile').onchange=e=>{handle(e.target.files?.[0],'gpx');e.target.value=''};
 }
 renderSpots=function(){previousRenderSpots();attach()};
 if(document.getElementById('spotList'))attach();
})();
