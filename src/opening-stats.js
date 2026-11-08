(() => {
 'use strict';
 const root=document.getElementById('market-opening');if(!root)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),values=[...root.querySelectorAll('[data-opening-count]')].map((e,i)=>({e,target:+e.dataset.openingCount,decimals:+(e.dataset.openingDecimals||0),delay:i*80}));
 const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>1-(1-clamp(v))**3,duration=2100,lastDelay=Math.max(...values.map(v=>v.delay));
 let frame=0,start=-1,visible=false,complete=false;
 function paint(elapsed){
  values.forEach(({e,target,decimals,delay})=>{const p=ease((elapsed-delay)/duration),value=decimals?target*p:Math.round(target*p);e.textContent=value.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals})});
  root.style.setProperty('--count-rule',String(ease(elapsed/600)));
  root.style.setProperty('--count-trend',String(ease((elapsed-350)/1800)));
 }
 function finish(){paint(duration+lastDelay);complete=true;root.dataset.countComplete='true';if(frame)cancelAnimationFrame(frame);frame=0}
 function tick(now){
  frame=0;if(!visible||document.hidden||complete)return;
  if(start<0)start=now;
  const elapsed=now-start;paint(elapsed);
  if(elapsed>=duration+lastDelay)finish();else frame=requestAnimationFrame(tick);
 }
 function request(){if(visible&&!document.hidden&&!complete&&!frame)frame=requestAnimationFrame(tick)}
 function setVisible(on){
  visible=on;
  if(!on){if(frame)cancelAnimationFrame(frame);frame=0;return}
  if(motion.matches)finish();else{if(start<0)paint(0);request()}
 }
 const sources=document.getElementById('opening-sources'),open=document.getElementById('opening-sources-open'),close=document.getElementById('opening-sources-close');
 open.addEventListener('click',()=>{sources.showModal();close.focus()});close.addEventListener('click',()=>sources.close());sources.addEventListener('close',()=>open.focus());
 sources.addEventListener('click',e=>{if(e.target!==sources)return;const r=sources.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)sources.close()});
 document.getElementById('opening-explore').addEventListener('click',e=>{const journey=document.getElementById('product-journey');if(!journey)return;e.preventDefault();window.scrollTo({top:window.scrollY+journey.getBoundingClientRect().top,behavior:motion.matches?'instant':'smooth'})});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0}else request()});
 motion.addEventListener('change',()=>{if(motion.matches)finish();else request()});
 new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:0}).observe(root);
 // Start on the first visible frame; restored pages can enter the opening later.
 const bounds=root.getBoundingClientRect();setVisible(bounds.top<window.innerHeight&&bounds.bottom>0);
 if(!visible)paint(duration+lastDelay);
})();
