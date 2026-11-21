// Execute the actual legacy season wrapper in a controlled VM context.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/legacy/part-18.js'),'utf8');
function run(levels, raw, offset=0){
 const detail={appendChild(x){this.child=x}};
 const context={gridScore:()=>raw,CAT_SPECIES:[{scientific:'Boletus edulis',levels}],species:[{name:'Boletus edulis',short:'Boleto'}],selected:0,dateOffset:offset,tab:'pred',showGridDetail:()=>{},document:{getElementById:()=>detail,createElement:()=>({})},window:{},Date};
 vm.createContext(context);vm.runInContext(source,context);
 return {score:context.gridScore({}),context,detail};
}
const month=new Date().getMonth();
for(const [level,cap] of [[0,20],[1,45],[2,75],[3,100]]){
 const levels=Array(12).fill(level);
 assert.equal(run(levels,92).score,Math.min(92,cap));
 assert.equal(run(levels,12).score,12);
}
assert.equal(run(Array(12).fill(0),null).score,null);
assert.equal(run(Array(12).fill(0),NaN).score,null);
assert.equal(run(Array(12).fill(9),80).score,80,'invalid catalog level must not change score');
assert.equal(run(Array(12).fill(-1),80).score,80);
assert.equal(run(Array(12).fill(2),80).context.selected,0);
const levels=Array(12).fill(3);levels[month]=0;
assert.equal(run(levels,90).score,20);
const nextMonth=(month+1)%12;levels[nextMonth]=1;
const now=new Date();const future=new Date(now);future.setMonth(future.getMonth()+1);const offset=Math.round((future-now)/86400000);
assert.equal(run(levels,90,offset).score,45,'future forecast uses future month');
console.log('Season behavior: caps, invalid catalog values, missing scores, forecast month OK');
