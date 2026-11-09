import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createMediaResolver} from './media.mjs';

const root=new URL('../',import.meta.url),source=await readFile(new URL('src/media.js',root),'utf8');
function setup({locked=true,step,reverse=0}={}){
 const events={},intersections=[],frames=[];
 const video={loads:0,load(){this.loads++}},research={dataset:{researchStep:step}},flow={onFrame(fn){frames.push(fn);fn({reverse,facts:0})}};
 const elements=['shelf','research','launch','film'].map(group=>({tagName:group==='film'?'SOURCE':'IMAGE',dataset:{mediaGroup:group,src:`${group}.webp`},attrs:{},parentElement:video,setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){if(k==='data-src')delete this.dataset.src}}));
 const document={documentElement:{classList:{contains:()=>locked}},getElementById:id=>id==='product-journey'?{soramiFlow:flow}:id==='pitch-story'?{}:null,addEventListener(k,fn){events[k]=fn},querySelector:()=>research,querySelectorAll(selector){return elements.filter(e=>selector.includes(`"${e.dataset.mediaGroup}"`)&&e.dataset.src)}};
 const window={};
 runInNewContext(source,{window,document,Set,Number,IntersectionObserver:class{constructor(fn){intersections.push(fn)}observe(){}}});
 return {window,elements,video,start(){events['sorami-intro-start']()},advance(reverse,facts=0){frames.forEach(fn=>fn({reverse,facts}))},step(n){research.dataset.researchStep=String(n);window.soramiMedia.prepare(n)},approach(){intersections.forEach(fn=>fn([{isIntersecting:true}]))}};
}
test('the logo gate defers shelf artwork, then loads it once on entry',()=>{
 const a=setup();assert.ok(a.elements.every(e=>!e.attrs.href&&!e.attrs.src));
 a.start();assert.equal(a.elements[0].attrs.href,'shelf.webp');assert.equal(a.elements[1].attrs.href,undefined);
 a.window.soramiMedia.load('shelf');assert.equal(a.elements[0].dataset.src,undefined);
 assert.equal(setup({locked:false}).elements[0].attrs.href,'shelf.webp');
});
test('the research image warms up during the grain transition or an approaching section',()=>{
 const a=setup();a.step(0);assert.equal(a.elements[1].attrs.href,undefined);
 a.advance(.6);assert.equal(a.elements[1].attrs.href,'research.webp');assert.equal(a.elements[2].attrs.href,undefined);
 const b=setup();b.approach();assert.equal(b.elements[1].attrs.href,'research.webp');
});
test('restored research and launch positions load the assets they need',()=>{
 assert.equal(setup({step:'2'}).elements[1].attrs.href,'research.webp');
 const a=setup();a.step(6);assert.equal(a.elements[2].attrs.href,'launch.webp');assert.equal(a.video.loads,0);
 a.step(8);assert.equal(a.elements[3].attrs.src,'film.webp');assert.equal(a.video.preload,'metadata');assert.equal(a.video.loads,1);
 a.window.soramiMedia.load('film');a.step(9);assert.equal(a.video.loads,1,'re-entry must not reload or reset the playing video');
});
test('the web page references existing separate files and keeps later media deferred',async()=>{
 const html=await readFile(new URL('index.html',root),'utf8');
 assert.ok(Buffer.byteLength(html)<500_000,'HTML must not contain the media payload');
 assert.doesNotMatch(html,/data:(?:image\/(?:png|webp|jpeg)|video\/mp4);base64,/);
 assert.match(html,/preload="none"/);assert.match(html,/data-media-group="film" data-src="assets\/sorami-opening\.mp4"/);
 for(const [,path] of html.matchAll(/(?:data-src|src|href|poster)="(assets\/[^"<>]+)"/g))assert.ok((await stat(new URL(path,root))).isFile(),path);
 const manifest=JSON.parse(await readFile(new URL('assets/web/manifest.json',root),'utf8'));
 const cups=Object.entries(manifest).filter(([path])=>path.startsWith('assets/competitors/'));
 assert.equal(cups.length,17);let bytes=0;
 for(const [,asset] of cups){assert.ok(Math.max(asset.width,asset.height)<=768);bytes+=(await stat(new URL(asset.src,root))).size}
 assert.ok(bytes<2_000_000,'the shelf image budget must remain below 2 MB');
});
test('offline exports embed the same optimized media for use without an asset folder',async()=>{
 const online=await createMediaResolver(root),offline=await createMediaResolver(root,{offline:true});
 const path=await online('assets/sorami-logo-transparent.png'),data=await offline('assets/sorami-logo-transparent.png');
 assert.ok(data.startsWith('data:image/webp;base64,'));
 assert.ok(Buffer.from(data.split(',')[1],'base64').equals(await readFile(new URL(path,root))));
});
