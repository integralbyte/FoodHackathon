/* Original procedural SVG artwork. Motion is art direction, not a physical model. */
(() => {
 'use strict';
 const root=document.getElementById('cup-story');
 if(!root)return;
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
 const clamp=x=>Math.min(1,Math.max(0,x)),mix=(a,b,t)=>a+(b-a)*t;
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
 const opacity=(e,n)=>e.style.opacity=String(n<.001?0:n);
 const transform=(e,v)=>e.setAttribute('transform',v);
 const node=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e};
 let seed=47;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const nodes=Object.fromEntries(Array.from(root.querySelectorAll('[id]'),e=>[e.id,e]));
 const n=id=>nodes[id];
 const chapters=['Sorghum and millet grains.','Forming the noodle cake.','Assembling the cup.','Adding the toppings.','Pouring the water.','Sorami cup complete.'];
 const particles=[],dust=[],strands=[],loose=[],toppings=[],seasoning=[],ripples=[],splashes=[],steam=[],bubbles=[];
 for(let i=0;i<64;i++){
  const a=i*Math.PI/32,r=i%4===0?254:250;
  node('path',{d:`M${450+Math.cos(a)*r} ${440+Math.sin(a)*r}L${450+Math.cos(a)*246} ${440+Math.sin(a)*246}`,opacity:i%4===0?.32:.16},n('orbit-ticks'));
 }
 for(let i=0;i<170;i++){
  const type=i<88?0:1,a=random()*Math.PI*2,r=Math.sqrt(random()),depth=random(),cx=type?565:326;
  const x=cx+Math.cos(a)*r*(type?99:109),y=373+Math.sin(a)*r*106;
  const e=node('g',{},n('grain-field')),rx=type?3.5+depth*3.7:5.5+depth*6,ry=rx*(.69+random()*.18);
  e.innerHTML=`<ellipse cx="1" cy="2" rx="${rx}" ry="${ry}" fill="#695532" opacity=".15"/><ellipse rx="${rx}" ry="${ry}" fill="url(#${type?'millet':'sorghum'}-seed)"/><path d="M${-rx*.45} ${-ry*.18}Q0 ${-ry*.8} ${rx*.52} ${-ry*.36}" fill="none" stroke="${type?'#fff5ce':'#f1d3a5'}" stroke-width=".8" opacity=".58"/><path d="M${-rx*.15} ${ry*.25}q${rx*.4} ${-ry*.35} ${rx*.45} ${-ry*.7}" fill="none" stroke="#74502f" stroke-width=".55" opacity=".4"/>`;
  particles.push({e,x,y,tx:450+(random()-.5)*244,ty:365+(random()-.5)*60,rotation:random()*360,delay:random()*.32,phase:random()*Math.PI*2,depth});
 }
 for(let i=0;i<50;i++){
  dust.push({e:node('circle',{r:.5+random()*1.2,fill:i%2?'#b89a5e':'#9da17b'},n('grain-dust')),x:200+random()*490,y:220+random()*360,phase:random()*6.28});
 }
 // One orthographic box projection defines every face and noodle layer.
 // u: width, v: depth, h: downward thickness. Shared corners cannot drift apart.
 // These are illustration proportions, not a measured product specification.
 const brickPoint=(u,v,h=0)=>({x:-151+235*u+65*v,y:-80+24*u+78*v+72*h});
 const polygon=points=>points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join('')+'Z';
 n('noodle-left-face').setAttribute('d',polygon([brickPoint(0,0),brickPoint(0,1),brickPoint(0,1,1),brickPoint(0,0,1)]));
 n('noodle-front-face').setAttribute('d',polygon([brickPoint(0,1),brickPoint(1,1),brickPoint(1,1,1),brickPoint(0,1,1)]));
 n('noodle-top-face').setAttribute('d',polygon([brickPoint(0,0),brickPoint(1,0),brickPoint(1,1),brickPoint(0,1)]));
 const curve=points=>{
  let d=`M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for(let k=0;k<points.length-1;k++){
   const a=points[Math.max(0,k-1)],b=points[k],c=points[k+1],e=points[Math.min(points.length-1,k+2)];
   d+=`C${(b.x+(c.x-a.x)/6).toFixed(2)} ${(b.y+(c.y-a.y)/6).toFixed(2)} ${(c.x-(e.x-b.x)/6).toFixed(2)} ${(c.y-(e.y-b.y)/6).toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
  }
  return d;
 };
 const faces=[
  {name:'left',rows:17,samples:64,cycles:11,amplitude:1.8,colours:['#624825','#987039','#bb8f4b','#d2af6b'],point:(t,r)=>brickPoint(0,t,r)},
  {name:'front',rows:17,samples:144,cycles:23,amplitude:2.8,colours:['#86612e','#c39b55','#e1bb78','#f3dca4'],point:(t,r)=>brickPoint(t,1,r)},
  {name:'top',rows:27,samples:144,cycles:24,amplitude:3.3,colours:['#9e783f','#d5af6b','#efcf91','#fff0c4'],point:(t,r)=>brickPoint(t,r)}
 ];
 for(const face of faces){
  const layer=node('g',{'data-noodle-face':face.name},n('noodle-strands'));
  for(let row=0;row<face.rows;row++){
   const r=.025+.95*row/(face.rows-1),phase=random()*Math.PI*2,cycles=face.cycles+(random()-.5)*3,amp=face.amplitude*(.8+random()*.35);
   const first=face.point(0,r),last=face.point(1,r),dx=last.x-first.x,dy=last.y-first.y,length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
   const points=[];
   for(let k=0;k<=face.samples;k++){
    const t=k/face.samples,p=face.point(t,r);
    const wave=amp*Math.sin(t*Math.PI*2*cycles+phase)+.75*Math.sin(t*19+phase*2)+.35*Math.sin(t*63+phase);
    points.push({x:p.x+nx*wave,y:p.y+ny*wave});
   }
   const d=curve(points),e=node('g',{},layer);
   const widths=face.name==='left'?[4.8,3.5,2.4,.55]:[5.4,4.1,2.8,.65];
   const paths=face.colours.map((stroke,i)=>node('path',{d,fill:'none',stroke,'stroke-width':widths[i],'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1,'stroke-dasharray':1,opacity:i===3?.65:1},e));
   strands.push({e,paths});
  }
 }
 // Small grain inclusions and tiny holes break up the regular strand pattern.
 for(let i=0;i<125;i++){
  const face=i%3,u=.035+random()*.93,v=.04+random()*.92,h=.04+random()*.92;
  const q=face===0?brickPoint(0,v,h):face===1?brickPoint(u,1,h):brickPoint(u,v);
  node('ellipse',{cx:q.x,cy:q.y,rx:.35+random()*.85,ry:.3+random()*.5,fill:face===0?'#70532d':'#96703c',opacity:.18+random()*.18},n('noodle-speckles'));
 }
 for(let i=0;i<5;i++){
  const y=-90-i*15;
  const d=`M-177 ${y+20}C-125 ${y-70} -80 ${y+70} -26 ${y}S91 ${y-50} 167 ${y+15}`;
  const g=node('g',{},n('floating-noodles'));
  const path=node('path',{d,stroke:'#d8b064','stroke-width':5,pathLength:1,'stroke-dasharray':1},g);
  const light=node('path',{d,stroke:'#f8e1a0','stroke-width':2,pathLength:1,'stroke-dasharray':1},g);
  loose.push({g,path,light});
 }
 for(let i=0;i<72;i++){
  const type=i%4,e=node('g',{},n('topping-field')),a=random()*Math.PI*2,r=Math.sqrt(random());
  const tx=450+Math.cos(a)*r*145,ty=459+Math.sin(a)*r*35;
  if(type===0)e.innerHTML='<path d="M-8-6l13-2 5 6-1 10-14 2-4-6Z" fill="url(#carrot-ink)"/><path d="M-8-6l13-2 5 6-14 2Z" fill="#f0b679"/><path d="M-4 0l-1 10M2-6l1 4" stroke="#994721" opacity=".4" stroke-width=".8"/>';
  else if(type===1)e.innerHTML='<path d="M-7-2Q-7-9 1-8Q9-7 8 1Q6 7-1 6Q-7 5-7-2" fill="#c69e39"/><path d="M-7-3Q-6-10 2-8Q8-7 8-2Q2 4-7-3" fill="#efd37b"/><path d="M-4-5Q1-8 4-5" stroke="#fff0ba" stroke-width="1.2" fill="none"/>';
  else if(type===2)e.innerHTML='<ellipse rx="10" ry="6.3" fill="#315e3e"/><ellipse cy="-2" rx="9.5" ry="5.8" fill="#7f9d5d"/><ellipse cy="-2.3" rx="6.1" ry="3.5" fill="#bacc91"/><ellipse cy="-2.5" rx="3.5" ry="2" fill="#4f7042"/><path d="M-7-4q3-3 7-3" stroke="#d3dca6" stroke-width=".8" fill="none"/>';
  else e.innerHTML='<path d="M-9 1Q-5-9 5-7L10 0Q5 7-4 6Z" fill="#4e713f"/><path d="M-8 0Q0-5 8 0" stroke="#9fba78" stroke-width="1" fill="none"/><path d="M0-3l1 7" stroke="#74965c" stroke-width=".7"/>';
  toppings.push({e,tx,ty,x:tx+(random()-.5)*230,y:120+random()*140,rotation:(random()-.5)*600,delay:random()*.44,arc:(random()-.5)*90,phase:random()*6.28});
 }
 for(let i=0;i<56;i++){
  seasoning.push({e:node('ellipse',{rx:.6+random()*1.6,ry:.5+random()*.7,fill:i%3?'#6c7145':'#ead598'},n('seasoning-field')),x:320+random()*260,y:438+random()*50,delay:random()*.5,phase:random()*6.28});
 }
 for(let i=0;i<28;i++){
  const x=268+i*13.5;
  node('path',{d:`M${x} 490L${mix(x,450,.21)} 739`},n('paper-ribs'));
 }
 for(let i=0;i<20;i++){
  node('ellipse',{cx:290+random()*310,cy:510+random()*33,rx:1+random()*2,ry:1.5+random()*2.8,fill:'#fffbea',stroke:'#96aa8e','stroke-width':.35,opacity:.45},n('condensation-field'));
 }
 for(let i=0;i<30;i++)node('ellipse',{cx:300+random()*300,cy:440+random()*55,rx:1+random()*2.5,ry:.4+random(),fill:i%2?'#f5dda0':'#7a7b45',opacity:.45},n('broth-flecks'));
 // Loose surface strands become visible as the rising broth covers the dry brick.
 // This is illustrative preparation choreography, not a hydration prediction.
 for(let i=0;i<17;i++){
  const y=443+i*3.1,reach=Math.sqrt(Math.max(.1,1-((y-470)/34)**2));
  const left=450-112*reach+Math.sin(i*2)*9,right=450+112*reach+Math.cos(i)*8;let d='';
  for(let k=0;k<=23;k++){
   const x=mix(left,right,k/23),yy=y+Math.sin(k*1.4+i*.91)*3.4;
   d+=k?`Q${x-4} ${yy+(k%2?-5:5)} ${x} ${yy}`:`M${x} ${yy}`;
  }
  node('path',{d,stroke:'#9a7137','stroke-width':4.1,opacity:.7},n('hydrated-strands'));
  node('path',{d,stroke:'#efd196','stroke-width':2.7},n('hydrated-strands'));
  node('path',{d,stroke:'#fff0bd','stroke-width':.6,opacity:.7},n('hydrated-strands'));
 }
 for(let i=0;i<12;i++)bubbles.push({e:node('ellipse',{cx:330+random()*240,cy:445+random()*51,rx:1,ry:.5},n('broth-bubbles')),phase:random(),size:1+random()*2.2});
 for(let i=0;i<5;i++)ripples.push(node('ellipse',{cx:505,cy:462,rx:1,ry:1},n('ripple-field')));
 for(let i=0;i<19;i++)splashes.push({e:node('ellipse',{rx:1.2+random()*2,ry:2+random()*2.5,fill:'#deebd3',stroke:'#99bdb2','stroke-width':.35},n('splash-field')),phase:random(),angle:random()*Math.PI*2,range:25+random()*65,height:18+random()*45});
 for(let i=0;i<7;i++){
  const x=366+i*28;
  const e=node('g',{},n('steam-field'));
  node('path',{d:`M${x} 443C${x-32} 407 ${x+26} 393 ${x} 356S${x+26} 300 ${x+4} 277`,stroke:'#f5f3da','stroke-width':9,opacity:.55,filter:'url(#steam-soft)'},e);
  node('path',{d:`M${x} 443C${x-32} 407 ${x+26} 393 ${x} 356S${x+26} 300 ${x+4} 277`,stroke:'#9aae93','stroke-width':1.8,opacity:.45},e);
  steam.push(e);
 }
 let strandsFinished=false;
 let current=-1,display=0,frame=0,tour=0,tourStarted=0,tourFrom=0,lastPaint=0,sceneTime=0,lastClock=0;
 let pointerX=0,pointerY=0,viewX=0,viewY=0;
 const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
 let staticMode=motionPreference.matches,visible=true;
 const chapterAt=s=>s<.76?0:s<1.77?1:s<2.72?2:s<3.82?3:s<5.12?4:5;
 const positions=[0,1.61/5.7,2.48/5.7,3.15/5.7,4.7/5.7,1];
 function setChapter(index){
  if(index===current)return;
  current=index;n('assembly-announcement').textContent=chapters[index];
  root.querySelectorAll('[data-story-step]').forEach((e,i)=>{if(i===index)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current')});
 }
 function paint(p,time){
  const s=p*5.7;root.style.setProperty('--story-progress',String(p));root.dataset.stage=String(chapterAt(s));setChapter(chapterAt(s));
  const cup=smooth(1.75,2.48,s),close=smooth(5.12,5.68,s),fill=smooth(3.82,4.65,s),idle=staticMode?0:1;
  // Reframe the grain clouds, full assembly, and finished cup around the center.
  const wide=smooth(1.3,2.08,s),hero=smooth(5.25,5.7,s);
  const camera=[mix(mix(130,90,wide),170,hero),mix(mix(180,80,wide),365,hero),mix(mix(640,720,wide),560,hero),mix(mix(470,710,wide),420,hero)];
  n('assembly-art').setAttribute('viewBox',camera.map(v=>v.toFixed(2)).join(' '));
  viewX+=(pointerX-viewX)*.06;viewY+=(pointerY-viewY)*.06;
  transform(n('assembly-scene'),`translate(${viewX*5} ${viewY*3+Math.sin(time*.7)*1.2*idle}) rotate(${viewX*.45} 450 480)`);
  transform(n('orbital-field'),`rotate(${s*5+time*.9*idle} 450 440)`);opacity(n('orbital-field'),mix(.9,.36,cup));
  opacity(n('grain-trails'),(1-smooth(.8,1.32,s))*.35);
  transform(n('grain-trails'),`rotate(${s*42+Math.sin(time*.3)*4*idle} 450 390)`);
  if(s<1.85)for(const g of particles){
   const t=smooth(.36+g.delay,1.25+g.delay,s),swirl=Math.sin(t*Math.PI),angle=t*5.2+g.phase;
   const x=mix(g.x,g.tx,t)+swirl*Math.cos(angle)*83+Math.sin(time*.65+g.phase)*4*(1-t)*idle;
   const y=mix(g.y,g.ty,t)+swirl*Math.sin(angle)*57-Math.sin(t*Math.PI)*24+Math.cos(time*.8+g.phase)*6*(1-t)*idle;
   transform(g.e,`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${g.rotation+t*310+Math.sin(time*.5+g.phase)*8*(1-t)*idle}) scale(${mix(1,.32,t)})`);
   opacity(g.e,(1-smooth(.98+g.delay,1.46+g.delay,s))*(.64+g.depth*.36));
  } else opacity(n('grain-field'),0);
  if(s<1.85)opacity(n('grain-field'),1);
  opacity(n('grain-dust'),(1-smooth(.7,1.45,s))*.5);
  if(s<1.5)for(const d of dust)transform(d.e,`translate(${d.x+Math.sin(time*.35+d.phase)*12} ${d.y+Math.cos(time*.4+d.phase)*13})`);
  opacity(n('grain-names'),1-smooth(.3,.77,s));
  const cupY=(1-cup)*195,cupOpacity=smooth(1.73,2.06,s);
  for(const id of ['cup-back','cup-front']){transform(n(id),`translate(${(1-cup)*40} ${cupY}) rotate(${(1-cup)*9} 450 700)`);opacity(n(id),cupOpacity);}
  const base=smooth(1.72,2.52,s);transform(n('cup-base'),`translate(0 ${(1-base)*175})`);opacity(n('cup-base'),smooth(1.7,2.05,s));
  const sleeve=smooth(1.96,2.65,s);transform(n('cup-sleeve'),`translate(${(1-sleeve)*-30} ${(1-sleeve)*88}) rotate(${(1-sleeve)*-9} 450 620)`);opacity(n('cup-sleeve'),smooth(1.84,2.13,s));
  const blockY=mix(345,470,cup)+fill*64;
  const liquidY=mix(574,477,fill),liquidRx=mix(150,171,fill),liquidRy=mix(42,49,fill);
  root.dataset.fill=fill.toFixed(3);
  transform(n('noodle-block'),`translate(450 ${blockY}) rotate(${mix(-7,0,cup)}) scale(${mix(1.2,.99,cup)-fill*.02})`);opacity(n('noodle-block'),smooth(.65,.85,s));
  opacity(n('noodle-core'),smooth(.98,1.5,s));opacity(n('noodle-speckles'),smooth(1.05,1.52,s));
  if(s<1.85){strandsFinished=false;strands.forEach(({e,paths},i)=>{const delay=.4*i/(strands.length-1),t=smooth(.63+delay,1.15+delay,s);transform(e,`translate(${(1-t)*Math.sin(i*.85)*33} ${(1-t)*(-90+i*2)})`);paths.forEach(path=>path.setAttribute('stroke-dashoffset',String(1-t)));});}
  else if(!strandsFinished){strandsFinished=true;strands.forEach(({e,paths})=>{transform(e,'translate(0 0)');paths.forEach(path=>path.setAttribute('stroke-dashoffset','0'))});}
  opacity(n('floating-noodles'),smooth(.53,.88,s)*(1-smooth(1.08,1.55,s)));
  if(s<1.7)loose.forEach(({g,path,light},i)=>{const t=smooth(.55+i*.045,1.27+i*.045,s);transform(g,`translate(450 ${mix(440,370,t)}) rotate(${mix(-18+i*7,0,t)} 0 -100)`);path.setAttribute('stroke-dashoffset',1-t);light.setAttribute('stroke-dashoffset',1-t);});
  for(const g of toppings){
   const t=smooth(2.58+g.delay,3.36+g.delay,s),lift=Math.sin(t*Math.PI),settle=Math.sin(t*Math.PI*3)*(1-t)*9;
   const floating=smooth(.45,.9,fill),floatY=mix(g.ty+fill*24,liquidY+(g.ty-459)*.78-3,floating);
   const bob=close<.9?Math.sin(time*1.7+g.phase)*floating*1.5*idle:0;
   transform(g.e,`translate(${mix(g.x,g.tx,t)+lift*g.arc} ${mix(g.y,floatY,t)-lift*32+settle+bob}) rotate(${g.rotation*(1-t)+Math.sin(time+g.phase)*fill*.8*idle}) scale(${mix(1.18,1,t)})`);
   opacity(g.e,smooth(2.34+g.delay,2.55+g.delay,s));
  }
  for(const g of seasoning){const t=smooth(2.88+g.delay,3.55+g.delay,s);transform(g.e,`translate(${g.x+Math.sin(t*6+g.phase)*(1-t)*35} ${mix(210,mix(g.y,liquidY+(g.y-459)*.78-2,smooth(.45,.9,fill)),t)}) rotate(${g.phase*60+t*180})`);opacity(g.e,smooth(2.72+g.delay,2.95+g.delay,s));}
  // Draw liquid AFTER the brick and BEFORE toppings. Its opaque volume hides
  // submerged noodles; the cup's front wall occludes the water below the rim.
  opacity(n('broth-liquid'),smooth(.015,.08,fill));opacity(n('condensation-field'),fill*(1-close*.7));
  n('broth-volume').setAttribute('d',`M${450-liquidRx} ${liquidY}H${450+liquidRx}L584 710Q450 750 316 710Z`);
  for(const id of ['broth-surface','broth-meniscus','broth-clip-ellipse']){
   n(id).setAttribute('cy',liquidY);n(id).setAttribute('rx',liquidRx);n(id).setAttribute('ry',liquidRy);
  }
  transform(n('broth-detail-plane'),`translate(450 ${liquidY}) scale(${liquidRx/171} ${liquidRy/49}) translate(-450 -470)`);
  opacity(n('hydrated-strands'),smooth(.3,.88,fill));
  const water=smooth(3.82,4.08,s)*(1-smooth(4.7,4.86,s));opacity(n('water-pour'),water);
  // Keep the end of the stream, splash and ripple center on the rising surface.
  const impactY=liquidY-8;
  for(const id of ['water-shadow','water-stream'])n(id).setAttribute('d',`M606 168C607 257 518 290 506 ${impactY}`);
  n('water-highlight').setAttribute('d',`M603 168C603 257 514 295 503 ${impactY-3}`);
  n('water-secondary').setAttribute('d',`M611 168C612 261 525 289 513 ${impactY-2}`);
  n('water-impact').setAttribute('cy',impactY);
  opacity(n('kettle-spout'),smooth(3.64,3.98,s)*(1-smooth(4.7,4.88,s)));transform(n('kettle-spout'),`translate(${(1-water)*70} ${(1-water)*-40}) rotate(${(1-water)*-15} 700 135)`);
  ripples.forEach((e,i)=>{const t=(time*.58+i/5)%1,size=8+t*150;e.setAttribute('rx',size);e.setAttribute('ry',size*.28);opacity(e,(1-t)*(.25+.55*water)*smooth(.15,.55,fill));});
  bubbles.forEach(g=>{const t=(time*.4+g.phase)%1;g.e.setAttribute('rx',g.size*(.4+t));g.e.setAttribute('ry',g.size*(.4+t)*.48);opacity(g.e,Math.sin(t*Math.PI)*smooth(.3,.65,fill)*.55);});
  if(water>.001)splashes.forEach(g=>{const t=(time*1.05+g.phase)%1;transform(g.e,`translate(${506+Math.cos(g.angle)*g.range*t} ${impactY+Math.sin(g.angle)*g.range*.25*t-Math.sin(t*Math.PI)*g.height}) rotate(${Math.cos(g.angle)*t*80}) scale(${1-t*.55})`);opacity(g.e,Math.sin(t*Math.PI)*.9);});
  const steamStrength=smooth(4.05,4.5,s)*(1-close);opacity(n('steam-field'),steamStrength);
  if(steamStrength>.001)steam.forEach((e,i)=>{const t=(time*.17+i/7)%1;transform(e,`translate(${Math.sin(time*.55+i)*9} ${-t*54}) scale(1 ${.8+t*.25})`);opacity(e,Math.sin(t*Math.PI)*.55);});
  const lidShift=smooth(3.6,4.02,s)*(1-close),lidShow=smooth(1.93,2.42,s),hover=Math.sin(time*1.1)*3*(1-close)*idle;
  const bounce=Math.sin(close*Math.PI*2)*Math.sin(close*Math.PI)*7;
  transform(n('cup-lid'),`translate(${mix(-36,0,close)-lidShift*116} ${mix(-220,22,close)+hover+bounce}) rotate(${mix(-13,0,close)+Math.sin(time*.65)*.8*(1-close)*idle} 450 446)`);opacity(n('cup-lid'),lidShow);
  const pulse=smooth(5.45,5.7,s);transform(n('seal-ring'),`translate(450 472) scale(${1+pulse*.13}) translate(-450 -472)`);opacity(n('seal-ring'),Math.sin(pulse*Math.PI)*.45);
  transform(n('lid-glint'),`translate(${(time%9)/9*620} 0)`);transform(n('cup-glint'),`translate(${(time%9)/9*620} 0)`);opacity(n('cup-glint'),.16+close*.24);
  opacity(n('assembly-shadow'),mix(.035,.2,cup));transform(n('assembly-shadow'),`translate(0 ${mix(-230,0,cup)})`);
 }
 function measuredProgress(){const rect=root.getBoundingClientRect(),distance=root.offsetHeight-window.innerHeight;return distance>0?clamp(-rect.top/distance):1}
 function tick(now){
  frame=0;if(document.hidden||!visible)return;
  const target=staticMode?1:measuredProgress(),moving=Math.abs(target-display)>.00015;
  if(!moving&&now-lastPaint<32){frame=requestAnimationFrame(tick);return}
  const dt=lastClock?Math.min(64,now-lastClock):16;lastClock=now;lastPaint=now;
  if(!staticMode)sceneTime+=dt/1000;
  display+= (target-display)*(1-Math.pow(.8,dt/16.67));if(Math.abs(target-display)<.00015)display=target;
  paint(display,sceneTime);
  if(!staticMode)frame=requestAnimationFrame(tick);
 }
 function request(){if(!frame&&!document.hidden&&visible)frame=requestAnimationFrame(tick)}
 function stopTour(){if(tour){cancelAnimationFrame(tour);tour=0}n('assembly-play').innerHTML='<span aria-hidden="true">▶</span> Play';n('assembly-play').setAttribute('aria-label','Play animation');n('assembly-play').setAttribute('aria-pressed','false')}
 function enableMotion(){if(staticMode){staticMode=false;root.classList.remove('is-static')}request()}
 function scrollToProgress(p,behavior='smooth'){const top=window.scrollY+root.getBoundingClientRect().top;window.scrollTo({top:top+p*(root.offsetHeight-window.innerHeight),behavior})}
 n('assembly-replay').addEventListener('click',()=>{stopTour();enableMotion();scrollToProgress(0);request()});
 root.querySelectorAll('[data-story-step]').forEach(e=>e.addEventListener('click',()=>{stopTour();enableMotion();scrollToProgress(positions[+e.dataset.storyStep])}));
 n('assembly-play').setAttribute('aria-pressed','false');
 n('assembly-play').addEventListener('click',()=>{
  if(tour){stopTour();return}enableMotion();tourFrom=measuredProgress();if(tourFrom>.94)tourFrom=0;tourStarted=performance.now();scrollToProgress(tourFrom,'instant');
  n('assembly-play').innerHTML='<span aria-hidden="true">Ⅱ</span> Pause';n('assembly-play').setAttribute('aria-label','Pause animation');n('assembly-play').setAttribute('aria-pressed','true');
  function step(now){const p=clamp(tourFrom+(now-tourStarted)/26000);scrollToProgress(p,'instant');if(p<1)tour=requestAnimationFrame(step);else stopTour()}
  tour=requestAnimationFrame(step);
 });
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});
 window.addEventListener('wheel',stopTour,{passive:true});window.addEventListener('touchstart',stopTour,{passive:true});
 root.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!staticMode){pointerX=(e.clientX/window.innerWidth-.5)*2;pointerY=(e.clientY/window.innerHeight-.5)*2;}});
 root.addEventListener('pointerleave',()=>{pointerX=pointerY=0});
 document.addEventListener('visibilitychange',()=>{lastClock=0;if(document.hidden)stopTour();else request()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>0;if(visible){lastClock=0;request()}else stopTour()}).observe(root);
 document.addEventListener('keydown',e=>{if(!visible||root.getBoundingClientRect().bottom<window.innerHeight*.6||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)||(e.key===' '&&document.activeElement===n('assembly-play')))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stopTour();enableMotion();scrollToProgress(positions[Math.min(5,Math.max(0,current+(e.key==='ArrowRight'?1:-1)))])}else if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp','Escape',' '].includes(e.key))stopTour()});
 function applyReducedMotion(){stopTour();staticMode=motionPreference.matches;root.classList.toggle('is-static',staticMode);display=staticMode?1:measuredProgress();request()}
 motionPreference.addEventListener('change',applyReducedMotion);
 if(staticMode){root.classList.add('is-static');display=1}
 display=staticMode?1:measuredProgress();paint(display,0);request();
})();
