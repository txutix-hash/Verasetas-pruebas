
/* Flora v1.1: multi-select on partial OSM mapping, no invented official forestry/pH coverage. */
const FLORA_GROUPS=[
 ['pino','Pinos','#61a5d7',['Pino silvestre','Pino carrasco','Pino resinero','Pino piñonero','Otros pinos']],
 ['roble','Robles','#54b46b',['Rebollo','Roble común','Quejigo','Otros robles']],
 ['encina','Encinas','#9caa52',['Encina']],
 ['haya','Hayas','#83b6a3',['Haya']],
 ['castano','Castaños','#e7a257',['Castaño']],
 ['abedul','Abedules','#b1d9cb',['Abedul']],
 ['alcornoque','Alcornoques','#b3a16b',['Alcornoque']],
 ['pradera','Praderas','#c0d276',['Pastizales','Prados','Herbazales']],
 ['abeto','Abetos','#527b85',['Abeto blanco','Pinsapo']],
 ['jaral','Jarales','#b39b7c',['Jaras','Matorral de jara']],
 ['eucalipto','Eucaliptos','#78a5a0',['Eucalipto']],
 ['ribera','Ribera','#58c7c2',['Chopo','Álamo','Sauce','Aliso','Fresno']],
 ['sabina','Sabinares','#8c9e91',['Sabina albar','Sabina mora']]
];
const floraSelection=new Map(FLORA_GROUPS.map(([k,, ,sp])=>[k,new Set(sp)]));
let floraActive=new Set(['pino','roble','encina','castano']);
const floraDetail=f=>String(f.properties.detail||'').toLowerCase();
function floraKind(f){let k=f.properties.kind,txt=floraDetail(f);
 if(/eucalyptus|eucalipt/.test(txt))return 'eucalipto';
 if(/betula|abedul/.test(txt))return 'abedul';
 if(/fagus sylvatica|haya|hayed/.test(txt))return 'haya';
 if(/abies|pinsapo|abeto/.test(txt))return 'abeto';
 if(/quercus suber|alcornoque/.test(txt))return 'alcornoque';
 if(/populus|salix|alnus|fraxinus|chopo|álamo|sauce|aliso|fresno/.test(txt))return 'ribera';
 if(/juniperus|sabina/.test(txt))return 'sabina';
 return k==='otro'?null:k;
}
function floraSpecies(f,k){let t=floraDetail(f);
 const patterns={pino:[[/sylvestris|silvestre/,'Pino silvestre'],[/halepensis|carrasco/,'Pino carrasco'],[/pinaster|resinero/,'Pino resinero'],[/pinea|piñonero/,'Pino piñonero']],roble:[[/pyrenaica|rebollo/,'Rebollo'],[/robur|roble común/,'Roble común'],[/faginea|quejigo/,'Quejigo']],ribera:[[/populus nigra|chopo/,'Chopo'],[/populus alba|álamo/,'Álamo'],[/salix|sauce/,'Sauce'],[/alnus|aliso/,'Aliso'],[/fraxinus|fresno/,'Fresno']]};
 const match=(patterns[k]||[]).find(([re])=>re.test(t));if(match)return match[1];
 const fallback={pino:'Otros pinos',roble:'Otros robles',encina:'Encina',castano:'Castaño',haya:'Haya',abedul:'Abedul',alcornoque:'Alcornoque',eucalipto:'Eucalipto',abeto:'Abeto blanco',sabina:'Sabina albar'};
 return fallback[k]||null;
}
function floraIncluded(f){let k=floraKind(f);if(!k||!floraActive.has(k))return false;let sp=floraSpecies(f,k);return sp&&floraSelection.get(k)?.has(sp)}
function drawFlora(){forestLayer.clearLayers();if(tab!=='flora'){map.removeLayer(forestLayer);return}if(!map.hasLayer(forestLayer))forestLayer.addTo(map);
 if(forestData)forestLayer.addData({type:'FeatureCollection',features:forestData.features.filter(floraIncluded).map(f=>({...f,properties:{...f.properties,kind:floraKind(f)}}))});
 let counts=FLORA_GROUPS.filter(([k])=>floraActive.has(k)).map(([k,name,color])=>`<span style="color:${color}">●</span> ${name}`);
 $('legend').innerHTML=`<b>FLORA · OSM parcial</b><div>${counts.join(' · ')||'Sin capas activas'}</div><small>Las masas sin especie identificable no se asignan a una clase.</small>`;
}
const oldFloraPanel=renderPanel;
renderPanel=function(){oldFloraPanel();if(tab!=='flora')return;
 $('panelBody').innerHTML=`<p class="muted">Arbolado identificado en OpenStreetMap, no cartografía forestal oficial. Cobertura parcial. Puedes encender varios tipos y desplegar sus especies; solo se dibujan las identificables.</p><h3>ARBOLADO</h3><div id="floraGroups"></div><button class="primary" id="loadForest">Cargar bosques de la zona visible</button><p class="notice" id="forestStatus">${esc(forestStatus)}</p><p class="muted">El pH necesita una capa georreferenciada y no se representa sin datos reales.</p>`;
 const wrap=$('floraGroups');wrap.innerHTML=FLORA_GROUPS.map(([k,name,color,sp])=>`<div class="flora-group"><div class="flora-row"><input type="checkbox" data-group="${k}" ${floraActive.has(k)?'checked':''}><span class="flora-dot" style="background:${color}"></span><details style="flex:1"><summary>${name} <small id="status-${k}"></small></summary><div class="flora-sub">${sp.map((s,i)=>`<label><input type="checkbox" data-specgroup="${k}" data-specindex="${i}" ${floraSelection.get(k).has(s)?'checked':''}> ${s}</label>`).join('')}</div></details></div></div>`).join('');
 function status(){for(let [k,,,sp] of FLORA_GROUPS){let n=floraSelection.get(k).size;$('status-'+k).textContent=!floraActive.has(k)?'○':n===sp.length?'●':n?'◐':'○'}}
 wrap.querySelectorAll('[data-group]').forEach(el=>el.onchange=()=>{el.checked?floraActive.add(el.dataset.group):floraActive.delete(el.dataset.group);status();drawFlora()});
 wrap.querySelectorAll('[data-specgroup]').forEach(el=>el.onchange=()=>{let k=el.dataset.specgroup,s=FLORA_GROUPS.find(x=>x[0]===k)[3][+el.dataset.specindex];el.checked?floraSelection.get(k).add(s):floraSelection.get(k).delete(s);if(el.checked)floraActive.add(k);wrap.querySelector(`[data-group="${k}"]`).checked=floraActive.has(k);status();drawFlora()});
 $('loadForest').onclick=async()=>{await loadForests();drawFlora()};status();
};
/* Flora map update is now coordinated in part-08 to avoid a renderMap override. */
/* loadForests already calls renderMap() on success, which updates Flora.
   Avoid wrapping this async function: preserve its boolean result and errors. */
$('phFold').onclick=()=>{$('phControls').classList.toggle('hidden');$('phFold').textContent=$('phControls').classList.contains('hidden')?'▸':'▾'};
function updatePh(){let a=+$('phMin').value,b=+$('phMax').value;if(a>b){if(document.activeElement===$('phMin'))$('phMax').value=a;else $('phMin').value=b;a=+$('phMin').value;b=+$('phMax').value} $('phRange').textContent=a.toFixed(1).replace('.',',')+'–'+b.toFixed(1).replace('.',',');$('phMessage').textContent=$('phEnabled').checked?'Filtro solicitado, pero sin datos de pH superficial (0–5 cm). No se pintan zonas inventadas.':'Filtro desactivado. Sin capa de pH disponible.'}
['phMin','phMax'].forEach(id=>$(id).oninput=updatePh);$('phEnabled').onchange=updatePh;updatePh();
/* Retain habitat navigation from catalog: select one layer rather than reset all. */
const oldCatalogGoMap=catalogGoMap;
catalogGoMap=function(type,value){if(type==='flora'&&value){floraActive=new Set([value]);if(!floraSelection.has(value)){floraActive.clear()}forestFilter=value;setTab('flora');if(!forestData)loadForests();return}oldCatalogGoMap(type,value)};
