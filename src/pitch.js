(() => {
 'use strict';
 const root=document.getElementById('pitch-story');if(!root)return;
 const $=id=>document.getElementById(id), $$=(s,within=root)=>[...within.querySelectorAll(s)];
 const scenes=$$('.pitch-scene'),count=scenes.length,NS='http://www.w3.org/2000/svg';
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const ease=t=>{t=clamp(t);return 1-Math.pow(1-t,3)};
 const phase=(q,a=0,b=.6)=>ease((q-a)/(b-a));
 const lerp=(a,b,t)=>a+(b-a)*t;
 const transform=(e,v)=>{e.style.transform=v};
 const svg=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.appendChild(e);return e};
 const attr=(e,k,v)=>e.setAttribute(k,v);
 const cash=n=>`${n<0?'−':''}$${Math.abs(n).toFixed(2)}`;
 const comma=n=>Math.round(n).toLocaleString('en-US');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let reduced=motion.matches,active=-1,progress=0,frame=0,visible=false,lastPaint=0,playing=false,playStart=0,playFrom=0;
 let forcedEntry=-1,entryStart=0,productChoice=0,productTime=-1,tasteChoice=0,tasteTime=-1,waterTime=-1,deliveryTime=-1,deliveries=0,growerChoice=0;
 let waterValue=60,cupsValue=100000,lastFrame=0;
 const headings=scenes.map(scene=>{
  const heading=scene.querySelector('[data-lettering]');
  const wrap=node=>{[...node.childNodes].forEach(child=>{
   if(child.nodeType===3){const fragment=document.createDocumentFragment();child.textContent.split(/(\s+)/).forEach(token=>{
    if(!token.trim()){fragment.appendChild(document.createTextNode(token));return}
    const window=document.createElement('span'),word=document.createElement('span');window.className='word-window';word.className='word-piece';word.textContent=token;window.appendChild(word);fragment.appendChild(window);
   });child.replaceWith(fragment)}else if(child.nodeType===1)wrap(child);
  })};wrap(heading);return $$('.word-piece',heading);
 });
 const chapterButtons=scenes.map((s,i)=>{const b=document.createElement('button');b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${s.dataset.chapter}`;b.addEventListener('click',()=>{go(i);toggleChapters(false)});$('pitch-chapters').appendChild(b);return b});
 function toggleChapters(open){$('pitch-chapters').hidden=!open;$('pitch-chapters-toggle').setAttribute('aria-expanded',String(open))}
 $('pitch-chapters-toggle').addEventListener('click',()=>toggleChapters($('pitch-chapters').hidden));
 document.addEventListener('click',e=>{if(!e.target.closest('#pitch-chapters,#pitch-chapters-toggle'))toggleChapters(false)});

 // Every illustration is built locally from SVG/HTML. No external renderer or assets.
 const coverOrbit=[],closingOrbit=[],cupSlices=[];
 $$('[data-orbit]').forEach(group=>{
  const closing=group.dataset.orbit==='closing',items=closing?closingOrbit:coverOrbit;
  for(let i=0;i<40;i++){const a=i/40*Math.PI*2;const e=svg('use',{href:'#pitch-seed',x:-7,y:-10,width:14,height:20,fill:'currentColor',color:i%3?'#e9b23c':'#ff8130'},group);items.push({e,a,r:closing?166:238,cx:300,cy:closing?190:300})}
 });
 const cupGroup=$$('.cover-cup-pieces')[0];
 for(let i=0;i<12;i++){
  const clip=svg('clipPath',{id:`cover-cup-strip-${i}`},cupGroup);svg('rect',{x:135+i*28,y:92,width:28.4,height:420},clip);
  const g=svg('g',{'clip-path':`url(#cover-cup-strip-${i})`},cupGroup);svg('use',{href:'#pitch-cup',x:135,y:92,width:330,height:420},g);cupSlices.push(g);
 }
 const completeCoverCup=svg('use',{href:'#pitch-cup',x:135,y:92,width:330,height:420},cupGroup);
 const formulaGrains=[];
 for(let i=0;i<100;i++){
  const ring=i<60?0:1,index=ring?i-60:i,total=ring?40:60,a=index/total*Math.PI*2-Math.PI/2,r=ring?174:224;
  const e=svg('use',{href:'#pitch-seed',x:-7,y:-10,width:14,height:20,class:`formula-grain${i>=85?' other':i%2?' millet':''}`},$('formula-grains'));
  formulaGrains.push({e,a,r});
 }
 const channels=[
  'M365 205C390 203 391 253 430 243S465 199 490 218S527 267 593 248',
  'M400 130C414 172 460 151 460 199S431 276 459 297S490 315 489 352',
  'M566 150C535 181 529 187 524 212S483 236 487 270S528 301 560 325',
  'M367 292C409 286 406 270 430 275S457 298 488 276',
  'M468 126C485 159 479 190 493 215',
  'M594 210C561 226 548 256 520 261'
 ];
 const waterChannels=[],poreChannels=[];
 channels.forEach((d,i)=>{const pore=svg('path',{d,class:'pore-channel',pathLength:1},$('pore-network'));pore.style.strokeDasharray='1';poreChannels.push(pore);const water=svg('path',{d,class:'water-channel',pathLength:1},$('porous-water'));waterChannels.push(water)});
 const waterBeads=[];
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const e=svg('circle',{r:i%3?3:4,fill:'#70aaa8'},$('water-beads'));waterBeads.push({e,a})}
 const moleculeNodes=[],moleculeLines=[];
 for(let i=0;i<9;i++){
  const a=i/9*Math.PI*2,x=300+Math.cos(a)*190,y=130+Math.sin(a)*90;
  if(i){const prev=moleculeNodes[i-1];const line=svg('path',{d:`M${prev.x} ${prev.y}L${x} ${y}`,fill:'none',stroke:'#dcbf82','stroke-width':1.5,pathLength:1,'stroke-dasharray':1},$('taste-network'));moleculeLines.push(line)}
  const e=svg('circle',{cx:x,cy:y,r:8+i%3*4,fill:i%2?'#fbc644':'#f6b579'},$('taste-network'));moleculeNodes.push({e,x,y});
 }
 for(let i=0;i<11;i++){let d='';for(let x=8;x<=172;x+=3)d+=`${x===8?'M':'L'}${x} ${14+i*10+Math.sin(x*.17+i)*4} `;svg('path',{d,fill:'none',stroke:'#f5d78c','stroke-width':5,'stroke-linecap':'round',pathLength:1,'stroke-dasharray':1},$('shelf-noodles'))}
 const coins=[];
 for(let i=0;i<10;i++){const pile=document.createElement('div');pile.className='coin-pile';$('coin-rail').appendChild(pile);for(let j=0;j<7+(i%4);j++){const coin=document.createElement('i');pile.appendChild(coin);coins.push({e:coin,i,j})}}
 const students=[];
 for(let i=0;i<100;i++){const e=document.createElement('i');if(i<23)e.className='affected';$('student-grid').appendChild(e);students.push(e)}
 const pantry=[];
 for(let i=0;i<20;i++){const e=document.createElement('div');e.className='pantry-token';$('pantry-grid').appendChild(e);pantry.push(e)}
 const siloGrains=[];
 for(let i=0;i<150;i++){const e=document.createElement('i'),x=(i*67.13)%95,y=(i*37.71)%94;e.style.left=`${x}%`;e.style.bottom=`${y}%`;$('silo-grains').appendChild(e);siloGrains.push({e,x,y,angle:i*137.5%360})}
 const plants=[];
 for(let i=0;i<7;i++){
  const x=70+i*76,top=140+Math.sin(i*2.3)*42,headX=x+(i-3)*6,g=svg('g',{},$('millet-field'));
  const stem=svg('path',{d:`M${x} 410Q${x-15} 305 ${headX} ${top}`,class:'millet-stem',pathLength:1},g),leaves=[];
  for(let j=0;j<3;j++){const y=350-j*40,side=j%2?-1:1;leaves.push(svg('path',{d:`M${x} ${y}Q${x+side*52} ${y-2} ${x+side*60} ${y-49}Q${x+side*11} ${y-48} ${x} ${y}`,class:'millet-leaf'},g))}
  const seeds=[];
  for(let j=0;j<20;j++){const a=j*2.399,r=5+Math.sqrt(j)*3;const sx=headX+Math.cos(a)*r,sy=top-14+(j-10)*3;const seed=svg('use',{href:'#pitch-seed',x:sx-5,y:sy-7,width:10,height:14,class:'millet-head'},g);seeds.push({e:seed,x:sx,y:sy})}
  plants.push({g,stem,leaves,seeds,i,x,top});
 }
 // Local interaction state remains independent of the scroll animation.
 const productCopy=[
  ['THE FORMULATION TARGET','Sorghum + millet, at the center.','85 of these 100 grains represent the proposed sorghum–millet share of the dry formulation. The remaining 15% is other ingredients.'],
  ['THE PROCESS CONCEPT','Steam first. Air-dry next.','Pre-steaming and air-drying are the proposed route to a non-fried noodle. Texture, rehydration, and process settings still need prototype testing.'],
  ['THE STUDENT RITUAL','A kettle. A cup. That’s it.','Designed for hot-water preparation without a stove or pot. Five minutes is the development target, not a measured cook-time result.']
 ];
 $$('[data-product]').forEach(button=>button.addEventListener('click',()=>{productChoice=+button.dataset.product;productTime=performance.now();$$('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const copy=productCopy[productChoice];$('product-kicker').textContent=copy[0];$('product-headline').textContent=copy[1];$('product-description').textContent=copy[2];$$('.product-visual>svg')[0].setAttribute('aria-label',['One hundred grains arrange into the proposed 85 percent grain formulation','Grains form rows beneath drawn steam paths, illustrating the proposed non-fried process','Grains form a bowl beneath a water droplet, illustrating hot-water preparation'][productChoice]);request()}));
 $('deadline-time').addEventListener('input',e=>{const minute=47+Number(e.target.value);$('deadline-label').textContent=`11:${minute} PM`;$('deadline-remaining').textContent=minute===59?'Deadline reached':`${59-minute} minute${59-minute===1?'':'s'} left`;request()});
 $('hydration-progress').addEventListener('input',e=>{waterTime=-1;waterValue=+e.target.value;$('hydration-label').textContent=`${waterValue}%`;request()});
 $('water-replay').addEventListener('click',()=>{waterTime=performance.now();request()});
 const tasteCopy=[
  {number:'57<span>%</span>',unit:'less bitter',context:'DECK-REPORTED SORGHUM COMPARISON',detail:'A tannin-free sorghum variety in the supplied deck’s taste-study comparison.',source:'Related sorghum research ↗',url:'https://researchhub.buan.ac.bw/handle/13049/502',status:'The exact 57% comparison needs its original citation.'},
  {number:'30<span>%</span>',unit:'less bitter',context:'PUBLISHED SENSORY STUDY · 2019',detail:'About 30% less bitterness with NaCl in simple chicken broths containing L-tryptophan.',source:'Read the broth study ↗',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6542971/',status:'Model broth result, not a Sorami result or a salt-dose recommendation.'},
  {number:'40<span>%+</span>',unit:'lower receptor response',context:'PUBLISHED CELL-BASED STUDY · 2024',detail:'At least 40% inhibition of seven bitter receptors after treatment with an AMP-rich yeast extract.',source:'Read the receptor study ↗',url:'https://www.sciencedirect.com/science/article/pii/S0963996924006665',status:'A cell assay measures receptor activity, not how bitter a person finds a cup.'}
 ];
 $$('[data-taste]').forEach(button=>button.addEventListener('click',()=>{tasteChoice=+button.dataset.taste;tasteTime=performance.now();const data=tasteCopy[tasteChoice];$$('[data-taste]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('taste-number').innerHTML=data.number;$('taste-unit').textContent=data.unit;$('taste-context').textContent=data.context;$('taste-detail').textContent=data.detail;$('taste-source').textContent=data.source;$('taste-source').href=data.url;$('taste-status').textContent=data.status;request()}));
 const marketCopy=['Grain-based noodles already exist. Convenience is where Sorami aims to compete.','The deck uses $6.50 as a premium benchmark; it is not a live price survey.','A familiar format. A more purposeful ingredient.'];
 $$('[data-market]').forEach(button=>button.addEventListener('click',()=>{$$('[data-market]').forEach(b=>{b.setAttribute('aria-pressed',String(b===button));b.classList.toggle('is-selected',b===button)});$('market-insight').textContent=marketCopy[+button.dataset.market]}));
 function economics(){
  const price=+$('cup-price').value,cost=+$('cup-cost').value,pantry=$('pantry-toggle').checked?cost/20:0,remaining=price-1.2-cost-pantry;
  $('cup-price-label').textContent=$('money-price').textContent=cash(price);$('cup-cost-label').textContent=$('money-cost').textContent=cash(cost);$('money-margin').textContent=cash(remaining);
  $('margin-caption').textContent=pantry?'LEFT AFTER PANTRY ALLOCATION':'LEFT PER CUP';$('margin-note').textContent=pantry?`${cash(pantry)} allocated per sale. Before overhead and distribution.`:'Before overhead, distribution, and any pantry contribution.';
  $$('.money-result')[0].classList.toggle('is-negative',remaining<0);request();
 }
 ['cup-price','cup-cost','pantry-toggle'].forEach(id=>$(id).addEventListener('input',economics));
 $('economics-reset').addEventListener('click',()=>{$('cup-price').value='3.99';$('cup-cost').value='1.60';$('pantry-toggle').checked=false;economics()});
 $('pantry-deliver').addEventListener('click',()=>{deliveryTime=performance.now();deliveries++;$('pantry-result').textContent=`${deliveries}`;$('pantry-message').textContent=`illustrative pantry cup${deliveries===1?'':'s'} funded by ${deliveries*20} sales at the deck’s assumptions`;$('pantry-deliver').querySelector('span').textContent='Demonstrate another 20 + 1';request()});
 $('cups-sold').addEventListener('input',e=>{cupsValue=+e.target.value;$('cups-sold-label').textContent=`${comma(cupsValue)} cups`;$('grain-tonnes').textContent=(cupsValue*47/1e6).toFixed(1);request()});
 const routeCopy=['Start where students already grab a late-night snack.','Extend the same just-water ritual to vending locations.','Explore campus dining as the next distribution channel.'];
 $$('[data-route]').forEach(b=>b.addEventListener('click',()=>{$$('[data-route]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('route-detail').textContent=routeCopy[+b.dataset.route]}));
 const growerCopy=['Turn an everyday convenience food into a new use for millet.','Build fair farmer relationships before making sourcing claims.','Explore how reliable grain demand could create value for growers.'];
 $$('[data-grower]').forEach(b=>b.addEventListener('click',()=>{growerChoice=+b.dataset.grower;$$('[data-grower]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('grower-detail').textContent=growerCopy[growerChoice];request()}));

 // Choreography: scroll draws paths, unfolds planes, packs grains and drops coins.
 function orbit(items,q,time){items.forEach(({e,a,r,cx,cy},i)=>{
  const t=phase(q,.03+i*.005,.45+i*.005),angle=a+(1-t)*2.8,rr=r+(1-t)*160;
  attr(e,'transform',`translate(${cx+Math.cos(angle)*rr} ${cy+Math.sin(angle)*rr}) rotate(${angle*180/Math.PI+90+(1-t)*200}) scale(${t})`);
 })}
 function common(scene,q){
  headings[active].forEach((word,i)=>{const t=phase(q,.01+i*.012,.27+i*.012);transform(word,`translateY(${(1-t)*120}%) rotate(${(1-t)*7}deg)`)});
  const eyebrow=scene.querySelector('.pitch-eyebrow');if(eyebrow)eyebrow.style.clipPath=`inset(0 ${(1-phase(q,0,.28))*100}% 0 0)`;
  $$('.pitch-draw',scene).forEach((e,i)=>e.style.strokeDashoffset=1-phase(q,.08+i*.02,.68));
 }
 function paint(q,now){
  const scene=scenes[active];if(!scene)return;common(scene,q);root.style.setProperty('--scene-progress',q);
  if(active===0){
   orbit(coverOrbit,q,now);cupSlices.forEach((e,i)=>{const t=phase(q,.05+i*.02,.47+i*.018);attr(e,'transform',`translate(${Math.sin(i*2.3)*(1-t)*150} ${(1-t)*(i%2?-450:450)})`);e.style.visibility=q>=.72?'hidden':'visible'});completeCoverCup.style.visibility=q>=.72?'visible':'hidden';
   transform($$('.cover-halo')[0],`scale(${phase(q,0,.55)})`);$$('.cover-halo')[0].style.transformOrigin='300px 300px';
   const t=phase(q,.3,.66);transform($$('.pitch-stamp')[0],`rotate(${lerp(-19,-3,t)}deg) scale(${t*(1+Math.sin(t*Math.PI)*.14)})`);
  }else if(active===1){
   const t=phase(q,.06,.56);transform($$('.laptop-screen')[0],`rotateX(${(1-t)*-88}deg)`);transform($$('.laptop-base')[0],`scaleX(${phase(q,0,.3)})`);
   transform($$('.desk-cup')[0],`translate(${(1-phase(q,.2,.65))*180}px,${(1-phase(q,.2,.65))*-160}px) rotate(${8+(1-t)*80}deg) scale(${phase(q,.1,.5)})`);
   transform($$('.desk-note')[0],`translateY(${(1-phase(q,.2,.65))*200}px) rotate(${-7-(1-phase(q,.2,.65))*28}deg)`);
   transform($$('.desk-line')[0],`scaleX(${phase(q,.05,.5)})`);$$('.code-lines i').forEach((e,i)=>transform(e,`scaleX(${phase(q,.24+i*.05,.52+i*.04)})`));
   transform($$('.screen-rule')[0],`scaleX(${clamp((12-+$('deadline-time').value)/12)})`);transform($$('.desk-orbit')[0],`scale(${phase(q,0,.5)*.9})`);
  }else if(active===2){
   const it=reduced?1:productTime<0?1:phase((now-productTime)/1000,0,.85);
   formulaGrains.forEach(({e,a,r},i)=>{const t=phase(q,i*.002,.43+i*.002),rr=r+(1-t)*180;let x=300+Math.cos(a+(1-t)*3)*rr,y=300+Math.sin(a+(1-t)*3)*rr;
    if(productChoice===1){x=lerp(x,140+(i%20)*17,it);y=lerp(y,355+Math.floor(i/20)*13,it)}
    if(productChoice===2){x=lerp(x,300+Math.cos(a)*r*.74,it);y=lerp(y,350+Math.sin(a)*r*.3,it)}
    attr(e,'transform',`translate(${x} ${y}) rotate(${a*180/Math.PI+90+(1-t)*190}) scale(${t})`);
   });
   $('formula-number').style.visibility=productChoice?'hidden':'visible';$('formula-caption').style.visibility=productChoice?'hidden':'visible';$('formula-steam').style.visibility=productChoice===1?'visible':'hidden';$('formula-water').style.visibility=productChoice===2?'visible':'hidden';
   transform($('formula-water'),`translateY(${(1-it)*-120}px) scale(${it})`);$('formula-water').style.transformOrigin='300px 270px';$$('#formula-steam path').forEach(e=>{e.style.strokeDasharray='1';e.style.strokeDashoffset=1-it});
  }else if(active===3){
   $$('.strand-circle').forEach((e,i)=>transform(e,`scale(${phase(q,.04+i*.07,.45+i*.07)})`));
   poreChannels.forEach((e,i)=>e.style.strokeDashoffset=1-phase(q,.15+i*.02,.62));
   if(waterTime>=0){waterValue=reduced?100:Math.round(clamp((now-waterTime)/2600)*100);$('hydration-progress').value=String(waterValue);$('hydration-label').textContent=`${waterValue}%`;if(waterValue===100)waterTime=-1}
   const wet=waterValue/100*phase(q,.25,.72);waterChannels.forEach((e,i)=>e.style.strokeDashoffset=1-clamp(wet*(1.1-i*.07)));
   attr($('dense-water').firstElementChild,'stroke-width',wet*23);
   waterBeads.forEach(({e,a},i)=>{const t=phase(q,.2,.6),r=145-(i%2?wet*15:wet*25);attr(e,'cx',(i<9?160:480)+Math.cos(a)*r);attr(e,'cy',238+Math.sin(a)*r);attr(e,'transform',`translate(0 ${(1-t)*-120}) scale(${t})`)});
  }else if(active===4){
   const interaction=reduced?1:tasteTime<0?1:phase((now-tasteTime)/1000,0,.65);
   moleculeLines.forEach((e,i)=>e.style.strokeDashoffset=1-phase(q,.08+i*.03,.58+i*.02));
   moleculeNodes.forEach(({e,x,y},i)=>{const t=phase(q,.12+i*.025,.6+i*.015);attr(e,'transform',`translate(${(1-t)*(300-x)} ${(1-t)*(130-y)}) scale(${t})`);attr(e,'fill',(i+tasteChoice)%2?'#fbc644':'#ff8e42')});
   const t=phase(q,.21,.63)*interaction;transform($('taste-number'),`perspective(500px) rotateX(${(1-t)*-85}deg) scaleY(${.4+t*.6})`);
  }else if(active===5){
   $$('[data-market]').forEach((e,i)=>{const t=phase(q,.03+i*.1,.48+i*.1);transform(e,`translateY(${(1-t)*160}px) rotateY(${(1-t)*(i-1)*45}deg) rotateX(${(1-t)*-65}deg)`)});
   $$('#shelf-noodles path').forEach((e,i)=>e.style.strokeDashoffset=1-phase(q,.1+i*.025,.5+i*.02));
  }else if(active===6){
   coins.forEach(({e,i,j})=>{const t=phase(q,.04+j*.025+i*.015,.35+j*.025+i*.015);transform(e,`translateY(${(1-t)*-110}px) rotateY(${(1-t)*180}deg) scale(${t})`)});
   const t=phase(q,.25,.65);$$('.money-result')[0].style.clipPath=`inset(${(1-t)*100}% 0 0)`;
   $$('.money-equation>div').forEach((e,i)=>transform(e,`translateY(${(1-phase(q,.1+i*.08,.4+i*.08))*70}px)`));
  }else if(active===7){
   students.forEach((e,i)=>{const t=phase(q,(i%20)*.012+Math.floor(i/20)*.025,.3+(i%20)*.012+Math.floor(i/20)*.025);transform(e,`translateY(${(1-t)*-55}px) scale(${t})`)});
   const elapsed=deliveryTime<0?9999:now-deliveryTime,delivery=clamp(elapsed/1450);
   pantry.forEach((e,i)=>{const t=phase(q,.12+i*.018,.42+i*.018),send=elapsed<1450&&i===19&&!reduced?Math.sin(delivery*Math.PI):0;transform(e,`translate(${send*70}px,${(1-t)*-170-send*85}px) rotate(${(1-t)*60+send*40}deg) scale(${t*(1-send*.35)})`);e.classList.toggle('delivered',deliveries>0&&i===19)});
   if(elapsed>=1450)deliveryTime=-1;
  }else if(active===8){
   const t=phase(q,.05,.5);transform($$('.silo-cap')[0],`translateY(${(1-t)*-100}px) rotate(${(1-t)*-15}deg)`);$$('.silo-window')[0].style.clipPath=`inset(${(1-t)*100}% 0 0 round 8px 8px 38px 38px)`;
   const level=cupsValue/500000;transform($('silo-level'),`scaleY(${level*phase(q,.15,.65)})`);
   siloGrains.forEach(({e,y,angle},i)=>{const drop=phase(q,.1+i*.001,.5+i*.001);e.style.visibility=y<level*100?'visible':'hidden';transform(e,`translateY(${(1-drop)*-300}px) rotate(${angle+(1-drop)*120}deg) scale(${drop})`)});
   transform($$('.silo-label')[0],`rotate(${-4-(1-phase(q,.25,.65))*28}deg) scale(${phase(q,.25,.65)})`);
  }else if(active===9){
   plants.forEach(({stem,leaves,seeds,i,g,x,top})=>{stem.style.strokeDashoffset=1-phase(q,.02+i*.035,.43+i*.03);leaves.forEach((e,j)=>transform(e,`scale(${phase(q,.16+i*.025+j*.04,.5+i*.025+j*.025)}) rotate(${(1-phase(q,.16,.6))*-35}deg)`));seeds.forEach(({e},j)=>{const t=phase(q,.2+i*.025+j*.004,.55+i*.025+j*.004);attr(e,'transform',`translate(${(1-t)*(3-i)*20} ${(1-t)*-120}) scale(${t})`)});attr(g,'transform',`rotate(${reduced?0:Math.sin(now*.00065+i)*.75} ${x} 410)`)});
   $('grower-connections').style.visibility=growerChoice===1?'visible':'hidden';
  }else if(active===10){
   orbit(closingOrbit,q,now);const t=phase(q,.08,.6);transform($$('.closing-cup')[0],`translateY(${(1-t)*-160}px) rotate(${(1-t)*20}deg) scale(${.6+t*.4})`);$$('.closing-cup')[0].style.transformOrigin='300px 340px';
  }
 }
 function measured(){const rect=root.getBoundingClientRect(),distance=root.offsetHeight-window.innerHeight;return clamp(distance>0?-rect.top/distance:0)*count}
 function sceneAt(value,now){const index=Math.min(count-1,Math.floor(value));if(index!==active){active=index;if(forcedEntry!==index)forcedEntry=-1;scenes.forEach((s,i)=>{s.hidden=i!==index;s.inert=i!==index});chapterButtons.forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});$('pitch-count').textContent=`${String(index+1).padStart(2,'0')} / ${count}`;$('pitch-current-title').textContent=scenes[index].dataset.chapter;$('pitch-prev').disabled=index===0;$('pitch-next').disabled=index===count-1;}
  let local=clamp(value-index);if(reduced)local=1;else if(forcedEntry===index){local=Math.min(local,(now-entryStart)/1600);if(now-entryStart>=1600)forcedEntry=-1}
  paint(local,now);
 }
 function tick(now){frame=0;if(document.hidden||!visible)return;
  if(playing){progress=Math.min(count-.01,playFrom+(now-playStart)/7600);scroll(progress);if(progress>=count-.01)stop()}
  else progress=measured();
  if(now-lastPaint>25||Math.abs(progress-lastFrame)>.002){lastPaint=now;lastFrame=progress;sceneAt(progress,now);root.style.setProperty('--deck-progress',progress/count);if(document.activeElement!==$('pitch-progress'))$('pitch-progress').value=Math.min(1099,Math.round(progress*100));}
  const running=playing||forcedEntry>=0||waterTime>=0||deliveryTime>=0||(!reduced&&(active===9||now-productTime<1000||now-tasteTime<800));
  if(running)frame=requestAnimationFrame(tick);
 }
 function request(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
 function scroll(value){const top=root.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:top+value/count*(root.offsetHeight-window.innerHeight),behavior:'instant'})}
 function go(index){stop();forcedEntry=reduced?-1:index;entryStart=performance.now();visible=true;scroll(index+.79);request()}
 $$('.pitch-skip,.assembly-to-pitch',document).forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(0)}));
 function stop(){playing=false;$('pitch-play').setAttribute('aria-pressed','false');$('pitch-play').textContent='▶ Play story'}
 $('pitch-prev').addEventListener('click',()=>go(Math.max(0,active-1)));$('pitch-next').addEventListener('click',()=>go(Math.min(count-1,active+1)));
 $('pitch-progress').addEventListener('input',e=>{stop();forcedEntry=-1;scroll(+e.target.value/100);request()});
 $('pitch-play').addEventListener('click',()=>{if(playing){stop();return}reduced=false;forcedEntry=-1;playFrom=measured();if(playFrom>=count-.2)playFrom=0;playStart=performance.now();playing=true;$('pitch-play').setAttribute('aria-pressed','true');$('pitch-play').textContent='Ⅱ Pause story';request()});
 $('pitch-restart').addEventListener('click',()=>{stop();$('assembly-replay').click()});
 // Inputs and chapter menus pause the guided flow, so exploration never fights scrolling.
 root.addEventListener('pointerdown',e=>{if(e.target.closest('input,button,a')&&e.target.id!=='pitch-play')stop()});
 root.addEventListener('input',stop);
 root.addEventListener('click',e=>{if(e.target.closest('button,a')&&!e.target.closest('#pitch-play'))stop()});
 window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();else stop()}).observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else request()});
 document.addEventListener('keydown',e=>{if(!visible||root.getBoundingClientRect().top>window.innerHeight*.3||$('pitch-evidence-dialog').open)return;if(e.key==='Escape'){stop();toggleChapters(false)}if(['INPUT','SELECT','TEXTAREA','BUTTON','A'].includes(document.activeElement.tagName))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(clamp(active+(e.key==='ArrowRight'?1:-1),0,count-1))}else if(e.key===' '){e.preventDefault();$('pitch-play').click()}});
 const dialog=$('pitch-evidence-dialog');$('pitch-evidence').addEventListener('click',()=>{stop();dialog.showModal()});$('evidence-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 motion.addEventListener('change',()=>{reduced=motion.matches;forcedEntry=-1;stop();request()});
 // Render a useful first frame before the observer fires; no empty stage on load.
 sceneAt(0,performance.now());economics();
})();
