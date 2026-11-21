/** Beta 2: comprobación voluntaria de navegación; no solicita datos ni altera setales. */
export async function runFunctionalChecks(){
 const tabs=['pred','explore','spots','climate','flora','catalog'];
 const checks=[],previous=document.querySelector('#tabs button.active')?.dataset.tab||'pred';
 const panel=document.getElementById('panelBody');
 const overlay=document.getElementById('overlay');
 const qa=document.getElementById('vsQaPanel');
 const wasOpen=qa&&!qa.hidden;
 const capture=[];
 const onError=e=>capture.push(String(e.message||e.error||'Error desconocido'));
 const onRejection=e=>capture.push('Promesa: '+String(e.reason?.message||e.reason||'Error desconocido'));
 window.addEventListener('error',onError);
 window.addEventListener('unhandledrejection',onRejection);
 try{
  for(const tab of tabs){
   const button=document.querySelector(`#tabs button[data-tab="${tab}"]`);
   if(!button){checks.push({name:tab,ok:false,detail:'Botón inexistente'});continue}
   try{
    button.click();
    const active=button.classList.contains('active');
    const title=document.getElementById('panelTitle')?.textContent||'';
    const content=tab==='catalog'?(document.getElementById('catalogScreen')?.textContent?.trim()||''):(panel?.textContent?.trim()||'');
    const expected={pred:'Predicción',explore:'EXPLORACIÓN',spots:'Setales',climate:'Clima',flora:'Flora',catalog:'Catálogo'}[tab];
    const catalogVisible=tab!=='catalog'||(document.getElementById('catalogScreen')&&!document.getElementById('catalogScreen').classList.contains('hidden'));
    const ok=active&&content.length>0&&catalogVisible&&(tab==='catalog'||title.toLowerCase().includes(expected.toLowerCase())||tab==='spots');
    checks.push({name:tab,ok,detail:ok?'Panel renderizado':'Título, contenido o pestaña activa incorrectos'});
   }catch(err){checks.push({name:tab,ok:false,detail:String(err.message||err)})}
  }
 }finally{
  try{document.querySelector(`#tabs button[data-tab="${previous}"]`)?.click()}catch(e){capture.push('Restauración: '+e.message)}
  if(overlay?.classList.contains('open'))document.getElementById('closePanel')?.click();
  if(wasOpen&&qa)qa.hidden=false;
  window.removeEventListener('error',onError);
  window.removeEventListener('unhandledrejection',onRejection);
 }
 return {at:new Date().toISOString(),checks,passed:checks.filter(x=>x.ok).length,total:checks.length,errors:capture,
  note:'Prueba de navegación y renderizado DOM. No verifica mapas meteorológicos, conectividad, ni compatibilidad completa con Safari.'};
}
