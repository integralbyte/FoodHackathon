// One keyboard path through the opening, shelves, cup, grains and pitch.
// Move the actual scroll playhead over time so every renderer paints its
// intermediate frames. Native smooth scrolling has no dependable duration.
(() => {
 'use strict';
 const by=id=>document.getElementById(id),journey=by('product-journey'),flow=journey?.soramiFlow;
 const shelf=by('noodle-shelf')?.shelfScene,assembly=by('cup-story')?.assemblyScene,pitch=by('pitch-story')?.pitchScene;
 if(!flow||!shelf||!assembly||!pitch)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),stops=[];
 const quick=900;
 const journeyTop=p=>window.scrollY+journey.getBoundingClientRect().top+p*(journey.offsetHeight-window.innerHeight);
 const add=(id,top,duration,kind='timeline',pause=true)=>stops.push({id,top,duration,kind,pause});
 add('opening',()=>0,0,'page');
 shelf.stops.forEach((p,i)=>add(`shelf-${i}`,()=>journeyTop(p*flow.phases.shelfEnd),i===5?3200:quick,i===0?'page':'timeline'));
 add('cup-finished',()=>journeyTop(flow.phases.transferEnd),700,'timeline',false);
 assembly.stops.slice(0,-1).reverse().forEach((p,i)=>{
  const phase=flow.phases.transferEnd+(1-p)*(flow.phases.reverseEnd-flow.phases.transferEnd);
  add(i===3?'grains':`cup-reverse-${i}`,()=>journeyTop(phase),i===3?6800:quick,'timeline',false);
 });
 add('grain-facts',()=>journeyTop(flow.phases.factsEnd),quick);
 add('research-entry',()=>pitch.targetTop(0),quick,'page',false);
 for(let i=0;i<pitch.research.steps;i++)add(`research-${i}`,()=>pitch.targetTop(pitch.research.stopAt(i)),i===0?2000:i===2?3400:quick);
 for(let i=1;i<pitch.count;i++)add(`chapter-${i}`,()=>pitch.targetTop(i+.79),quick);

 let frame=0,job=null,expectedY=window.scrollY;
 const closeMenu=()=>{const menu=by('pitch-chapters');if(menu)menu.hidden=true;by('pitch-chapters-toggle')?.setAttribute('aria-expanded','false')};
 function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;job=null}
 function write(top){expectedY=top;window.scrollTo({top,behavior:'instant'})}
 function nextIndex(direction){
  if(direction>0)return stops.findIndex(s=>s.pause&&s.top()>window.scrollY+3);
  for(let i=stops.length-1;i>=0;i--)if(stops[i].pause&&stops[i].top()<window.scrollY-3)return i;
  return 0;
 }
 function begin(index){
  if(index<0)return;
  const from=window.scrollY,to=stops[index].top(),direction=Math.sign(to-from);
  if(Math.abs(to-from)<1){write(to);return}
  // Internal cup frames remain part of the animation, without requiring
  // another key press. Each leg keeps its own speed, including untangling.
  const positions=stops.map(s=>s.top()),legs=[];
  let at=from,duration=0;
  for(let i=direction>0?0:stops.length-1;i>=0&&i<stops.length;i+=direction){
   if(direction*(positions[i]-at)<=.01||direction*(positions[i]-to)>.01)continue;
   const origin=Math.max(0,Math.min(stops.length-1,i-direction)),edge=stops[Math.max(i,origin)];
   const fullDistance=Math.max(1,Math.abs(positions[i]-positions[origin]));
   const length=Math.max(350,edge.duration*Math.min(1,Math.abs(positions[i]-at)/fullDistance));
   legs.push({from:at,to:positions[i],offset:duration,duration:length,page:edge.kind==='page'});
   duration+=length;at=positions[i];
  }
  closeMenu();document.dispatchEvent(new CustomEvent('sorami-navigation-start'));
  if(motion.matches){write(to);return}
  // Camera and strand paths already ease their own movement. A linear
  // playhead avoids accelerating twice through the interesting middle.
  job={index,from,to,direction,duration,legs,start:performance.now()};
  expectedY=from;frame=requestAnimationFrame(tick);
 }
 function tick(now){
  frame=0;if(!job)return;
  const current=job,elapsed=Math.max(0,now-current.start),leg=current.legs.find(s=>elapsed<s.offset+s.duration)||current.legs.at(-1);
  const t=Math.min(1,(elapsed-leg.offset)/leg.duration),p=leg.page?t*t*(3-2*t):t;
  write(leg.from+(leg.to-leg.from)*p);
  if(job!==current)return; // A clamped or externally redirected scroll cancels playback.
  if(elapsed<current.duration){frame=requestAnimationFrame(tick);return}
  job=null;
 }
 function advance(direction){
  if(job)return; // Arrows are accepted only while idle; nothing is queued.
  begin(nextIndex(direction));
 }
 window.soramiNavigation={
  advance,cancel,
  seek(id){const index=stops.findIndex(s=>s.id===id);if(index<0)return;cancel();begin(index)},
  get active(){return job!==null},
  stops
 };
 document.addEventListener('keydown',e=>{
  if(document.documentElement?.classList.contains('intro-locked'))return;
  if(['Escape','Tab','Enter',' '].includes(e.key)){cancel();return}
  if(!['ArrowRight','ArrowLeft'].includes(e.key)||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
  if(document.querySelector('dialog[open]')||document.activeElement?.closest('input,select,textarea,[contenteditable]:not([contenteditable="false"])')){cancel();return}
  e.preventDefault();if(!e.repeat)advance(e.key==='ArrowRight'?1:-1);
 });
 // Manual input takes control immediately, without a delayed snap back.
 for(const event of ['wheel','touchstart','pointerdown'])window.addEventListener(event,cancel,{passive:true});
 window.addEventListener('scroll',()=>{if(job&&Math.abs(window.scrollY-expectedY)>3)cancel()},{passive:true});
 window.addEventListener('resize',cancel);
 document.addEventListener('sorami-navigation-cancel',cancel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
 motion.addEventListener('change',()=>{const target=job?job.to:null;cancel();if(motion.matches&&target!==null)write(target)});
})();
