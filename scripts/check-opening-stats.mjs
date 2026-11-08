import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleOpeningHandoff} from '../src/opening-handoff.mjs';
const script=await readFile(new URL('../src/opening-stats.js',import.meta.url),'utf8');
function setup({reduced=false,inView=true}={}){
 const frames=new Map(),events={},motionEvents=[];let next=0,now=0,observer,scrollTarget;
 const element=()=>({dataset:{},style:{setProperty(k,v){this[k]=v}},listeners:{},addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)},fire(k,e={}){for(const fn of this.listeners[k]||[])fn(e)},focus(){}});
 const root=element(),values=[72,1044,61,52,4,3.9,40].map((n,i)=>Object.assign(element(),{dataset:{openingCount:String(n),openingDecimals:i===5?'1':'0'}}));
 root.querySelectorAll=()=>values;root.getBoundingClientRect=()=>({top:inView?0:1200,bottom:inView?900:2100});
 const nodes={'market-opening':root};for(const id of ['opening-sources','opening-sources-open','opening-sources-close','opening-explore','product-journey'])nodes[id]=element();
 nodes['opening-sources'].showModal=function(){this.open=true};nodes['opening-sources'].close=function(){this.open=false;this.fire('close')};
 nodes['product-journey'].getBoundingClientRect=()=>({top:763});
 const document={hidden:false,getElementById:id=>nodes[id],addEventListener(k,fn){(events[k]??=[]).push(fn)}};
 const media={matches:reduced,addEventListener(k,fn){motionEvents.push(fn)}};
 runInNewContext(script,{document,window:{innerHeight:900,scrollY:137,scrollTo(v){scrollTarget=v}},matchMedia:()=>media,requestAnimationFrame:fn=>{frames.set(++next,fn);return next},cancelAnimationFrame:id=>frames.delete(id),IntersectionObserver:class{constructor(fn){observer=fn}observe(){}}});
 return {root,values,media,nodes,get pending(){return frames.size},get scrollTarget(){return scrollTarget},flush(ms){now=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now))},view(on){observer([{isIntersecting:on}])},hide(on){document.hidden=on;for(const fn of events.visibilitychange||[])fn()},reduce(){media.matches=true;motionEvents.forEach(fn=>fn())}};
}
const final=['72','1,044','61','52','4','3.9','40'];
test('count-up starts on the first visible frame and finishes at every requested value',()=>{
 const a=setup();assert.equal(a.pending,1);a.flush(0);assert.deepEqual(a.values.map(v=>v.textContent),['0','0','0','0','0','0.0','0']);
 a.flush(800);assert.ok(+a.values[0].textContent>0&&+a.values[0].textContent<72);assert.notEqual(a.values[1].textContent,'1,044');
 a.flush(2700);assert.deepEqual(a.values.map(v=>v.textContent),final);assert.equal(a.root.dataset.countComplete,'true');assert.equal(a.pending,0);
});
test('reduced motion shows complete figures immediately without scheduling animation',()=>{
 const a=setup({reduced:true});assert.deepEqual(a.values.map(v=>v.textContent),final);assert.equal(a.pending,0);
});
test('restored pages can enter later, and leaving the opening suspends animation',()=>{
 const a=setup({inView:false});assert.equal(a.pending,0);a.view(true);a.flush(0);a.flush(500);assert.ok(+a.values[0].textContent>0);a.view(false);assert.equal(a.pending,0);
 a.view(true);a.flush(4000);assert.deepEqual(a.values.map(v=>v.textContent),final);assert.equal(a.pending,0);
});
test('hidden tabs pause work, motion changes complete it, and the link lands at the shifted journey',()=>{
 const a=setup();a.flush(0);a.hide(true);assert.equal(a.pending,0);a.hide(false);assert.equal(a.pending,1);a.reduce();assert.deepEqual(a.values.map(v=>v.textContent),final);assert.equal(a.pending,0);
 a.nodes['opening-explore'].fire('click',{preventDefault(){}});assert.equal(a.scrollTarget.top,900);assert.equal(a.scrollTarget.behavior,'instant');
});
test('desktop handoff folds the cards in order, overlaps both scenes and ends at the shelf start',()=>{
 const first=sampleOpeningHandoff(0,900,900),middle=sampleOpeningHandoff(450,900,900),last=sampleOpeningHandoff(900,900,900);
 assert.equal(first.progress,0);assert.equal(first.introOpacity,1);assert.equal(first.shelfOpacity,0);assert.ok(first.cards.every(v=>v===0));
 assert.equal(middle.progress,.5);assert.ok(middle.introOpacity>0&&middle.shelfOpacity>0);assert.ok(middle.introOpacity+middle.shelfOpacity>1);assert.ok(middle.cards[0]>middle.cards[5]);
 for(let i=0;i<=100;i++){const f=sampleOpeningHandoff(i*9,900,900);assert.ok(f.introOpacity+f.shelfOpacity>=1-1e-9,'the handoff never reveals an empty frame')}
 assert.equal(last.progress,1);assert.equal(last.introOpacity,0);assert.equal(last.shelfOpacity,1);assert.equal(last.shelfScale,1);assert.ok(last.cards.every(v=>v===1));
});
test('a tall phone opening stays readable until its final row reaches the viewport',()=>{
 const before=sampleOpeningHandoff(270,1120,844),middle=sampleOpeningHandoff(698,1120,844),last=sampleOpeningHandoff(1120,1120,844);
 assert.equal(before.progress,0);assert.equal(before.introOpacity,1);assert.ok(before.cards.every(v=>v===0));
 assert.equal(middle.progress,.5);assert.equal(last.progress,1);assert.equal(last.shelfOpacity,1);
});
test('reduced motion uses complete scenes with no perspective or zoom phase',()=>{
 for(const progress of [0,.2,.49,.5,.8,1]){
  const state=sampleOpeningHandoff(progress*900,900,900,true),next=progress>=.5;
  assert.equal(state.introOpacity,next?0:1);assert.equal(state.shelfOpacity,next?1:0);assert.equal(state.imageScale,1);assert.equal(state.shelfScale,1);assert.ok(state.cards.every(v=>v===(next?1:0)));
 }
});
test('camera blend and fold progress remain continuous across their timing boundaries',()=>{
 for(const progress of [.02,.22,.27,.33,.46,.71,.90,.94]){
  const a=sampleOpeningHandoff((progress-1e-7)*900,900,900),b=sampleOpeningHandoff((progress+1e-7)*900,900,900);
  for(const key of ['introOpacity','shelfOpacity','imageScale','shelfScale'])assert.ok(Math.abs(a[key]-b[key])<1e-4);
  a.cards.forEach((v,i)=>assert.ok(Math.abs(v-b.cards[i])<1e-4));
 }
});
