// Fetch later scenes ahead of their reveal, without putting media in the HTML.
(() => {
 const loaded=new Set(),by=id=>document.getElementById(id);
 function load(group){
  if(loaded.has(group))return;
  loaded.add(group);
  const videos=new Set();
  document.querySelectorAll(`[data-media-group="${group}"][data-src]`).forEach(element=>{
   element.setAttribute(element.tagName.toLowerCase()==='image'?'href':'src',element.dataset.src);
   element.removeAttribute('data-src');
   if(element.tagName.toLowerCase()==='source')videos.add(element.parentElement);
  });
  videos.forEach(video=>{video.preload='metadata';video.load()});
 }
 const started=()=>load('shelf');
 document.addEventListener('sorami-intro-start',started,{once:true});
 if(!document.documentElement.classList.contains('intro-locked'))started();
 const flow=by('product-journey')?.soramiFlow;
 flow?.onFrame(state=>{if(state.reverse>.5||state.facts>0)load('research')});
 const research=document.querySelector('.research-scene');
 function prepareResearch(step=Number(research?.dataset.researchStep)){
  if(step>0)load('research');
  if(step>=6)load('launch');
  if(step>=8)load('film');
 }
 window.soramiMedia={load,prepare:prepareResearch};
 if(Number(research?.dataset.researchStep)>0)prepareResearch();
 const pitch=by('pitch-story');
 if(pitch)new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))load('research')},{rootMargin:'150% 0px'}).observe(pitch);
})();
