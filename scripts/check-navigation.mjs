import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../src/navigation.js',import.meta.url),'utf8');
function setup({reduced=false}={}){
 let now=0,scrollY=0,id=0,editing=false,modal=false;
 const frames=new Map(),events=new Map(),history=[];
 const on=(name,fn)=>{if(!events.has(name))events.set(name,[]);events.get(name).push(fn)};
 const emit=(name,event={})=>{for(const fn of events.get(name)||[])fn(event)};
 const research={steps:10,stopAt:i=>(i===2||i===4?i+.7:i+.8)/10};
 const journey={offsetHeight:13000,getBoundingClientRect:()=>({top:1000-scrollY}),soramiFlow:{phases:{shelfEnd:.39,transferEnd:.46,reverseEnd:.82,factsEnd:.96}}};
 const nodes={
  'product-journey':journey,'noodle-shelf':{shelfScene:{stops:[0,.28,.46,.63,.80,.98]}},
  'cup-story':{assemblyScene:{stops:[0,1.61/4.4,2.48/4.4,3.15/4.4,1]}},
  'pitch-story':{pitchScene:{research,count:11,targetTop:value=>14000+(value<1?value*8:8+value-1)/18*22000}},
  'pitch-chapters':{hidden:false},'pitch-chapters-toggle':{setAttribute(){}}
 };
 const document={hidden:false,getElementById:id=>nodes[id],querySelector:()=>modal?{}:null,activeElement:{closest:()=>editing?{}:null},addEventListener:on,dispatchEvent:e=>emit(e.type,e)};
 const window={innerHeight:1000,get scrollY(){return scrollY},scrollTo({top,behavior}){assert.equal(behavior,'instant');scrollY=top;history.push({now,top});emit('scroll')},addEventListener:on};
 const media={matches:reduced,addEventListener:(_,fn)=>on('motion',fn)};
 vm.runInNewContext(source,{document,window,performance:{now:()=>now},CustomEvent:class{constructor(type){this.type=type}},matchMedia:()=>media,requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:i=>frames.delete(i)});
 const nav=window.soramiNavigation;
 function time(ms){const end=now+ms;while(now<end){now=Math.min(end,now+16);const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now))}}
 function settle(){for(let i=0;i<1500&&nav.active;i++)time(16);assert.equal(nav.active,false,'navigation completes instead of leaving an endless frame loop')}
 function key(key,more={}){const e={key,repeat:false,preventDefault(){this.defaultPrevented=true},...more};emit('keydown',e);return e}
 function place(id){nav.cancel();scrollY=nav.stops.find(s=>s.id===id).top();emit('scroll')}
 return {nav,window,history,place,time,settle,key,emit,document,media,set editing(on){editing=on},set modal(on){modal=on}};
}
test('arrow keys traverse every stop from the shelf ending into the cup, grains, research and closing, then back',()=>{
 const a=setup();assert.equal(a.nav.stops.length,33);
 for(const stop of a.nav.stops.slice(1)){a.key('ArrowRight');a.settle();assert.ok(Math.abs(a.window.scrollY-stop.top())<.01,stop.id)}
 const end=a.window.scrollY;a.key('ArrowRight');a.settle();assert.equal(a.window.scrollY,end);
 for(const stop of a.nav.stops.slice(0,-1).reverse()){a.key('ArrowLeft');a.settle();assert.ok(Math.abs(a.window.scrollY-stop.top())<.01,stop.id)}
 a.key('ArrowLeft');assert.equal(a.window.scrollY,0);
});
test('the hero zoom, noodle untangling and nutrition zoom stay slow while all other arrow transitions finish within a second',()=>{
 const a=setup();
 for(const [from,to,duration] of [['shelf-4','shelf-5',3200],['shelf-5','cup-finished',3600],['research-1','research-2',5600],['research-2','research-1',5600],['cup-reverse-2','grains',6800]]){
  a.place(from);const start=a.window.scrollY,end=a.nav.stops.find(s=>s.id===to).top();
  a.key(end>start?'ArrowRight':'ArrowLeft');a.time(duration/2);
  assert.equal(a.nav.active,true);assert.ok(Math.abs(a.window.scrollY-(start+end)/2)<.01,'a linear scroll playhead lets the artwork apply its own easing');
  a.time(duration/2);assert.equal(a.nav.active,false);assert.ok(Math.abs(a.window.scrollY-end)<.01);
 }
 const slow=new Set(['shelf-5','cup-finished','grains','research-2']);
 for(let i=1;i<a.nav.stops.length;i++){
  const stop=a.nav.stops[i];if(slow.has(stop.id))continue;
  a.place(a.nav.stops[i-1].id);a.key('ArrowRight');a.time(1000);
  assert.equal(a.nav.active,false,`${stop.id} should finish quickly`);assert.ok(Math.abs(a.window.scrollY-stop.top())<.01);
 }
});
test('a second forward press queues the following animation without skipping the current filter; key repeats do not add stages',()=>{
 const a=setup();a.place('shelf-0');a.key('ArrowRight');a.time(250);a.key('ArrowRight');
 for(let i=0;i<8;i++)a.key('ArrowRight',{repeat:true});
 a.time(650);assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-1').top());
 a.time(64);assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-1').top(),'the completed stage briefly holds before the next filter');
 a.settle();assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-2').top());
});
test('reversing direction works during a transition, and manual input cancels all pending movement',()=>{
 const a=setup();a.place('shelf-1');const start=a.window.scrollY;a.key('ArrowRight');a.time(450);assert.ok(a.window.scrollY>start);a.key('ArrowLeft');a.settle();assert.equal(a.window.scrollY,start);
 for(const event of ['wheel','touchstart','pointerdown','resize']){a.key('ArrowRight');a.time(300);a.key('ArrowRight');a.emit(event);const stopped=a.window.scrollY;a.time(20000);assert.equal(a.nav.active,false);assert.equal(a.window.scrollY,stopped,event)}
 a.key('ArrowRight');a.time(300);a.window.scrollTo({top:a.window.scrollY+200,behavior:'instant'});const manual=a.window.scrollY;a.time(20000);assert.equal(a.window.scrollY,manual,'scrollbar changes also cancel the timed movement');
});
test('open dialogs, form fields and modifier shortcuts retain their keys; reduced motion jumps to complete stops',()=>{
 const a=setup();a.editing=true;assert.notEqual(a.key('ArrowRight').defaultPrevented,true);assert.equal(a.nav.active,false);a.editing=false;
 a.modal=true;assert.notEqual(a.key('ArrowRight').defaultPrevented,true);a.modal=false;
 for(const modifier of ['altKey','ctrlKey','metaKey','shiftKey'])assert.notEqual(a.key('ArrowRight',{[modifier]:true}).defaultPrevented,true);
 for(const key of ['Escape','Tab','Enter',' ']){a.key('ArrowRight');a.time(200);a.key(key);assert.equal(a.nav.active,false)}
 a.key('ArrowRight');a.time(200);a.modal=true;assert.notEqual(a.key('ArrowRight').defaultPrevented,true);assert.equal(a.nav.active,false);
 const b=setup({reduced:true});b.place('shelf-5');b.key('ArrowRight');assert.equal(b.nav.active,false);assert.equal(b.window.scrollY,b.nav.stops.find(s=>s.id==='cup-finished').top());
});
