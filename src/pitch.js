(() => {
 'use strict';
 const root=document.getElementById('pitch-story');if(!root)return;
 const by=id=>document.getElementById(id),scene=root.querySelector('.research-scene'),research=scene.researchScene;
 const menu=by('pitch-chapters'),toggle=by('pitch-chapters-toggle'),evidence=by('pitch-evidence-dialog');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const labels=['How we make it','Noodle recipe','The product kit','Bitterness','The product kit','Thin strands','Microwave-vacuum pores','Cost per cup','Launch','Beyond the cup'];
 const clamp=x=>Math.max(0,Math.min(1,x));
 let frame=0,visible=true;
 function toggleMenu(open){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open))}
 function targetTop(progress){return window.scrollY+root.getBoundingClientRect().top+clamp(progress)*(root.offsetHeight-window.innerHeight)}
 function seek(step){
  document.dispatchEvent(new CustomEvent('sorami-navigation-cancel'));
  root.querySelector('.pitch-scenes').scrollTop=0;
  window.scrollTo({top:targetTop(research.stopAt(step)),behavior:'instant'});request();
 }
 const buttons=labels.map((label,step)=>{
  const button=document.createElement('button');button.innerHTML=`<span>${String(step+1).padStart(2,'0')}</span>${label}`;
  button.addEventListener('click',()=>{seek(step);toggleMenu(false)});menu.insertBefore(button,by('pitch-evidence'));return button;
 });
 toggle.addEventListener('click',()=>toggleMenu(menu.hidden));
 document.addEventListener('click',e=>{if(!e.target.closest('#pitch-chapters,#pitch-chapters-toggle'))toggleMenu(false)});
 function paint(now){
  frame=0;if(document.hidden||!visible)return;
  const distance=Math.max(1,root.offsetHeight-window.innerHeight),progress=clamp(-root.getBoundingClientRect().top/distance);
  research.paint(progress,now,motion.matches);
  const step=Number(scene.dataset.researchStep)||0;
  root.classList.add('is-research');root.style.setProperty('--scene-progress',progress);
  by('pitch-count').textContent=`${String(step+1).padStart(2,'0')} / ${research.steps}`;
  by('pitch-folio').textContent=String(step+1).padStart(2,'0');
  buttons.forEach((button,i)=>{if(i===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
  const impact=step===research.steps-1;root.classList.toggle('is-impact',impact);
  const logo=root.querySelector('.pitch-wordmark');logo.hidden=!impact;logo.inert=!impact;
  by('sorami-film')?.filmScene?.setActive(impact);
 }
 function request(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(paint)}
 root.pitchScene={targetTop,research,count:1};
 root.addEventListener('sorami-research-update',request);
 root.addEventListener('sorami-research-seek',e=>seek(e.detail.step));
 document.addEventListener('sorami-navigation-start',()=>{toggleMenu(false);root.querySelector('.pitch-scenes').scrollTop=0});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false)});
 by('pitch-evidence').addEventListener('click',()=>{toggleMenu(false);evidence.showModal();by('evidence-close').focus()});
 by('evidence-close').addEventListener('click',()=>evidence.close());
 evidence.addEventListener('close',()=>toggle.focus());
 evidence.addEventListener('click',e=>{if(e.target===evidence){const r=evidence.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)evidence.close()}});
 for(const event of ['scroll','resize','pageshow'])window.addEventListener(event,request,{passive:true});
 document.addEventListener('visibilitychange',request);motion.addEventListener('change',request);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();else by('sorami-film')?.filmScene?.setActive(false)}).observe(root);
 request();
})();
