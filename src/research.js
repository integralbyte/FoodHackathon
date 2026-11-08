/* Proposed process overview, followed by three mechanism illustrations. */
(() => {
 'use strict';
 const root=document.querySelector('.research-scene');if(!root)return;
 const data=/*__RESEARCH_DATA__*/;
 const $=id=>document.getElementById(id),all=s=>[...root.querySelectorAll(s)],NS='http://www.w3.org/2000/svg';
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>1-(1-clamp(x))**3,phase=(x,a=0,b=1)=>ease((x-a)/(b-a));
 const attr=(e,k,v)=>e.setAttribute(k,String(v));
 const svg=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>attr(e,k,v));parent.appendChild(e);return e};
 const panels=all('[data-research-panel]'),nav=all('[data-research-step]'),detailPanels=all('[data-research-details]'),dialog=$('research-details');
 let active=-1,entered=0;
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
 const particles=[],brothNoodles=[],steam=[],umami=[];
 for(let i=0;i<21;i++){
  const e=svg('path',{d:'M-5-3 1-6 6-1 4 5-3 4Z',class:'research-salt-crystal'},$('research-taste-particles'));
  particles.push({e,i,x:137+i*37%337,y:73+i*19%58});
 }
 for(let i=0;i<8;i++){
  let d='';for(let x=127;x<=494;x+=5)d+=`${x===127?'M':'L'}${x} ${227+i*14+Math.sin(x*.057+i)*5}`;
  brothNoodles.push(svg('path',{d,class:'research-broth-noodle',pathLength:1},$('research-broth-noodles')));
 }
 for(let i=0;i<3;i++)steam.push(svg('path',{d:`M${236+i*73} 173q-21-29 0-54t0-43`,class:'research-vapour',pathLength:1},$('research-broth-steam')));
 for(let i=0;i<15;i++){
  const a=i/15*Math.PI*2;
  umami.push({e:svg('ellipse',{rx:5,ry:3,fill:'#8a2636'},$('research-umami-ring')),a});
 }
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
  const index=Math.min(panels.length-1,Math.floor(clamp(q)*panels.length)),local=clamp(q*panels.length-index);
  if(index!==active){
   active=index;entered=now;root.dataset.researchStep=String(index);root.closest('.pitch-scenes').scrollTop=0;
   panels.forEach((e,i)=>{e.hidden=i!==index;e.inert=i!==index});detailPanels.forEach((e,i)=>e.hidden=i!==index);
   nav.forEach((e,i)=>e.setAttribute('aria-pressed',String(i===index)));$('research-details-title').textContent=data.steps[index].title;
  }
  const t=reduced?1:Math.min(phase(local,.015,.75),phase((now-entered)/1000,0,.8)),panel=panels[index],copy=panel.querySelector('.research-data');
  copy.style.clipPath=`inset(0 ${(1-phase(t,.03,.6))*100}% 0 0)`;copy.style.transform=`translateX(${(1-phase(t,.03,.6))*16}px)`;copy.inert=t<.24;
  if(index===0){
   all('[data-flow-node]').forEach(e=>{const n=+e.dataset.flowNode,p=phase(t,n*.035,.34+n*.035);e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=`translateY(${(1-p)*13}px)`});
   all('[data-flow-link]').forEach(e=>{
    const i=+e.dataset.flowLink,p=phase(t,.04+i*.035,.4+i*.035),remaining=(1-p)*100;
    e.style.clipPath=e.dataset.flowDirection==='left'?`inset(0 0 0 ${remaining}%)`:e.dataset.flowDirection==='down'?`inset(0 0 ${remaining}% 0)`:`inset(0 ${remaining}% 0 0)`;
   });
   all('[data-flow-branch]').forEach(e=>{const p=phase(t,.48+(+e.dataset.flowBranch)*.04,.85);e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`});
   all('.research-branch-links').forEach(e=>e.style.clipPath=`inset(${(1-phase(t,.53,.85))*100}% 0 0 0)`);
  }else if(index===1){
   const build=t;
   all('[data-bitterness-result]').forEach((e,i)=>{const p=phase(t,.03+i*.09,.65+i*.08);e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=reduced?'none':`perspective(600px) rotateX(${(1-p)*-65}deg) scale(${1+Math.sin(p*Math.PI)*.055})`});
   scaleAt($('research-broth-bowl'),310,354,phase(t,.02,.65));
   panel.querySelector('.research-bowl').style.strokeDashoffset=1-phase(t,.04,.6);scaleAt(panel.querySelector('.research-broth-surface'),310,212,phase(t,.13,.65));
   particles.forEach(({e,i,x,y})=>{
    const p=phase(build,i*.004,.72+i*.008),ingredient=i%3,isYeast=ingredient===2;
    attr(e,'transform',`translate(${x} ${y+p*67}) rotate(${i*31+p*80}) scale(${p*(ingredient===1?.55:isYeast?.7:1)})`);
    e.style.fill=ingredient===0?'#fff2d2':isYeast?'#9d7436':'#dcbb65';e.dataset.ingredient=['sea-salt','msg','yeast-extract'][ingredient];
   });
   brothNoodles.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.12+i*.025,.78));steam.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.25+i*.04,.85));
   umami.forEach(({e,a},i)=>{const p=phase(build,i*.008,.7);attr(e,'cx',310+Math.cos(a)*215);attr(e,'cy',214+Math.sin(a)*67);attr(e,'transform',`translate(310 214) scale(${p}) translate(-310 -214)`)});
  }else if(index===2){
   const width=+$('research-thickness').value;
   thick.style.strokeDashoffset=thinShadow.style.strokeDashoffset=thinLight.style.strokeDashoffset=1-phase(t,.04,.85);
   thinShadow.style.strokeWidth=String(24*width);thinLight.style.strokeWidth=String(15*width);
   panel.querySelector('.research-measure-line').style.strokeDashoffset=1-phase(t,.35,.9);
  }else{
   const wet=+$('research-pore-progress').value/100*phase(t,.2,.95);
   scaleAt($('research-normal-section'),159,192,phase(t,.03,.55));scaleAt($('research-porous-section'),480,192,phase(t,.08,.6));
   holes.forEach(({e,i,r})=>{const p=phase(t,.13+i*.006,.75);attr(e,'rx',r*p*1.4);attr(e,'ry',r*p)});
   water.forEach((e,i)=>e.style.strokeDashoffset=1-clamp(wet*(1.15-i*.04)));
   attr($('research-normal-water').firstElementChild,'stroke-width',wet*12);
   panel.querySelector('.research-water-arrow').style.strokeDashoffset=1-phase(t,.2,.7);
  }
 }
 root.researchScene={steps:panels.length,timelineWeight:panels.length*.8,paint,needsFrame(now){return now-entered<900}};
})();
