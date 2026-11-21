
/* v3.1: trazabilidad de la puntuación, no nueva predicción ni probabilidad. */
(function(){
 if(typeof gridScore!=='function'||typeof showGridDetail!=='function'||typeof gridCells==='undefined')return;
 function label(n){return n>=65?'Alto':n>=40?'Intermedio':'Bajo'}
 function explain(c){
  const s=species[selected],d=daily(c.t),rain=rainBefore(c.t),alt=c.t[3],ev=forestEvidence(c),n=gridScore(c);
  if(n===null||!d||rain===null||!Number.isFinite(alt))return null;
  const temp=(d.max+d.min)/2;
  const base=32,rainBonus=Math.min(35,rain/(s.rain*2)*35),tempPenalty=Math.abs(temp-s.temp)*2.5,altPenalty=(alt<s.min||alt>s.max)?16:0;
  const forestAdjustment=ev.state==='match'?Math.min(18,6+ev.matched*2):ev.state==='different'?-8:0;
  return {s,d,rain,alt,ev,n,temp,base,rainBonus,tempPenalty,altPenalty,forestAdjustment};
 }
 const previous=showGridDetail;
 showGridDetail=function(lat,lon){
  previous(lat,lon);
  if(tab!=='pred')return;
  const c=cellFor(lat,lon),v=explain(c),el=document.getElementById('detail');if(!el)return;
  const section=document.createElement('section');section.className='vs-explain';
  const title=document.createElement('h3');title.textContent='🔎 ¿Por qué este color?';section.appendChild(title);
  const paragraph=t=>{const p=document.createElement('p');p.textContent=t;section.appendChild(p)};
  if(!v){paragraph('No hay suficientes datos meteorológicos y de altitud para justificar una puntuación. Esta zona debe mostrarse como sin datos.');el.appendChild(section);return}
  paragraph('Índice '+v.n+'/100 ('+label(v.n)+'). Escala heurística experimental: no es un porcentaje de probabilidad de encontrar setas.');
  const dl=document.createElement('dl');
  function metric(k,value){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=value;dl.append(dt,dd)}
  metric('Lluvia previa ('+rainWindow+' días)',v.rain.toFixed(1)+' mm');
  metric('Aporte por lluvia','+'+v.rainBonus.toFixed(1)+' puntos');
  metric('Temperatura media estimada',v.temp.toFixed(1)+' °C');
  metric('Penalización térmica','−'+v.tempPenalty.toFixed(1)+' puntos');
  metric('Altitud de la celda',Math.round(v.alt)+' m');
  metric('Penalización por altitud','−'+v.altPenalty.toFixed(0)+' puntos');
  metric('Bosque: ajuste', (v.forestAdjustment>=0?'+':'')+v.forestAdjustment+' puntos');
  section.appendChild(dl);
  paragraph('Evidencia forestal: '+v.ev.reason+'. Fuente disponible: '+(typeof verifiedForestData!=='undefined'&&verifiedForestData?'cartografía forestal importada / OSM según cobertura':'OpenStreetMap o datos importados, si se han cargado')+'.');
  const warning=document.createElement('p');warning.className='vs-warning';
  warning.textContent='Fiabilidad limitada: cuadrícula regional (~8–12 km), lluvia modelizada y cartografía forestal incompleta o variable. No se ha validado este índice con observaciones de fructificación. El color no verifica accesos ni permisos.';
  section.appendChild(warning);
  const route=el.querySelector('#vsRoute');if(route)el.insertBefore(section,route);else el.appendChild(section);
 };
})();
