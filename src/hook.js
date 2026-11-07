(() => {
 const root=document.getElementById('noodle-shelf');if(!root)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const first=root.querySelector('.hook-request-first'),filterTitle=root.querySelector('.hook-request-filter'),final=root.querySelector('.hook-request-final'),filters=root.querySelector('.hook-filters'),chips=[...root.querySelectorAll('.hook-filter')];
 const {catalog,rules,counts}=/*__SHELF_DATA__*/{};
 const points=[0,.28,.46,.63,.80,.98],starts=[0,.14,.33,.50,.67];
 const stages=catalog.map(n=>n.firstFailure),products=[...root.querySelectorAll('.hook-product')];
 const mobileSlots=[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,0],[1,1],[1,4],[1,5],[2,0],[2,1],[2,4],[2,5],[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]];
 products.filter(el=>el.dataset.product!=='sorami').forEach((el,i)=>{el.style.setProperty('--mobile-row',mobileSlots[i][0]);el.style.setProperty('--mobile-column',mobileSlots[i][1])});
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t)};
 const stageAt=p=>p>=.86?5:p<starts[1]?0:p<starts[2]?1:p<starts[3]?2:p<starts[4]?3:4;
 const set=(el,key,value)=>el.style.setProperty(key,String(value));
 let frame=0,visible=true,beat=-1;
 function request(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
 function target(){const r=root.getBoundingClientRect();return clamp(-r.top/Math.max(1,root.offsetHeight-window.innerHeight))}
 function textPose(el,amount){el.style.visibility=amount>.001?'visible':'hidden';el.style.clipPath=`inset(${(1-amount)*100}% 0 0)`;el.style.transform=motion.matches?'none':`translateY(${(1-amount)*28}px) rotateX(${(1-amount)*-32}deg)`}
 function render(raw){
  // Without motion, scrolling still advances the complete story in discrete stages.
  const p=motion.matches?points[stageAt(raw)]:raw;
  const hero=smooth(.83,.96,p),foldAway=smooth(.81,.86,p),active=Math.min(4,stageAt(p));
  set(root,'--reveal',hero);set(root,'--seal-scale',hero);
  textPose(first,1-smooth(.09,.16,p));textPose(filterTitle,smooth(.12,.19,p)*(1-foldAway));textPose(final,hero);
  filters.style.visibility=p>.12&&foldAway<.999?'visible':'hidden';filters.setAttribute('aria-hidden',String(p<.12||foldAway>.99));
  chips.forEach((el,i)=>{
   const unfold=smooth(starts[i+1]-.015,starts[i+1]+.045,p)*(1-foldAway);
   el.style.transform=motion.matches?'none':`translateY(${(1-unfold)*32}px) rotateX(${(1-unfold)*-85}deg) rotate(${(i%2?1:-1)*(1-unfold)*8}deg)`;
   el.style.clipPath=`inset(0 0 ${(1-unfold)*100}% 0)`;
   el.setAttribute('aria-hidden',String(unfold<.01));el.classList.toggle('is-current',active===i+1);el.classList.toggle('is-complete',active>i+1);
  });
  products.forEach((el,i)=>{
   const stage=stages[i],group=stages.map((n,j)=>n===stage?j:-1).filter(j=>j!==-1),order=group.indexOf(i);
   const stagger=group.length>1?order/(group.length-1)*.035:0;
   const strike=stage?smooth(starts[stage]+.025+stagger,starts[stage]+.085+stagger,p):0;
   set(el,'--strike',strike);el.dataset.excluded=String(strike>.99);el.dataset.eliminationStage=String(stage);
   el.classList.toggle('is-contender',active>0&&strike<.01&&hero<.01);
   el.querySelector('.hook-cup-art').style.transform=motion.matches?'none':el.dataset.product==='sorami'?`translateY(${-hero*4}px)`:`translateY(${strike*2}px) rotate(${strike*(i%2?-4:4)}deg)`;
  });
  const next=stageAt(p);
  if(next!==beat){
   beat=next;root.dataset.beat=String(beat);
   document.getElementById('hook-announcement').textContent=[
    'Twenty-one selected cups and bowls, with Sorami in the middle. Scroll to explore the four preferences.',
    `At least ${rules.proteinMin} grams protein per cup. ${counts[1]} remain.`,
    `Also under ${rules.sodiumUnder} milligrams sodium per cup. ${counts[2]} remain.`,
    `Also at least ${rules.fibreMin} grams fibre. ${counts[3]} remain.`,
    'Also not deep-fried. The four final competitor cross-outs assume an unverified frying process; they are labeled Assumed fried.',
    'I want the healthiest noodles! Sorami is the concept we are building. Its nutrition and non-fried process are team targets. The final competitor exclusions are assumptions, not confirmed process facts.'
   ][beat];
  }
 }
 function tick(){frame=0;if(visible&&!document.hidden)render(target())}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});window.addEventListener('pageshow',request);
 document.addEventListener('visibilitychange',request);
 document.addEventListener('keydown',e=>{
  const r=root.getBoundingClientRect();
  if(!visible||r.top>0||r.bottom<window.innerHeight*.5||['INPUT','SELECT','TEXTAREA','BUTTON','A'].includes(document.activeElement.tagName))return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
   e.preventDefault();const index=clamp(beat+(e.key==='ArrowRight'?1:-1),0,points.length-1);
   window.scrollTo({top:r.top+window.scrollY+points[index]*Math.max(1,root.offsetHeight-window.innerHeight),behavior:'instant'});request();
  }
 });
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()}).observe(root);
 motion.addEventListener('change',request);
 render(target());request();
})();
