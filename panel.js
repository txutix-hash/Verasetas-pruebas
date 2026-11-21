import {runFunctionalChecks} from './functional.js';
import {runSmokeChecks} from './smoke.js';
/** Panel opcional para detectar fallos desde Safari sin alterar los datos. */
export function installQaPanel(){
 const btn=document.createElement('button');btn.id='vsQaToggle';btn.type='button';btn.textContent='Diagnóstico';
 btn.setAttribute('aria-label','Abrir diagnóstico de VeraSetas');
 btn.style.cssText='position:fixed;bottom:80px;left:10px;z-index:1250;padding:8px 10px;font-size:12px;background:#173c2c;color:white;border:1px solid #9dbb9f;border-radius:9px';
 const panel=document.createElement('section');panel.id='vsQaPanel';panel.hidden=true;
 panel.style.cssText='position:fixed;left:10px;bottom:125px;z-index:1251;max-width:min(390px,calc(100vw - 20px));max-height:65vh;overflow:auto;background:#102b22;color:#f2f8f2;border:1px solid #9dbb9f;border-radius:12px;padding:14px;box-shadow:0 5px 20px #0009;font:13px system-ui';
 function render(){const r=runSmokeChecks();panel.replaceChildren();const title=document.createElement('h3');title.textContent=`Diagnóstico · ${r.passed}/${r.total} comprobaciones`;panel.append(title);
 const status=document.createElement('p');status.textContent=r.weather.cooldownUntil>Date.now()?'Open-Meteo: espera por límite 429 hasta '+new Date(r.weather.cooldownUntil).toLocaleString('es-ES'):r.weather.cachedAt?'Datos guardados: '+new Date(r.weather.cachedAt).toLocaleString('es-ES'):'Sin datos meteorológicos guardados';panel.append(status);
 const list=document.createElement('ul');list.style.paddingLeft='18px';for(const c of r.checks){const li=document.createElement('li');li.textContent=(c.ok?'✓ ':'✗ ')+c.name;li.style.color=c.ok?'#c8e59d':'#ffb0a0';list.append(li)}panel.append(list);
 const runtime=window.VeraSetasRuntime?.errors||[];const failures=document.createElement('p');failures.textContent='Errores recientes: '+runtime.length+' (JavaScript y promesas)';panel.append(failures);
 const note=document.createElement('p');note.textContent=r.note;note.style.fontSize='11px';panel.append(note);
 const refresh=document.createElement('button');refresh.textContent='Repetir comprobación';refresh.onclick=render;panel.append(refresh);
 const functional=document.createElement('button');functional.textContent='Probar las 6 pestañas';functional.style.marginLeft='7px';
 functional.onclick=async()=>{functional.disabled=true;functional.textContent='Comprobando…';
  try{const result=await runFunctionalChecks();window.VeraSetasLastFunctionalTest=result;
   const message=document.createElement('p');message.textContent=`Navegación: ${result.passed}/${result.total} pestañas · ${result.errors.length} errores capturados`;
   message.style.color=result.passed===result.total&&!result.errors.length?'#c8e59d':'#ffb0a0';
   panel.append(message);
   for(const check of result.checks){const line=document.createElement('p');line.textContent=(check.ok?'✓ ':'✗ ')+check.name+(check.ok?'':' · '+check.detail);panel.append(line)}
  }catch(err){const msg=document.createElement('p');msg.textContent='Error de prueba: '+err.message;panel.append(msg)}
  finally{functional.disabled=false;functional.textContent='Probar las 6 pestañas'}
 };panel.append(functional);
 const copy=document.createElement('button');copy.textContent='Copiar informe';copy.style.marginLeft='7px';copy.onclick=()=>{const report=JSON.stringify({...r,runtimeErrors:window.VeraSetasRuntime?.errors||[],functional:window.VeraSetasLastFunctionalTest||null},null,2);if(navigator.clipboard?.writeText)navigator.clipboard.writeText(report).catch(()=>window.prompt('Copia este informe:',report));else window.prompt('Copia este informe:',report)};panel.append(copy);
 }
 btn.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden)render()};document.body.append(btn,panel);
 return {run:runSmokeChecks};
}
