(() => {
 const root=document.getElementById('sorami-film');if(!root)return;
 const pin=root.closest('.pitch-pin');pin.appendChild(root);
 const video=document.getElementById('opening-video'),button=document.getElementById('film-playback'),label=document.getElementById('film-playback-label');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let active=false,inView=false,manuallyPaused=false,explicitPlay=false,playPending=false,failed=false,playGeneration=0;
 pin.appendChild(button);button.hidden=true;button.inert=true;
 video.muted=true;video.defaultMuted=true;
 function updateControl(){
  const playing=!video.paused&&!video.ended;
  button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'Pause background film':'Play background film');label.textContent=playing?'Pause film':'Play film';
 }
 function canPlay(){return active&&inView&&!document.hidden&&!manuallyPaused&&!failed&&(!motion.matches||explicitPlay)}
 function reconcile(){
  if(!canPlay()){playGeneration++;playPending=false;video.pause();updateControl();return}
  window.soramiMedia?.load('film');
  if(!video.paused||playPending)return;
  playPending=true;const generation=++playGeneration;
  const attempt=video.play();
  Promise.resolve(attempt).then(()=>{if(!canPlay())video.pause();updateControl()}).catch(()=>{updateControl()}).finally(()=>{if(generation===playGeneration)playPending=false});
 }
 button.addEventListener('click',()=>{
  if(!video.paused){manuallyPaused=true;reconcile()}
  else{manuallyPaused=false;explicitPlay=true;reconcile()}
  updateControl();
 });
 ['play','pause','ended'].forEach(event=>video.addEventListener(event,updateControl));
 video.addEventListener('error',()=>{failed=true;video.pause();button.hidden=true});
 new IntersectionObserver(([entry])=>{inView=entry.isIntersecting&&entry.intersectionRatio>=.12;reconcile()},{threshold:[0,.12,.5]}).observe(root);
 document.addEventListener('visibilitychange',reconcile);
 motion.addEventListener('change',()=>{explicitPlay=false;reconcile()});
 root.filmScene={setActive(value){
  value=Boolean(value);if(active===value)return;
  active=value;root.hidden=!active;root.inert=!active;button.hidden=!active||failed;button.inert=!active;
  const r=root.getBoundingClientRect();inView=active&&r.bottom>0&&r.top<window.innerHeight;
  reconcile();
 }};
 updateControl();
})();
