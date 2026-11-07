import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {firstFailure} from './shelf-rules.mjs';

const read = name => readFile(new URL(`../src/${name}`,import.meta.url),'utf8');
const products = JSON.parse(await read('shelf-products.json'));
const rules = JSON.parse(await read('shelf-config.json'));
assert.equal(products.length,21);
assert.equal(new Set(products.map(p=>p.id)).size,21);
const assumed=p=>firstFailure(p,rules,{includeAssumptions:true});
const remaining = [0,1,2,3,4].map(stage=>products.filter(p=>!assumed(p)||assumed(p)>stage));
const verified = [0,1,2,3,4].map(stage=>products.filter(p=>!firstFailure(p,rules)||firstFailure(p,rules)>stage));
assert.deepEqual(verified.map(list=>list.length),[21,11,8,5,5]);
assert.deepEqual(remaining.map(list=>list.length),[21,11,8,5,1]);
assert.deepEqual(remaining[3].map(p=>p.id),['immi-chicken','soba-classic','sorami','soba-chilli','immi-pork']);
assert.equal(remaining[4][0].id,'sorami');
for(const p of products){
 if(p.id==='sorami') continue;
 assert.ok(p.source.startsWith('https://'),`${p.id} needs a nutrition source`);
 assert.ok(p.illustration||p.imageSource?.startsWith('https://'),`${p.id} needs artwork provenance`);
 if(assumed(p)===4){assert.equal(p.nonfried,null);assert.equal(p.demoAssumedDeepFried,true);assert.ok(p.assumptionNote.includes('not been verified'));}
 if(p.saltGrams) assert.equal(p.sodium,Math.round(p.saltGrams/2.5*1000));
}
const matching={protein:11,sodium:400,fibre:6.5,nonfried:true};
assert.equal(firstFailure(matching,rules),0);
assert.equal(firstFailure({...matching,protein:9.9},rules),1);
assert.equal(firstFailure({...matching,sodium:900},rules),2);
assert.equal(firstFailure({...matching,fibre:5.9},rules),3);
assert.equal(firstFailure({...matching,nonfried:false},rules),4);
assert.equal(firstFailure({...matching,nonfried:null,demoAssumedDeepFried:true},rules),0,'Unknown frying is retained when using only confirmed data.');
assert.equal(firstFailure({...matching,nonfried:null,demoAssumedDeepFried:true},rules,{includeAssumptions:true}),4);
assert.equal(firstFailure({...matching,demoAssumedDeepFried:true},rules,{includeAssumptions:true}),0,'A known non-fried process overrides a demo assumption.');
console.log('PASS: shelf 21 → 11 → 8 → 5 → 1; confirmed-data ending retains 5; sources, salt conversion, boundaries, and explicit assumptions.');
