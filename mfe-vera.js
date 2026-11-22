/* Cartografía MFE25 distribuida con la aplicación. Las importaciones son independientes. */
(async function loadOfficialForest(){
 if(!window.vsLeafletMap)return;
 try{
  const response=await fetch('./data/mfe_vera.geojson');
  if(!response.ok)throw Error('HTTP '+response.status);
  const collection=await response.json();
  const features=forestPolygons(collection,true);
  if(!features.length)throw Error('Sin polígonos con especies reconocidas');
  for(const feature of features){
   const bounds=[Infinity,Infinity,-Infinity,-Infinity];
   const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
   for(const polygon of polygons)for(const ring of polygon)for(const [x,y] of ring){
    bounds[0]=Math.min(bounds[0],x);bounds[1]=Math.min(bounds[1],y);
    bounds[2]=Math.max(bounds[2],x);bounds[3]=Math.max(bounds[3],y);
   }
   if(!bounds.every(Number.isFinite)||bounds[0]<-7||bounds[1]<39||bounds[2]>-4||bounds[3]>41){
    throw Error('Geometría fuera del ámbito regional o en otro sistema de coordenadas');
   }
  }
  officialForestFeatures=features;
  officialForestStatus=`MFE25 de La Vera · ${features.length} teselas arboladas. Fuente: © Ministerio para la Transición Ecológica y el Reto Demográfico.`;
 }catch(error){
  officialForestStatus='Cartografía MFE25 de La Vera no disponible.';
  console.info('MFE25 de La Vera:',error.message);
 }
 if(tab==='flora'){
  renderPanel();
  renderMap();
 }
})();
