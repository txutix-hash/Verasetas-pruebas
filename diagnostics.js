/** Diagnóstico de solo lectura: nunca modifica el cálculo ni provoca peticiones. */
export function installDiagnostics({events,getState}){
 const recent=[];
 const record=(type,detail)=>{recent.push({type,at:new Date().toISOString(),detail});if(recent.length>30)recent.shift()};
 for(const type of ['weather:updated','weather:error','map:zoom','network:online','network:offline'])events.on(type,detail=>record(type,detail));
 return Object.freeze({snapshot(){const state=getState();return {version:'4.0.0-beta.1',state:{...state},events:recent.map(e=>({...e})),leafletLoaded:!!window.vsLeafletMap,gridLoaded:typeof window.vsGridLoaded==='number'?window.vsGridLoaded:null}}});
}
