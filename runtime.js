/** Observador de fallos de la Beta 3. No modifica el motor de predicción. */
export function installRuntimeMonitor(){
 const entries=[];const max=30;
 function add(type,message){entries.push({at:new Date().toISOString(),type,message:String(message).slice(0,500)});if(entries.length>max)entries.shift()}
 window.addEventListener('error',e=>add('javascript',e.message||'Error no identificado'));
 window.addEventListener('unhandledrejection',e=>add('promesa',e.reason?.message||e.reason||'Rechazo no identificado'));
 return Object.freeze({get errors(){return entries.slice()},clear(){entries.length=0}});
}
