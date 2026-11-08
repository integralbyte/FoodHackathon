import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calculateLaunchModel} from '../src/cost-model.mjs';
const input=JSON.parse(await readFile(new URL('../src/launch.json',import.meta.url),'utf8'));
const model=calculateLaunchModel(input),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);
test('one-flavour costs reconcile to the workbook with only changeover and extra-flavour tests removed',()=>{
 near(model.pilot.cost,1.91211241333333-750/50000-240/50000);
 near(model.scale.cost,.776680768205128-500/100000-200/100000);
 for(const key of ['pilot','scale'])near(model[key].breakdown.reduce((s,[,v])=>s+v,0),model[key].cost);
 assert.equal(model.pilot.cost.toFixed(2),'1.89');assert.equal(model.scale.cost.toFixed(2),'0.77');
});
test('price split applies channel deductions in sequence and separates gross profit from overhead',()=>{
 near(model.pilot.net,3.49*.97);near(model.retailNet,3.49*.7*.87*.82);
 for(const key of ['pilot','scale'])near(model[key].cost+model[key].fees+model[key].gross,3.49);
 assert.equal(model.pilot.gross.toFixed(2),'1.49');assert.equal(model.scale.gross.toFixed(2),'0.97');
 assert.ok(model.retailNet-model.pilot.cost<0,'retail is loss-making at pilot cost');
});
test('launch cash includes the entire first run while sales and pantry cups reconcile to remaining inventory',()=>{
 assert.equal(model.sold,6840);assert.equal(model.used,7682);assert.equal(model.stock,42318);
 assert.equal(model.months.reduce((s,m)=>s+m.donated,0),342);
 near(model.launchCash,model.pilot.cost*50000+30400+1500);
 assert.equal((model.launchCash/1000).toFixed(1),'126.5');
 near(model.operating,21383.40944-model.pilot.cost*7682-30400-8000);
 assert.ok(model.operating<0,'launch is not presented as profitable');
});
test('a more expensive co-packer quote flows into cash, margins and pantry funding',()=>{
 const changed=structuredClone(input);changed.pilot.spicyGarlicCostSharedRun+=.1;changed.pilot.processing+=.1;
 const next=calculateLaunchModel(changed);
 near(next.launchCash-model.launchCash,5000);near(model.pilot.gross-next.pilot.gross,.1);near(next.pilot.pantry-model.pilot.pantry,.005);
});
