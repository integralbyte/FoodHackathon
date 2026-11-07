(() => {
 const root=document.getElementById('product-journey');if(!root)return;
 const shelf=document.getElementById('noodle-shelf'),assembly=document.getElementById('cup-story'),cup=document.getElementById('journey-transfer-cup');
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),listeners=new Set();
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const phases={shelfEnd:.46,transferEnd:.54,reverseEnd:.97};
 let frame=0,visible=true;
 function sample(){
  const rect=root.getBoundingClientRect(),distance=Math.max(1,root.offsetHeight-window.innerHeight),progress=clamp(-rect.top/distance);
  const transfer=clamp((progress-phases.shelfEnd)/(phases.transferEnd-phases.shelfEnd));
  return {progress,shelf:clamp(progress/phases.shelfEnd),transfer,reverse:clamp((progress-phases.transferEnd)/(phases.reverseEnd-phases.transferEnd)),reduced:motion.matches,active:rect.top<=0&&rect.bottom>=window.innerHeight};
 }
 function seek(progress,behavior='instant'){
  window.scrollTo({top:window.scrollY+root.getBoundingClientRect().top+clamp(progress)*(root.offsetHeight-window.innerHeight),behavior});request();
 }
 root.soramiFlow={sample,phases,seek,onFrame(fn){listeners.add(fn);fn(sample(),performance.now());return()=>listeners.delete(fn)}};
 function transferRect(){
  const from=shelf.querySelector('.hook-sorami .hook-cup-art').getBoundingClientRect(),svg=document.getElementById('assembly-art');
  // The shared photo occupies this exact source-space rectangle in the finished SVG.
  const matrix=svg.getScreenCTM();if(!matrix)return;
  const project=(x,y)=>({x:matrix.a*x+matrix.c*y+matrix.e,y:matrix.b*x+matrix.d*y+matrix.f});
  const a=project(245,431.5),b=project(652.5,904);
  const to={left:a.x,top:a.y,width:b.x-a.x,height:b.y-a.y};
  const t=motion.matches?1:ease(sample().transfer),pin=root.querySelector('.journey-pin').getBoundingClientRect();
  const mix=(a,b)=>a+(b-a)*t;
  cup.style.width=mix(from.width,to.width)+'px';cup.style.height=mix(from.height,to.height)+'px';
  cup.style.transform=`translate(${mix(from.left,to.left)-pin.left}px,${mix(from.top,to.top)-pin.top}px)`;
 }
 function tick(now){
  frame=0;if(document.hidden||!visible)return;
  const state=sample(),t=motion.matches?(state.transfer>0?1:0):ease(state.transfer),transferring=state.transfer>0&&state.transfer<1;
  root.style.setProperty('--journey-transfer',String(t));root.style.setProperty('--journey-shelf',String(1-t));root.style.setProperty('--journey-assembly',String(state.transfer>=1?1:0));
  root.classList.toggle('is-transferring',transferring);
  shelf.inert=state.transfer>0;assembly.inert=state.transfer<1;
  shelf.setAttribute('aria-hidden',String(state.transfer>=1));assembly.setAttribute('aria-hidden',String(state.transfer<1));
  shelf.style.visibility=state.transfer>=1?'hidden':'visible';
  // Both renderers paint first, so source and destination geometry are current.
  listeners.forEach(fn=>fn(state,now));
  if(transferring)transferRect();
 }
 function request(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});window.addEventListener('pageshow',request);
 document.addEventListener('visibilitychange',request);motion.addEventListener('change',request);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()}).observe(root);
 request();
})();
