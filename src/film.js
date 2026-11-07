(() => {
 const root=document.getElementById('sorami-film');if(!root)return;
 const video=document.getElementById('opening-video'),button=document.getElementById('film-playback'),label=document.getElementById('film-playback-label');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let inView=false,manuallyPaused=false,explicitPlay=false,playPending=false;
 video.muted=true;video.defaultMuted=true;
 function updateControl(){
  const playing=!video.paused&&!video.ended;
  button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'Pause background film':'Play background film');label.textContent=playing?'Pause film':'Play film';
 }
 function canPlay(){return inView&&!document.hidden&&!manuallyPaused&&(!motion.matches||explicitPlay)}
 function reconcile(){
  if(!canPlay()){video.pause();updateControl();return}
  if(!video.paused||playPending)return;
  playPending=true;
  const attempt=video.play();
  Promise.resolve(attempt).then(()=>{if(!canPlay())video.pause();updateControl()}).catch(()=>{updateControl()}).finally(()=>{playPending=false});
 }
 button.addEventListener('click',()=>{
  if(!video.paused){manuallyPaused=true;video.pause()}
  else{manuallyPaused=false;explicitPlay=true;reconcile()}
  updateControl();
 });
 ['play','pause','ended'].forEach(event=>video.addEventListener(event,updateControl));
 video.addEventListener('timeupdate',()=>{root.style.setProperty('--film-progress',Number.isFinite(video.duration)&&video.duration>0?String(video.currentTime/video.duration):'0')});
 video.addEventListener('error',()=>{video.pause();button.hidden=true});
 new IntersectionObserver(([entry])=>{inView=entry.isIntersecting&&entry.intersectionRatio>=.12;reconcile()},{threshold:[0,.12,.5]}).observe(root);
 document.addEventListener('visibilitychange',reconcile);
 motion.addEventListener('change',()=>{explicitPlay=false;reconcile()});
 updateControl();
})();
