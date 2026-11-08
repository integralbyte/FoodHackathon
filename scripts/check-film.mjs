import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/film.js',import.meta.url),'utf8');
function setup({reduced=false,defer=false}={}){
 const eventTarget=()=>{const events=new Map();return {addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn)},emit(name){for(const fn of events.get(name)||[])fn()}}};
 const attrs=new Map(),pin={appendChild(){}},video={...eventTarget(),paused:true,ended:false,plays:0,play(){this.plays++;this.paused=false;this.emit('play');return defer?new Promise(resolve=>pending.push(resolve)):Promise.resolve()},pause(){this.paused=true;this.emit('pause')}};
 const pending=[],root={hidden:true,inert:true,closest:()=>pin,getBoundingClientRect:()=>({top:0,bottom:900})},button={...eventTarget(),setAttribute:(key,value)=>attrs.set(key,value)},label={};
 const doc={...eventTarget(),hidden:false,getElementById:id=>({'sorami-film':root,'opening-video':video,'film-playback':button,'film-playback-label':label}[id])},motion={...eventTarget(),matches:reduced};
 let observe;
 vm.runInNewContext(source,{document:doc,window:{innerHeight:900},matchMedia:()=>motion,Promise,Boolean,IntersectionObserver:class{constructor(fn){observe=fn}observe(){observe([{isIntersecting:true,intersectionRatio:1}])}}});
 return {root,button,video,doc,motion,attrs,pending,observe:visible=>observe([{isIntersecting:visible,intersectionRatio:visible?1:0}])};
}
test('background plays only in the impact scene and survives a rapid exit and restored entry',async()=>{
 const a=setup({defer:true});assert.equal(a.video.plays,0);
 a.root.filmScene.setActive(true);assert.equal(a.video.paused,false);assert.equal(a.button.hidden,false);
 a.root.filmScene.setActive(false);assert.equal(a.video.paused,true);assert.equal(a.root.inert,true);assert.equal(a.button.hidden,true);
 a.root.filmScene.setActive(true);assert.equal(a.video.plays,2,'old pending play must not block restored entry');
 a.root.filmScene.setActive(false);a.pending.forEach(resolve=>resolve());await new Promise(resolve=>setImmediate(resolve));assert.equal(a.video.paused,true);
});
test('manual pause persists through offscreen and scene changes',()=>{
 const a=setup();a.root.filmScene.setActive(true);a.button.emit('click');assert.equal(a.video.paused,true);
 a.observe(false);a.observe(true);a.root.filmScene.setActive(false);a.root.filmScene.setActive(true);assert.equal(a.video.paused,true);
 a.button.emit('click');assert.equal(a.video.paused,false);assert.equal(a.attrs.get('aria-label'),'Pause background film');
 a.observe(false);assert.equal(a.video.paused,true);a.observe(true);assert.equal(a.video.paused,false);
});
test('reduced motion needs explicit play, hidden pages pause, and media errors disable playback',()=>{
 const a=setup({reduced:true});a.root.filmScene.setActive(true);assert.equal(a.video.paused,true);
 a.button.emit('click');assert.equal(a.video.paused,false);
 a.doc.hidden=true;a.doc.emit('visibilitychange');assert.equal(a.video.paused,true);a.doc.hidden=false;a.doc.emit('visibilitychange');assert.equal(a.video.paused,false);
 a.motion.emit('change');assert.equal(a.video.paused,true);
 a.video.emit('error');a.root.filmScene.setActive(false);a.root.filmScene.setActive(true);assert.equal(a.button.hidden,true);assert.equal(a.video.paused,true);
});
