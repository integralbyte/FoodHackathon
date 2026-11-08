(() => {
 'use strict';
 const root=document.getElementById('market-opening'),journey=document.getElementById('product-journey');if(!root||!journey)return;
 /*__OPENING_HANDOFF__*/
 const pin=document.getElementById('opening-stats-pin'),runway=document.getElementById('opening-handoff-runway'),shelf=journey.querySelector('.journey-pin'),cards=[...root.querySelectorAll('.market-stat')],footer=root.querySelector('.market-opening-footer');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
 document.documentElement.classList.add('has-opening-handoff');
 function paint(){
  frame=0;if(document.hidden)return;
  const height=pin.offsetHeight,viewport=runway.offsetHeight||window.innerHeight;
  const state=sampleOpeningHandoff(-root.getBoundingClientRect().top,height,viewport,motion.matches),incomingTop=Math.max(0,journey.getBoundingClientRect().top);
  root.style.setProperty('--opening-sticky-top',`${Math.min(0,viewport-height)}px`);
  root.style.setProperty('--opening-image-scale',String(state.imageScale));
  pin.style.opacity=String(state.introOpacity);pin.style.pointerEvents=state.introOpacity<.03?'none':'auto';pin.inert=state.introOpacity===0;
  footer.style.opacity=String(1-state.cards[0]);footer.inert=state.cards[0]>.9;
  cards.forEach((card,i)=>{const p=state.cards[i];card.style.transform=motion.matches?'none':`perspective(1100px) translate3d(0,${-76*p}px,0) rotateX(${-16*p}deg) scale(${1-p*.035})`;card.style.clipPath=`inset(0 0 ${p*100}% 0)`});
  shelf.style.opacity=String(state.shelfOpacity);
  shelf.style.transform=state.progress===1?'none':`translate3d(0,${-incomingTop}px,0) scale(${state.shelfScale})`;
  root.dataset.handoffProgress=state.progress.toFixed(4);
 }
 function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint)}
 for(const event of ['scroll','resize','pageshow'])window.addEventListener(event,request,{passive:true});
 document.addEventListener('visibilitychange',request);motion.addEventListener('change',request);
 request();
})();
