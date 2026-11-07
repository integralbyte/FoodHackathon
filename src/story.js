/* Original SVG concept artwork and scroll choreography. No product physics is inferred. */
(() => {
 'use strict';
 const root=document.getElementById('cup-story');
 if(!root)return;
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
 const clamp=x=>Math.min(1,Math.max(0,x)),mix=(a,b,t)=>a+(b-a)*t;
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
 let seed=47;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const chapters=[
  {kicker:'01 / Start with the grain',title:'Two grains.\nOne new ritual.',description:'Sorghum and millet, reimagined as a familiar cup of noodles. A little convenience for grains with more to give.',status:'55 : 45 sorghum-to-millet ratio within the grain fraction · proposed'},
  {kicker:'02 / Rethink the shape',title:'Give good grains\na new shape.',description:'Our starting point: a thin, pre-cooked noodle strand. A shorter path for water, in a form people already know.',status:'Proposed process · pre-cook, shape, and dry without frying'},
  {kicker:'03 / Build the cup',title:'A new home\nfor ancient grains.',description:'The noodle block settles into a familiar cup. A simple format for a desk, a dorm, or wherever a kettle is close.',status:'Cup and noodle geometry are design assumptions'},
  {kicker:'04 / Bring it together',title:'Add a little\ncolour.',description:'Vegetables and seasoning bring the cup together. The recipe, texture, and flavour are still ours to develop.',status:'Illustrative toppings · final formulation to be tested'},
  {kicker:'05 / Just add the ritual',title:'Add hot water.\nKeep the heat.',description:'Pour, cover, and let the cup do its work. Heat retention is one of the design choices we can measure next.',status:'Kettle-only preparation is a design goal, not a tested result'},
  {kicker:'06 / The cup, reimagined',title:'A familiar ritual.\nReimagined.',description:'Sorghum + millet. A kettle-only cup. A five-minute target, with the engineering questions ready to test.',status:'Concept visualization · formulation and preparation time untested'}
 ];
 const particles=[];
 for(let i=0;i<112;i++){
  const type=i<58?0:1,angle=random()*Math.PI*2,radius=Math.sqrt(random()),cx=type?570:325;
  const x=cx+Math.cos(angle)*radius*(type?97:107),y=375+Math.sin(angle)*radius*107;
  const e=document.createElementNS(NS,'g'),rx=type?4+random()*2.2:7+random()*3.5,ry=rx*(.69+random()*.2);
  e.innerHTML=`<ellipse rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#${type?'millet':'sorghum'}-seed)"/><path d="M${(-rx*.5).toFixed(1)} -1q${(rx*.3).toFixed(1)} ${(-ry*.7).toFixed(1)} ${(rx*.8).toFixed(1)} ${(-ry*.35).toFixed(1)}" fill="none" stroke="${type?'#fff0bd':'#edc38a'}" stroke-width=".7" opacity=".4"/>`;
  $('grain-field').append(e);particles.push({e,x,y,tx:450+(random()-.5)*242,ty:385+(random()-.5)*60,rotation:random()*360,delay:random()*.34});
 }
 const strands=[];
 for(let row=0;row<22;row++){
  const y=-40+row*4.55;let d='';
  for(let k=0;k<=34;k++){
   const x=-141+k*8.3,base=y-14*(1-(x/145)**2),wiggle=Math.sin(k*2.45+row*.83)*5.6;
   if(!k)d=`M${x.toFixed(1)} ${(base+wiggle).toFixed(1)}`;
   else d+=`Q${(x-5.8).toFixed(1)} ${(base+(k%2?-8:8)).toFixed(1)} ${x.toFixed(1)} ${(base+wiggle).toFixed(1)}`;
  }
  const e=document.createElementNS(NS,'g');
  e.innerHTML=`<path d="${d}" fill="none" stroke="#a98241" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${row%3?'#e9c982':'#f1d493'}" stroke-width="3.1" stroke-linecap="round"/>`;
  $('noodle-strands').append(e);strands.push(e);
 }
 const toppings=[];
 for(let i=0;i<48;i++){
  const type=i%3,e=document.createElementNS(NS,'g'),a=random()*Math.PI*2,r=Math.sqrt(random());
  const tx=450+Math.cos(a)*r*141,ty=465+Math.sin(a)*r*36;
  if(type===0)e.innerHTML='<path d="M-8-6l13-2 5 6-1 10-14 2-4-6Z" fill="url(#carrot-ink)"/><path d="M-8-6l13-2 5 6-14 2Z" fill="#eab16b"/>';
  else if(type===1)e.innerHTML='<ellipse rx="8" ry="5.8" fill="#bd963b"/><ellipse cy="-2.2" rx="7.6" ry="4.7" fill="#eace70"/><path d="M-4-4q4-3 7 0" stroke="#f5e4a0" stroke-width="1.1" fill="none"/>';
  else e.innerHTML='<ellipse rx="10" ry="5.8" fill="#416c3d"/><ellipse cy="-1.5" rx="9" ry="5" fill="#85a66a"/><ellipse cy="-1.7" rx="5.5" ry="2.9" fill="#becb94"/><ellipse cy="-1.9" rx="3.4" ry="1.8" fill="#697f4b"/>';
  $('topping-field').append(e);toppings.push({e,tx,ty,x:tx+(random()-.5)*190,y:150+random()*115,rotation:(random()-.5)*280,delay:random()*.35});
 }
 let current=-1,display=0,target=0,frame=0,tour=0,tourStarted=0,tourFrom=0,staticMode=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function setChapter(index){
  if(index===current)return;current=index;const c=chapters[index];
  $('assembly-kicker').textContent=c.kicker;$('assembly-title').textContent=c.title;$('assembly-description').textContent=c.description;$('assembly-status').textContent=c.status;
  $('assembly-counter').textContent=String(index+1).padStart(2,'0')+' / 06';
  root.querySelectorAll('a[href="#cup-story"]').forEach(e=>e.addEventListener('click',()=>{stopTour();request()}));
 root.querySelectorAll('[data-story-step]').forEach((e,i)=>{if(i===index)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current')});
  $('assembly-end-link').classList.toggle('is-visible',index===5);
 }
 function paint(p){
  const s=p*5.7;root.style.setProperty('--story-progress',String(p));root.dataset.stage=String(Math.min(5,Math.floor(s+.07)));
  setChapter(Math.min(5,Math.floor(s+.07)));
  const form=smooth(.55,1.42,s),cup=smooth(1.45,2.36,s),close=smooth(4.98,5.65,s);
  for(const g of particles){const t=smooth(.4+g.delay,1.23+g.delay,s),x=mix(g.x,g.tx,t)+Math.sin(t*Math.PI)*35,y=mix(g.y,g.ty,t)-Math.sin(t*Math.PI)*58;g.e.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${g.rotation+t*170}) scale(${mix(1,.5,t)})`);g.e.style.opacity=String(1-smooth(.93+g.delay,1.45+g.delay,s));}
  $('grain-names').style.opacity=String(1-smooth(.35,.85,s));
  const cupY=(1-cup)*215,cupOpacity=smooth(1.45,1.95,s);
  for(const id of ['cup-back','cup-front']){$(id).setAttribute('transform',`translate(0 ${cupY.toFixed(2)})`);$(id).style.opacity=String(cupOpacity)}
  const fill=smooth(3.78,4.75,s);$('broth-surface').style.opacity=String(fill);
  $('noodle-block').setAttribute('transform',`translate(450 ${(mix(370,460,cup)+fill*28).toFixed(2)}) rotate(${mix(-8,0,cup).toFixed(2)}) scale(${mix(1.16,.99,cup)-fill*.035})`);$('noodle-block').style.opacity=String(smooth(.62,1.15,s));
  strands.forEach((e,i)=>{e.style.opacity=String(smooth(.60+i*.018,1.05+i*.018,s))});
  for(const g of toppings){const t=smooth(2.42+g.delay,3.27+g.delay,s);g.e.setAttribute('transform',`translate(${mix(g.x,g.tx,t).toFixed(2)} ${mix(g.y,g.ty,t).toFixed(2)}) rotate(${g.rotation*(1-t)}) scale(${mix(1.25,1,t)})`);g.e.style.opacity=String(smooth(2.05+g.delay,2.4+g.delay,s));}
  const water=smooth(3.78,4.03,s)*(1-smooth(4.75,5.03,s));$('water-pour').style.opacity=String(water);$('water-pour').setAttribute('transform',`translate(0 ${-20*(1-water)})`);
  $('steam-field').style.opacity=String(smooth(4.05,4.5,s)*(1-close)*.6);$('steam-field').setAttribute('transform',`translate(0 ${-14*smooth(4.1,4.9,s)})`);
  const lidShow=smooth(1.95,2.62,s),lidShift=smooth(3.6,4.1,s)*(1-close);$('cup-lid').style.opacity=String(lidShow);$('cup-lid').setAttribute('transform',`translate(${mix(-40,-10,close)-lidShift*105} ${mix(-226,22,close)}) rotate(${mix(-17,0,close)} 450 446)`);
  $('assembly-shadow').style.opacity=String(mix(.04,.17,cup));$('assembly-shadow').setAttribute('transform',`translate(0 ${mix(-230,0,cup)}) scale(1 ${mix(.5,1,cup)})`);
 }
 function measuredProgress(){const rect=root.getBoundingClientRect(),distance=root.offsetHeight-window.innerHeight;return distance>0?clamp(-rect.top/distance):1}
 function update(){frame=0;target=staticMode?1:measuredProgress();display+= (target-display)*.2;if(Math.abs(target-display)<.00015)display=target;paint(display);if(Math.abs(target-display)>.00015)frame=requestAnimationFrame(update)}
 function request(){if(!frame)frame=requestAnimationFrame(update)}
 function stopTour(){if(tour){cancelAnimationFrame(tour);tour=0}$('assembly-play').innerHTML='<span aria-hidden="true">▶</span> Play story';$('assembly-play').setAttribute('aria-pressed','false')}
 function enableMotion(){if(staticMode){staticMode=false;root.classList.remove('is-static');$('assembly-cue').innerHTML='Scroll to bring<br>the cup together'}}
 function scrollToProgress(p,behavior='smooth'){const top=window.scrollY+root.getBoundingClientRect().top;window.scrollTo({top:top+p*(root.offsetHeight-window.innerHeight),behavior})}
 const chapterPosition=i=>i===5?1:i/5.7;
 root.querySelectorAll('a[href="#cup-story"]').forEach(e=>e.addEventListener('click',()=>{stopTour();request()}));
 root.querySelectorAll('[data-story-step]').forEach(e=>e.addEventListener('click',()=>{stopTour();enableMotion();scrollToProgress(chapterPosition(+e.dataset.storyStep))}));
 $('assembly-play').setAttribute('aria-pressed','false');
 $('assembly-play').addEventListener('click',()=>{
  if(tour){stopTour();return}enableMotion();tourFrom=measuredProgress();if(tourFrom>.94)tourFrom=0;tourStarted=performance.now();scrollToProgress(tourFrom,'instant');
  $('assembly-play').innerHTML='<span aria-hidden="true">Ⅱ</span> Pause story';$('assembly-play').setAttribute('aria-pressed','true');
  function step(now){const elapsed=(now-tourStarted)/18000,p=clamp(tourFrom+elapsed);scrollToProgress(p,'instant');if(p<1)tour=requestAnimationFrame(step);else stopTour()}
  tour=requestAnimationFrame(step);
 });
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});
 window.addEventListener('wheel',stopTour,{passive:true});window.addEventListener('touchstart',stopTour,{passive:true});
 document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)||window.scrollY>root.offsetTop+root.offsetHeight-window.innerHeight*.4||(e.key===' '&&document.activeElement===$('assembly-play')))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stopTour();enableMotion();scrollToProgress(chapterPosition(Math.min(5,Math.max(0,current+(e.key==='ArrowRight'?1:-1)))))}else if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp','Escape',' '].includes(e.key))stopTour()});
 if(staticMode){root.classList.add('is-static');$('assembly-cue').innerHTML='Reduced motion<br>Play to animate';display=1}
 // Pages opened at a saved scroll position start in the matching assembly state.
 display=staticMode?1:measuredProgress();paint(display);request();
})();
