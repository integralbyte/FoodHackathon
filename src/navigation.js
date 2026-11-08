// One keyboard path through the opening, shelves, cup, grains and pitch.
// Move the actual scroll playhead over time so every renderer paints its
// intermediate frames. Native smooth scrolling has no dependable duration.
(() => {
 'use strict';
 const by=id=>document.getElementById(id),journey=by('product-journey'),flow=journey?.soramiFlow;
 const shelf=by('noodle-shelf')?.shelfScene,assembly=by('cup-story')?.assemblyScene,pitch=by('pitch-story')?.pitchScene;
 if(!flow||!shelf||!assembly||!pitch)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),stops=[];
 const quick=900,queuePause=90;
 const journeyTop=p=>window.scrollY+journey.getBoundingClientRect().top+p*(journey.offsetHeight-window.innerHeight);
 const add=(id,top,duration,kind='timeline')=>stops.push({id,top,duration,kind});
 add('opening',()=>0,0,'page');
 shelf.stops.forEach((p,i)=>add(`shelf-${i}`,()=>journeyTop(p*flow.phases.shelfEnd),i===5?3200:quick,i===0?'page':'timeline'));
 add('cup-finished',()=>journeyTop(flow.phases.transferEnd),3600);
 assembly.stops.slice(0,-1).reverse().forEach((p,i)=>{
  const phase=flow.phases.transferEnd+(1-p)*(flow.phases.reverseEnd-flow.phases.transferEnd);
  add(i===3?'grains':`cup-reverse-${i}`,()=>journeyTop(phase),i===3?6800:quick);
 });
 add('grain-facts',()=>journeyTop(flow.phases.factsEnd),quick);
 for(let i=0;i<pitch.research.steps;i++)add(`research-${i}`,()=>pitch.targetTop(pitch.research.stopAt(i)),i===2?5600:quick,i===0?'page':'timeline');
 for(let i=1;i<pitch.count;i++)add(`chapter-${i}`,()=>pitch.targetTop(i+.79),quick);

 let frame=0,job=null,queued=null,expectedY=window.scrollY;
 const closeMenu=()=>{const menu=by('pitch-chapters');if(menu)menu.hidden=true;by('pitch-chapters-toggle')?.setAttribute('aria-expanded','false')};
 function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;job=null;queued=null}
 function write(top){expectedY=top;window.scrollTo({top,behavior:'instant'})}
 function nextIndex(direction){
  if(direction>0){const next=stops.findIndex(s=>s.top()>window.scrollY+3);return next<0?stops.length-1:next}
  for(let i=stops.length-1;i>=0;i--)if(stops[i].top()<window.scrollY-3)return i;
  return 0;
 }
 function begin(index){
  const from=window.scrollY,to=stops[index].top(),direction=Math.sign(to-from);
  if(Math.abs(to-from)<1){write(to);return}
  const origin=Math.max(0,Math.min(stops.length-1,index-direction)),edge=stops[Math.max(index,origin)];
  const fullDistance=Math.max(1,Math.abs(to-stops[origin].top()));
  const duration=Math.max(350,edge.duration*Math.min(1,Math.abs(to-from)/fullDistance));
  closeMenu();document.dispatchEvent(new CustomEvent('sorami-navigation-start'));
  if(motion.matches){write(to);return}
  // Camera and strand paths already ease their own movement. A linear
  // playhead avoids accelerating twice through the interesting middle.
  job={index,from,to,direction,duration,start:performance.now(),page:edge.kind==='page'};
  expectedY=from;frame=requestAnimationFrame(tick);
 }
 function tick(now){
  frame=0;if(!job)return;
  if(job.hold){if(now-job.start<queuePause){frame=requestAnimationFrame(tick);return}const index=job.index;job=null;begin(index);return}
  const current=job,t=Math.max(0,Math.min(1,(now-current.start)/current.duration)),p=current.page?t*t*(3-2*t):t;
  write(current.from+(current.to-current.from)*p);
  if(job!==current)return; // A clamped or externally redirected scroll cancels playback.
  if(t<1){frame=requestAnimationFrame(tick);return}
  const direction=job.direction;job=null;
  if(queued!==null){job={hold:true,index:queued,direction,start:now};queued=null;frame=requestAnimationFrame(tick)}
 }
 function advance(direction){
  if(job){
   if(direction===job.direction){if(!job.hold)queued=Math.max(0,Math.min(stops.length-1,job.index+direction));return}
   const index=job.hold?nextIndex(direction):Math.max(0,Math.min(stops.length-1,job.index+direction));cancel();begin(index);return;
  }
  begin(nextIndex(direction));
 }
 window.soramiNavigation={
  advance,cancel,
  seek(id){const index=stops.findIndex(s=>s.id===id);if(index<0)return;cancel();begin(index)},
  get active(){return job!==null},
  stops
 };
 document.addEventListener('keydown',e=>{
  if(['Escape','Tab','Enter',' '].includes(e.key)){cancel();return}
  if(!['ArrowRight','ArrowLeft'].includes(e.key)||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
  if(document.querySelector('dialog[open]')||document.activeElement?.closest('input,select,textarea,[contenteditable]:not([contenteditable="false"])')){cancel();return}
  e.preventDefault();if(!e.repeat)advance(e.key==='ArrowRight'?1:-1);
 });
 // Manual input takes control immediately, without a delayed snap back.
 for(const event of ['wheel','touchstart','pointerdown'])window.addEventListener(event,cancel,{passive:true});
 window.addEventListener('scroll',()=>{if(job&&Math.abs(window.scrollY-expectedY)>3)cancel()},{passive:true});
 window.addEventListener('resize',cancel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
 motion.addEventListener('change',()=>{const target=job&&!job.hold?job.to:null;cancel();if(motion.matches&&target!==null)write(target)});
})();
