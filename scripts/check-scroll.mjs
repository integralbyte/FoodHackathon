// Regression test for the first scroll from the film into the sticky cup scene.
// Model the observer's threshold notifications, not browser layout or rendering.
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const markup=await readFile(new URL('../src/story.html',import.meta.url),'utf8');
const script=await readFile(new URL('../src/story.js',import.meta.url),'utf8');

function scene({initialScroll=0}={}){
 class Element{
  constructor(id='',tagName='g'){
   this.id=id;this.tagName=tagName;this.attrs={};this.children=[];this.dataset={};this.listeners={};
   this.style={setProperty(key,value){this[key]=value}};
   const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)};
  }
  setAttribute(k,v){this.attrs[k]=String(v)}
  removeAttribute(k){delete this.attrs[k]}
  append(e){this.children.push(e)}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
 }
 const ids=new Map([...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element(m[1])]));
 const root=ids.get('cup-story'),steps=Array.from({length:6},(_,i)=>Object.assign(new Element(),{dataset:{storyStep:String(i)}}));
 let scrollY=initialScroll,now=0,frameID=0,observerNotifications=0;
 const frames=new Map(),events={},observers=[];
 const viewport=900,sectionTop=900,height=5850;
 root.offsetHeight=height;
 root.getBoundingClientRect=()=>({top:sectionTop-scrollY,bottom:sectionTop+height-scrollY,height,width:1440,left:0,right:1440});
 root.querySelectorAll=selector=>selector==='[id]'?[...ids.values()]:selector==='[data-story-step]'?steps:[];
 const document={hidden:false,activeElement:{tagName:'BODY'},getElementById:id=>ids.get(id),createElementNS:(_,tag)=>new Element('',tag),addEventListener(){}};
 const window={innerHeight:viewport,innerWidth:1440,matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(type,fn){(events[type]??=[]).push(fn)},get scrollY(){return scrollY},scrollTo({top}){scroll(top)}};
 class IntersectionObserver{
  constructor(callback,{threshold=0}={}){this.callback=callback;this.thresholds=[threshold].flat();this.previous=null;observers.push(this)}
  observe(){this.check()}
  check(){
   const rect=root.getBoundingClientRect();
   // Edge-adjacent rectangles count as intersecting, even when their area is 0.
   const isIntersecting=rect.top<=viewport&&rect.bottom>=0;
   const intersectionRatio=Math.max(0,Math.min(rect.bottom,viewport)-Math.max(rect.top,0))/height;
   const thresholdIndex=this.thresholds.filter(t=>intersectionRatio>=t).length;
   const key=`${isIntersecting}:${thresholdIndex}`;
   if(key!==this.previous){this.previous=key;observerNotifications++;this.callback([{isIntersecting,intersectionRatio}])}
  }
 }
 function scroll(top){scrollY=top;observers.forEach(o=>o.check());(events.scroll??[]).forEach(fn=>fn())}
 function flush(count=80){for(let i=0;i<count;i++){now+=16.67;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now))}}
 runInNewContext(script,{document,window,IntersectionObserver,performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++frameID,fn);return frameID},cancelAnimationFrame:id=>frames.delete(id)});
 return{root,ids,flush,scroll,get observerNotifications(){return observerNotifications},get pendingFrames(){return frames.size},atProgress:p=>scroll(sectionTop+p*(height-viewport))};
}

test('first downward scroll animates after an edge-only initial observer entry',()=>{
 const app=scene();app.flush();assert.equal(app.root.dataset.stage,'0');
 app.atProgress(.43);app.flush();
 assert.equal(app.observerNotifications,1,'No second observer notification occurs when the ratio changes from zero to positive');
 assert.equal(app.root.dataset.stage,'2','The cup must assemble on the first pass without leaving the section');
 assert.ok(Number(app.ids.get('cup-front').style.opacity)>.99);
 app.atProgress(.78);app.flush();assert.equal(app.root.dataset.stage,'4');assert.ok(Number(app.root.dataset.fill)>.5);
});

test('a restored scroll position starts at the correct animation stage',()=>{
 const app=scene({initialScroll:900+.6*4950});app.flush();assert.equal(app.root.dataset.stage,'3');
});

test('offscreen rendering stops and reverse scrolling wakes the scene again',()=>{
 const app=scene();app.atProgress(1);app.flush();assert.equal(app.root.dataset.stage,'5');
 app.scroll(7000);app.flush();assert.equal(app.pendingFrames,0);
 app.atProgress(.28);app.flush();assert.equal(app.root.dataset.stage,'1');
});
