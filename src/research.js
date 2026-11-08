/* A reversible camera tour: process → label/recipe → kit → seasoning → kit → noodles. */
(() => {
 'use strict';
 const root=document.querySelector('.research-scene');if(!root)return;
 const data=/*__RESEARCH_DATA__*/;
 /*__RESEARCH_CAMERA__*/
 const $=id=>document.getElementById(id),all=s=>[...root.querySelectorAll(s)],NS='http://www.w3.org/2000/svg';
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>1-(1-clamp(x))**3,phase=(x,a=0,b=1)=>ease((x-a)/(b-a));
 const attr=(e,k,v)=>e.setAttribute(k,String(v));
 const svg=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>attr(e,k,v));parent.appendChild(e);return e};
 const panels=all('[data-research-panel]'),nav=all('[data-research-step]'),detailPanels=all('[data-research-details]'),dialog=$('research-details');
 let active=-1;
 // Keep the photographic camera outside the text scroller so overview frames
 // can use the whole screen without enlarging or moving the close-up copy.
 const pin=root.closest('.pitch-pin'),cameraLayer=$('research-kit-viewport');
 pin.appendChild(cameraLayer);
 const update=()=>root.dispatchEvent(new CustomEvent('sorami-research-update',{bubbles:true}));
 $('research-details-open').addEventListener('click',()=>{dialog.showModal();$('research-details-close').focus()});
 $('research-details-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>$('research-details-open').focus());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 nav.forEach(b=>b.addEventListener('click',()=>root.dispatchEvent(new CustomEvent('sorami-research-seek',{bubbles:true,detail:{step:+b.dataset.researchStep}}))));
 all('[data-research-flavour]').forEach(b=>b.addEventListener('click',()=>{
  const name=data.flavours[+b.dataset.researchFlavour];all('[data-research-flavour]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));
  $('research-flavour-detail').textContent=`${name} seasoning; both flavours share the 55g noodle block and 13g toppings. Seasoning sachet: 10g.`;
 }));
 $('research-thickness').addEventListener('input',()=>{$('research-thickness-label').textContent=`${(+$('research-thickness').value).toFixed(1)} mm`;update()});
 $('research-pore-progress').addEventListener('input',()=>{$('research-pore-label').textContent=`${$('research-pore-progress').value}%`;update()});
 const d='M0 27C-58 60 58 86 0 117S-58 175 0 203S58 254 0 282';
 const thick=svg('path',{d,class:'research-thick-reference',pathLength:1},$('research-thick-strand'));
 const thinShadow=svg('path',{d,class:'research-thin-shadow',pathLength:1},$('research-thin-strand'));
 const thinLight=svg('path',{d,class:'research-thin-highlight',pathLength:1},$('research-thin-strand'));
 attr($('research-thick-strand'),'transform','translate(148 0)');attr($('research-thin-strand'),'transform','translate(448 0)');
 const holes=[],texture=[],water=[];
 for(let i=0;i<20;i++){
  const a=i*2.399,r=Math.sqrt((i+.5)/20)*94,x=480+Math.cos(a)*r,y=192+Math.sin(a)*r;
  const e=svg('ellipse',{cx:x,cy:y,rx:0,ry:0,class:'research-pore-hole',transform:`rotate(${i*31} ${x} ${y})`},$('research-pore-holes'));
  holes.push({e,i,r:4+i%4*1.6});
 }
 for(let i=0;i<28;i++){
  const a=i*2.399,r=Math.sqrt((i+.5)/28)*107;
  texture.push(svg('circle',{cx:480+Math.cos(a)*r,cy:192+Math.sin(a)*r,r:.9,fill:'#a06c31',opacity:.3},$('research-pore-texture')));
 }
 for(const d of [
  'M369 188C401 176 409 216 432 208S449 176 480 192',
  'M494 81C511 123 451 132 463 160S494 169 480 192',
  'M591 197C551 214 551 165 519 177S510 205 480 192',
  'M479 303C457 270 513 255 493 226S470 215 480 192'
 ])water.push(svg('path',{d,class:'research-pore-water',pathLength:1},$('research-water-paths')));
 function scaleAt(e,x,y,s){attr(e,'transform',`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`)}
 function paint(q,now,reduced){
  const u=clamp(q)*panels.length,index=Math.min(panels.length-1,Math.floor(u)),local=clamp(u-index);
  if(index!==active){
   active=index;root.dataset.researchStep=String(index);root.closest('.pitch-scenes').scrollTop=0;
   panels.forEach((e,i)=>{e.hidden=i!==index;e.inert=i!==index});
   detailPanels.forEach(e=>e.hidden=e.dataset.researchDetails!==data.steps[index].details);
   nav.forEach(e=>e.setAttribute('aria-pressed',String(+e.dataset.researchStep===index)));$('research-details-title').textContent=data.steps[index].title;
  }
  const bounds=root.querySelector('.research-workbench').getBoundingClientRect(),stage=pin.getBoundingClientRect(),width=stage.width,height=stage.height;
  const contentFrame={x:bounds.left-stage.left,y:bounds.top-stage.top,width:bounds.width,height:bounds.height};
  const camera=sampleResearchCamera(q,width,height,reduced,window.innerWidth<=620,contentFrame),viewport=cameraLayer;
  viewport.hidden=!camera.visible;
  viewport.style.clipPath=`inset(${camera.clip.top}px ${Math.max(0,width-camera.clip.right)}px ${Math.max(0,height-camera.clip.bottom)}px ${camera.clip.left}px)`;
  $('research-kit-image').style.transform=`translate3d(${camera.x}px,${camera.y}px,0) scale(${camera.scale})`;
  const label=$('research-clean-label'),region=researchKitRegions.label;
  label.hidden=camera.labelBlend<=0;label.style.opacity=camera.labelBlend;
  label.style.transform=`translate3d(${camera.x+region.x*camera.scale}px,${camera.y+region.y*camera.scale}px,0) scale(${camera.scale})`;
  root.dataset.researchCamera=camera.from===camera.to?camera.to:`${camera.from}-to-${camera.to}`;
  const delay=index===0||index===6?.015:index===5?.52:.35;
  const t=reduced?1:phase(local,delay,index===5?.86:.75),panel=panels[index],copy=panel.querySelector('.research-data');
  const depart=reduced||index===6?1:1-phase(local,.86,.99),reveal=t*depart;
  if(copy){copy.style.clipPath=`inset(0 ${(1-reveal)*100}% 0 0)`;copy.style.transform=`translateX(${(1-t)*16}px)`;copy.inert=reveal<.24}
  if(index===0){panel.style.clipPath=`inset(0 0 ${(1-depart)*100}% 0)`}
  if(index===0){
   all('[data-flow-node]').forEach(e=>{const n=+e.dataset.flowNode,p=phase(t,n*.035,.34+n*.035);e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=`translateY(${(1-p)*13}px)`});
   all('[data-flow-link]').forEach(e=>{
    const i=+e.dataset.flowLink,p=phase(t,.04+i*.035,.4+i*.035),remaining=(1-p)*100;
    e.style.clipPath=e.dataset.flowDirection==='left'?`inset(0 0 0 ${remaining}%)`:e.dataset.flowDirection==='down'?`inset(0 0 ${remaining}% 0)`:`inset(0 ${remaining}% 0 0)`;
   });
   all('[data-flow-branch]').forEach(e=>{const p=phase(t,.48+(+e.dataset.flowBranch)*.04,.85);e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`});
   all('.research-branch-links').forEach(e=>e.style.clipPath=`inset(${(1-phase(t,.53,.85))*100}% 0 0 0)`);
   all('.research-flow-key').forEach(e=>e.style.clipPath=`inset(0 ${(1-phase(t,.56,.92))*100}% 0 0)`);
  }else if(index===1){
   all('[data-recipe-line]').forEach((e,i)=>{const p=reduced?1:phase(local,.34+i*.025,.63+i*.025);e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=`translateX(${(1-p)*18}px)`});
  }else if(index===3){
   all('[data-bitterness-result]').forEach((e,i)=>{const p=phase(t,.03+i*.09,.65+i*.08);e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=reduced?'none':`perspective(600px) rotateX(${(1-p)*-65}deg) scale(${1+Math.sin(p*Math.PI)*.055})`});
  }else if(index===5){
   panel.querySelector('.research-art').style.clipPath=`inset(0 ${(1-reveal)*100}% 0 0)`;
   const width=+$('research-thickness').value;
   thick.style.strokeDashoffset=thinShadow.style.strokeDashoffset=thinLight.style.strokeDashoffset=1-phase(t,.04,.85);
   thinShadow.style.strokeWidth=String(24*width);thinLight.style.strokeWidth=String(15*width);
   panel.querySelector('.research-measure-line').style.strokeDashoffset=1-phase(t,.35,.9);
  }else if(index===6){
   panel.querySelector('.research-art').style.clipPath=`inset(0 ${(1-t)*100}% 0 0)`;
   const wet=+$('research-pore-progress').value/100*phase(t,.2,.95);
   scaleAt($('research-normal-section'),159,192,phase(t,.03,.55));scaleAt($('research-porous-section'),480,192,phase(t,.08,.6));
   holes.forEach(({e,i,r})=>{const p=phase(t,.13+i*.006,.75);attr(e,'rx',r*p*1.4);attr(e,'ry',r*p)});
   water.forEach((e,i)=>e.style.strokeDashoffset=1-clamp(wet*(1.15-i*.04)));
   attr($('research-normal-water').firstElementChild,'stroke-width',wet*12);
   panel.querySelector('.research-water-arrow').style.strokeDashoffset=1-phase(t,.2,.7);
  }
 }
 root.researchScene={steps:panels.length,timelineWeight:panels.length*.8,stopAt:step=>researchTourStops[step]/panels.length,paint,needsFrame(){return false}};
})();
