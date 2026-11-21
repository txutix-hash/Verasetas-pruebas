const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/legacy/part-19.js'),'utf8');
let selected=0,dateOffset=0,tab='pred',draws=0,scoreCalls=0;
const species=[{name:'Especie A',short:'A'},{name:'Especie B',short:'B'}];
const cell={bounds:[[40,-6],[41,-5]]};
const labels=[];
const legend={innerHTML:''};
const modeSelect={value:'mine',onchange:null};
const control={id:null,style:{},innerHTML:'',querySelector(){return modeSelect}};
const wrap={appendChild(x){this.control=x}};
const document={
 createElement(tag){if(tag==='div')return control;return {className:'',textContent:'',appendChild(){}}},
 getElementById(id){return id==='mapWrap'?wrap:id==='legend'?legend:null}
};
const map={getZoom(){return 11},getBounds(){return {pad(){return {getNorth(){return 42},getSouth(){return 39},getEast(){return -4},getWest(){return -7}}}}},on(){}};
const L={layerGroup(){return {addTo(){return this},clearLayers(){labels.length=0}}},marker(_pos,opts){return {addTo(){labels.push(opts.icon.html)}}},divIcon(o){return o}};
const ctx={document,map,L,gridCells:[cell],species,tab,selected,dateOffset,esc:x=>x,
 gridScore(c){scoreCalls++;return ctx.dateOffset===2?null:(ctx.selected===0?40:70)+ctx.dateOffset},
 gridDraw(){draws++;legend.innerHTML='🍄 '+species[ctx.selected].short+' · día';},
 showGridDetail(){},cellFor(){return cell}};
vm.createContext(ctx);vm.runInContext(source,ctx);
function check(label,score,name){assert.equal(ctx.gridScore(cell),score,label+' score');assert.match(labels.at(-1),new RegExp(name),label+' label');if(score===null)assert.match(labels.at(-1),/Sin datos/);else assert.match(labels.at(-1),new RegExp(score+'%'),label+' percentage')}
ctx.gridDraw();check('mi especie inicial',40,'A');
modeSelect.value='all';modeSelect.onchange();check('todas',70,'B');assert.match(legend.innerHTML,/Todas las setas/);assert.doesNotMatch(legend.innerHTML,/🍄 A ·/);
ctx.selected=1;ctx.gridDraw();check('cambio especie en todas',70,'B');
modeSelect.value='mine';modeSelect.onchange();check('mi especie B',70,'B');
ctx.dateOffset=1;ctx.gridDraw();check('fecha posterior',71,'B');
ctx.selected=0;ctx.gridDraw();check('especie A y fecha posterior',41,'A');
ctx.dateOffset=2;ctx.gridDraw();check('datos ausentes',null,'Sin datos');
assert.ok(draws>=7);assert.ok(scoreCalls>0);
console.log('Beta 16: 7 escenarios de comportamiento de Predicción correctos');
