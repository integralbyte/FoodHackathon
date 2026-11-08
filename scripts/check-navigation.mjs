import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {researchTourStops,sampleResearchCamera} from '../src/research-camera.mjs';
const source=await readFile(new URL('../src/navigation.js',import.meta.url),'utf8');
function setup({reduced=false,locked=false}={}){
 let now=0,scrollY=0,id=0,editing=false,modal=false;
 const frames=new Map(),events=new Map(),history=[];
 const on=(name,fn)=>{if(!events.has(name))events.set(name,[]);events.get(name).push(fn)};
 const emit=(name,event={})=>{for(const fn of events.get(name)||[])fn(event)};
 const research={steps:10,stopAt:i=>(researchTourStops[i]??i+.8)/10};
 const journey={offsetHeight:13000,getBoundingClientRect:()=>({top:1000-scrollY}),soramiFlow:{phases:{shelfEnd:.39,transferEnd:.46,reverseEnd:.82,factsEnd:.96}}};
 const nodes={
  'product-journey':journey,'noodle-shelf':{shelfScene:{stops:[0,.28,.46,.63,.80,.98]}},
  'cup-story':{assemblyScene:{stops:[0,1.61/4.4,2.48/4.4,3.15/4.4,1]}},
  'pitch-story':{pitchScene:{research,count:1,targetTop:value=>14000+value*9600}},
  'pitch-chapters':{hidden:false},'pitch-chapters-toggle':{setAttribute(){}}
 };
 const document={hidden:false,documentElement:{classList:{contains:()=>locked}},getElementById:id=>nodes[id],querySelector:()=>modal?{}:null,activeElement:{closest:()=>editing?{}:null},addEventListener:on,dispatchEvent:e=>emit(e.type,e)};
 const window={innerHeight:1000,get scrollY(){return scrollY},scrollTo({top,behavior}){assert.equal(behavior,'instant');scrollY=top;history.push({now,top});emit('scroll')},addEventListener:on};
 const media={matches:reduced,addEventListener:(_,fn)=>on('motion',fn)};
 vm.runInNewContext(source,{document,window,performance:{now:()=>now},CustomEvent:class{constructor(type){this.type=type}},matchMedia:()=>media,requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:i=>frames.delete(i)});
 const nav=window.soramiNavigation;
 function time(ms){const end=now+ms;while(now<end){now=Math.min(end,now+16);const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now))}}
 function settle(){for(let i=0;i<1500&&nav.active;i++)time(16);assert.equal(nav.active,false,'navigation completes instead of leaving an endless frame loop')}
 function key(key,more={}){const e={key,repeat:false,preventDefault(){this.defaultPrevented=true},...more};emit('keydown',e);return e}
 function place(id){nav.cancel();scrollY=nav.stops.find(s=>s.id===id).top();emit('scroll')}
 return {nav,window,history,place,time,settle,key,emit,document,media,set editing(on){editing=on},set modal(on){modal=on},set locked(on){locked=on}};
}
test('arrow keys traverse the shelf, cup, grains and research, ending at Beyond the cup, then return',()=>{
 const a=setup(),pauses=a.nav.stops.filter(s=>s.pause);assert.equal(a.nav.stops.length,24);assert.equal(pauses.length,18);assert.equal(pauses.at(-1).id,'research-9');
 for(const stop of pauses.slice(1)){a.key('ArrowRight');a.settle();assert.ok(Math.abs(a.window.scrollY-stop.top())<.01,stop.id)}
 const end=a.window.scrollY;a.key('ArrowRight');a.settle();assert.equal(a.window.scrollY,end);
 for(const stop of pauses.slice(0,-1).reverse()){a.key('ArrowLeft');a.settle();assert.ok(Math.abs(a.window.scrollY-stop.top())<.01,stop.id)}
 a.key('ArrowLeft');assert.equal(a.window.scrollY,0);
});
test('the opening logo gate blocks arrow navigation until it is clicked',()=>{
 const a=setup({locked:true});a.key('ArrowRight');a.time(3000);assert.equal(a.window.scrollY,0);assert.equal(a.nav.active,false);
 a.locked=false;a.key('ArrowRight');a.settle();assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-0').top());
});
test('the hero reveal, noodle untangling and nutrition zoom retain their featured timing while the cup zoom is fast',()=>{
 const a=setup();
 for(const [from,to,duration] of [['shelf-4','shelf-5',3200],['shelf-5','cup-finished',700],['research-1','research-2',3400],['research-2','research-1',3400],['cup-reverse-2','grains',6800]]){
  a.place(from);const start=a.window.scrollY,end=a.nav.stops.find(s=>s.id===to).top();
  a.nav.seek(to);a.time(duration/2);
  assert.equal(a.nav.active,true);assert.ok(Math.abs(a.window.scrollY-(start+end)/2)<.01,'a linear scroll playhead lets the artwork apply its own easing');
  a.time(duration/2);assert.equal(a.nav.active,false);assert.ok(Math.abs(a.window.scrollY-end)<.01);
 }
 const slow=new Set(['shelf-5','grains','research-0','research-2']);
 for(let i=1;i<a.nav.stops.length;i++){
  const stop=a.nav.stops[i];if(slow.has(stop.id))continue;
  a.place(a.nav.stops[i-1].id);a.nav.seek(stop.id);a.time(1000);
  assert.equal(a.nav.active,false,`${stop.id} should finish quickly`);assert.ok(Math.abs(a.window.scrollY-stop.top())<.01);
 }
});
test('one arrow after healthiest noodles plays the entire cup-to-grain sequence and stops on the stats',()=>{
 const a=setup(),top=id=>a.nav.stops.find(s=>s.id===id).top();a.place('shelf-5');a.key('ArrowRight');
 a.time(700);assert.ok(Math.abs(a.window.scrollY-top('cup-finished'))<.01,'cup zoom completes in 0.7 seconds');assert.equal(a.nav.active,true);
 a.time(2700);assert.ok(Math.abs(a.window.scrollY-top('cup-reverse-2'))<.01,'the assembly opens without another key press');
 a.time(3400);assert.equal(a.nav.active,true);assert.ok(Math.abs(a.window.scrollY-(top('cup-reverse-2')+top('grains'))/2)<.01,'untangling still takes 6.8 seconds');
 a.time(3400);assert.ok(Math.abs(a.window.scrollY-top('grains'))<.01);assert.equal(a.nav.active,true,'the stats reveal continues automatically');
 a.time(900);assert.equal(a.nav.active,false);assert.ok(Math.abs(a.window.scrollY-top('grain-facts'))<.01);
 a.key('ArrowRight');a.settle();assert.ok(Math.abs(a.window.scrollY-top('research-0'))<.01,'the next key enters Research');
 a.key('ArrowLeft');a.settle();a.key('ArrowLeft');a.settle();assert.ok(Math.abs(a.window.scrollY-top('shelf-5'))<.01,'backward navigation reverses the whole sequence');
});
test('arrows pressed while moving are ignored in both directions and never replay after the move finishes',()=>{
 const a=setup();a.place('shelf-0');a.key('ArrowRight');a.time(250);a.key('ArrowRight');
 a.key('ArrowLeft');for(let i=0;i<8;i++)a.key('ArrowRight',{repeat:true});
 a.time(650);assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-1').top());
 a.time(20000);assert.equal(a.nav.active,false);assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-1').top());
 a.key('ArrowRight');a.settle();assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-2').top(),'a new press is accepted when idle');
});
test('backward navigation is accepted after the current transition ends, and manual input cancels movement',()=>{
 const a=setup();a.place('shelf-1');const start=a.window.scrollY;a.key('ArrowRight');a.time(450);assert.ok(a.window.scrollY>start);a.key('ArrowLeft');a.settle();assert.equal(a.window.scrollY,a.nav.stops.find(s=>s.id==='shelf-2').top());a.key('ArrowLeft');a.settle();assert.equal(a.window.scrollY,start);
 for(const event of ['wheel','touchstart','pointerdown','resize']){a.key('ArrowRight');a.time(300);a.key('ArrowRight');a.emit(event);const stopped=a.window.scrollY;a.time(20000);assert.equal(a.nav.active,false);assert.equal(a.window.scrollY,stopped,event)}
 a.key('ArrowRight');a.time(300);a.window.scrollTo({top:a.window.scrollY+200,behavior:'instant'});const manual=a.window.scrollY;a.time(20000);assert.equal(a.window.scrollY,manual,'scrollbar changes also cancel the timed movement');
});
test('the flowchart gets a slower two-second entry and nutrition movement ends with the zoom instead of an idle tail',()=>{
 const a=setup();a.place('grain-facts');a.key('ArrowRight');a.time(900);assert.ok(Math.abs(a.window.scrollY-a.nav.stops.find(s=>s.id==='research-entry').top())<.01,'page travel finishes before the flowchart starts');a.time(1000);assert.equal(a.nav.active,true);a.time(1000);assert.equal(a.nav.active,false);
 a.place('research-1');a.key('ArrowRight');a.time(2500);
 const u=(a.window.scrollY-14000)/9600*10,pose=sampleResearchCamera(u/7,1440,900);
 assert.equal(pose.from,'label');assert.equal(pose.to,'kit');assert.ok(pose.amount>0&&pose.amount<1,'camera is still moving during the shortened transition');
 a.time(900);assert.equal(a.nav.active,false);assert.equal(researchTourStops[2],2.4);assert.equal(sampleResearchCamera(researchTourStops[2]/7,1440,900).from,'kit');
 a.key('ArrowRight');a.time(100);assert.equal(a.nav.active,true,'the next arrow is accepted as soon as the full kit appears');
});
test('open dialogs, form fields and modifier shortcuts retain their keys; reduced motion jumps to complete stops',()=>{
 const a=setup();a.editing=true;assert.notEqual(a.key('ArrowRight').defaultPrevented,true);assert.equal(a.nav.active,false);a.editing=false;
 a.modal=true;assert.notEqual(a.key('ArrowRight').defaultPrevented,true);a.modal=false;
 for(const modifier of ['altKey','ctrlKey','metaKey','shiftKey'])assert.notEqual(a.key('ArrowRight',{[modifier]:true}).defaultPrevented,true);
 for(const key of ['Escape','Tab','Enter',' ']){a.key('ArrowRight');a.time(200);a.key(key);assert.equal(a.nav.active,false)}
 a.key('ArrowRight');a.time(200);a.modal=true;assert.notEqual(a.key('ArrowRight').defaultPrevented,true);assert.equal(a.nav.active,false);
 const b=setup({reduced:true});b.place('shelf-5');b.key('ArrowRight');assert.equal(b.nav.active,false);assert.equal(b.window.scrollY,b.nav.stops.find(s=>s.id==='grain-facts').top());
});
