import {installQaPanel} from './qa/panel.js';
import {installRuntimeMonitor} from './qa/runtime.js';
import {events} from './core/eventBus.js';
import {getState,setState} from './core/state.js';
import {installDiagnostics} from './core/diagnostics.js';
/** Adaptador no invasivo: mantiene el comportamiento 3.9.9 durante la migración. */
function boot(){
 document.addEventListener('vs:weather:updated',e=>{setState({weatherUpdatedAt:e.detail.savedAt,weatherError:null});events.emit('weather:updated',e.detail)});
 document.addEventListener('vs:weather:error',e=>{setState({weatherError:e.detail.message});events.emit('weather:error',e.detail)});
 const map=window.vsLeafletMap;
 if(map){setState({mapZoom:map.getZoom()});map.on('zoomend',()=>{const zoom=map.getZoom();setState({mapZoom:zoom});events.emit('map:zoom',{zoom})});map.on('moveend',()=>events.emit('map:move',{bounds:map.getBounds().toBBoxString()}))}
 window.addEventListener('online',()=>{setState({online:true});events.emit('network:online')});
 window.addEventListener('offline',()=>{setState({online:false});events.emit('network:offline')});
 document.addEventListener('visibilitychange',()=>setState({visible:!document.hidden}));
 // Exposición controlada para diagnóstico de la migración, sin modificar datos ni cálculos.
 window.VeraSetas4=Object.freeze({version:'4.0.0-beta.22',events,getState,diagnostics:installDiagnostics({events,getState})});
 window.VeraSetasRuntime=installRuntimeMonitor();
 window.VeraSetasQA=Object.freeze(installQaPanel());
 events.emit('app:ready',getState());
}
boot();
