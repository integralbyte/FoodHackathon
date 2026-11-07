import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const script=await readFile(new URL('../src/journey.js',import.meta.url),'utf8');
function setup({initial=0,reduced=false}={}){
 const element=()=>({style:{setProperty(k,v){this[k]=v}},attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{values:new Set(),toggle(k,on){on?this.values.add(k):this.values.delete(k)}}});
 const root=element(),shelf=element(),assembly=element(),overlay=element(),source=element(),svg=element(),pin=element();
 const sourceRect={left:530,top:250,width:380,height:480};
 source.getBoundingClientRect=()=>sourceRect;
 svg.getScreenCTM=()=>({a:1.5,b:0,c:0,d:1.5,e:40,f:-600});
 pin.getBoundingClientRect=()=>({left:0,top:0});
 root.querySelector=()=>pin;shelf.querySelector=()=>source;
 let scroll=initial*9900,id=0,observer;const frames=new Map(),events={};
 root.offsetHeight=10800;root.getBoundingClientRect=()=>({top:-scroll,bottom:10800-scroll});
 const nodes={'product-journey':root,'noodle-shelf':shelf,'cup-story':assembly,'journey-transfer-cup':overlay,'assembly-art':svg};
 const document={hidden:false,getElementById:id=>nodes[id],addEventListener(){}};
 const window={innerHeight:900,get scrollY(){return scroll},scrollTo({top}){scroll=top;(events.scroll||[]).forEach(fn=>fn())},addEventListener(k,fn){(events[k]??=[]).push(fn)}};
 const media={matches:reduced,addEventListener(){}};
 runInNewContext(script,{window,document,matchMedia:()=>media,performance:{now:()=>0},requestAnimationFrame:fn=>{frames.set(++id,fn);return id},IntersectionObserver:class{constructor(fn){observer=fn}observe(){observer([{isIntersecting:true}])}}});
 const flush=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(0))};flush();
 return {root,shelf,assembly,overlay,sourceRect,flow:root.soramiFlow,go(p){root.soramiFlow.seek(p);flush()},flush,events,media,offscreen(){observer([{isIntersecting:false}])},get pending(){return frames.size}};
}
test('the shelf finishes before the reverse assembly starts',()=>{
 const a=setup();a.go(.23);assert.equal(a.flow.sample().shelf,.5);assert.equal(a.flow.sample().reverse,0);
 a.go(.5);assert.equal(a.flow.sample().shelf,1);assert.equal(a.flow.sample().reverse,0);assert.equal(a.shelf.inert,true);assert.equal(a.assembly.inert,true);
 a.go(.54);assert.equal(a.flow.sample().reverse,0);assert.equal(a.assembly.inert,false);assert.equal(a.shelf.style.visibility,'hidden');
 a.go(.97);assert.equal(a.flow.sample().reverse,1);a.go(.3);assert.equal(a.flow.sample().reverse,0);assert.equal(a.shelf.inert,false);
});
test('one shared cup matches both measured handoff endpoints',()=>{
 const a=setup();a.go(.4600001);assert.ok(Math.abs(parseFloat(a.overlay.style.width)-a.sourceRect.width)<.001);assert.ok(Math.abs(parseFloat(a.overlay.style.height)-a.sourceRect.height)<.001);
 assert.ok(a.root.classList.values.has('is-transferring'));
 a.go(.5399999);assert.ok(Math.abs(parseFloat(a.overlay.style.width)-407.5*1.5)<.001);assert.ok(Math.abs(parseFloat(a.overlay.style.height)-472.5*1.5)<.001);
 a.go(.54);assert.ok(!a.root.classList.values.has('is-transferring'));assert.equal(a.root.style['--journey-assembly'],'1');
});
test('restored progress, reduced motion and offscreen suspension remain usable',()=>{
 const a=setup({initial:.755,reduced:true});assert.ok(Math.abs(a.flow.sample().reverse-.5)<1e-9);assert.equal(a.flow.sample().reduced,true);
 a.go(.5);assert.equal(a.root.style['--journey-transfer'],'1');
 a.go(0);assert.equal(a.root.style['--journey-transfer'],'0');
 a.offscreen();a.flow.seek(.9);assert.equal(a.pending,0);
});
