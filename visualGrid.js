/* VeraSetas 4.0 alpha 5: renderizado visual sin consultas meteorológicas. */
(function(){
 'use strict';
 const intersects=(a,b)=>a[0][0]<=b.getNorth()&&a[1][0]>=b.getSouth()&&a[0][1]<=b.getEast()&&a[1][1]>=b.getWest();
 function draw({map,L,gridCells,gridLayer,divisions,gridScore,markerColor,showGridDetail}){
  if(!map||!gridLayer||!Number.isInteger(divisions)||divisions<2||divisions>8)return;
  // Elimina solo las 64 casillas originales antes de crear las subdivisiones.
  for(const layer of gridLayer.getLayers())if(layer instanceof L.Rectangle)gridLayer.removeLayer(layer);
  const visible=map.getBounds().pad(.15);
  const fragment=[];
  for(const c of gridCells){
   if(!c?.bounds||!intersects(c.bounds,visible))continue;
   const raw=gridScore(c),score=Number.isFinite(raw)?raw:null,color=markerColor(score),b=c.bounds;
   const dy=(b[1][0]-b[0][0])/divisions,dx=(b[1][1]-b[0][1])/divisions;
   for(let y=0;y<divisions;y++)for(let x=0;x<divisions;x++){
    const south=b[0][0]+y*dy,west=b[0][1]+x*dx;
    const bounds=[[south,west],[south+dy,west+dx]];
    if(!intersects(bounds,visible))continue;
    const rect=L.rectangle(bounds,{color:'#152b22',weight:.5,fillColor:color,fillOpacity:score===null?.20:.67,interactive:true});
    rect.on('click',()=>showGridDetail(south+dy/2,west+dx/2));
    fragment.push(rect);
   }
  }
  for(const layer of fragment)gridLayer.addLayer(layer);
 }
 window.VeraSetasVisualGrid=Object.freeze({draw});
})();
