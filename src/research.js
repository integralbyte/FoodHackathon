/* Research visuals explain mechanisms; they are not calibrated food simulations. */
(() => {
 'use strict';
 const root=document.querySelector('.research-scene');if(!root)return;
 const data=/*__RESEARCH_DATA__*/;
 const $=id=>document.getElementById(id),all=s=>[...root.querySelectorAll(s)],NS='http://www.w3.org/2000/svg';
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>1-(1-clamp(x))**3,phase=(x,a=0,b=1)=>ease((x-a)/(b-a));
 const svg=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));parent.appendChild(e);return e};
 const attr=(e,k,v)=>e.setAttribute(k,String(v));
 const panels=all('[data-research-panel]'),nav=all('[data-research-step]');
 let active=-1,entered=0,tableTime=-10000,tasteTime=-10000,tableMode='ingredients',taste=0;
 const update=()=>root.dispatchEvent(new CustomEvent('sorami-research-update',{bubbles:true}));
 nav.forEach(button=>button.addEventListener('click',()=>root.dispatchEvent(new CustomEvent('sorami-research-seek',{bubbles:true,detail:{step:+button.dataset.researchStep}}))));
 all('[data-research-table]').forEach(button=>button.addEventListener('click',()=>{
  tableMode=button.dataset.researchTable;tableTime=performance.now();
  root.dataset.researchTable=tableMode;root.querySelector('.research-cup-goals').hidden=tableMode==='nutrition';
  all('[data-research-table]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('research-ingredients').hidden=tableMode!=='ingredients';$('research-nutrition').hidden=tableMode!=='nutrition';update();
 }));
 ['research-drying','research-diameter'].forEach(id=>$(id).addEventListener('input',()=>{
  const value=+$(id).value;
  if(id==='research-drying')$('research-drying-label').textContent=`${value}%`;
  else{$('research-diameter-label').textContent=`${value.toFixed(1)} mm`;$('research-strand-measure').textContent=`${value.toFixed(1)} mm concept diameter`}
  update();
 }));
 function setTaste(index){
  taste=index;tasteTime=performance.now();const d=data.taste[index];
  all('[data-research-taste]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  $('research-taste-result').replaceChildren(document.createTextNode(d.number));
  if(d.suffix){const small=document.createElement('small');small.textContent=d.suffix;$('research-taste-result').appendChild(small)}
  $('research-taste-result').classList.toggle('is-word',d.remaining===null);
  $('research-taste-context').textContent=d.context;$('research-taste-endpoint').textContent=d.endpoint;
  $('research-taste-detail').textContent=d.detail;$('research-taste-basis').textContent=d.basis;$('research-taste-source').href=d.source;
  const msg=d.remaining===null;
  $('research-signal-caption').textContent=msg?'UMAMI FORMULATION CONCEPT':index===2?'BITTER RECEPTOR ACTIVITY · CELL ASSAY':'HUMAN BITTERNESS RATINGS';
  $('research-taste-bar-caption').textContent=msg?'SAVOURY DEPTH · NO BITTERNESS PERCENTAGE CLAIMED':index===2?'ILLUSTRATIVE RESPONSE · 7 OF 19 TESTED RECEPTORS':'NORMALIZED STUDY RESPONSE · NOT A SORAMI RESULT';
  $('research-taste-bar').style.visibility=msg?'hidden':'visible';all('.research-signal-control').forEach(e=>e.style.visibility=msg?'hidden':'visible');update();
 }
 all('[data-research-taste]').forEach(b=>b.addEventListener('click',()=>setTaste(+b.dataset.researchTaste)));

 const grains=[];
 for(let i=0;i<100;i++){
  const tone=i<47?'sorghum':i<85?'millet':'starch',e=svg('use',{href:'#pitch-seed',x:-6,y:-9,width:12,height:18,class:`research-${tone}`},$('research-mix-grains'));
  const angle=i*2.399,sourceX=i<47?150:i<85?450:310,sourceY=i<85?80:32;
  grains.push({e,x:66+i%20*25.6,y:166+Math.floor(i/20)*31,sx:sourceX+Math.cos(angle)*75,sy:sourceY+Math.sin(angle)*60,i});
 }
 const waves=[];
 for(let i=0;i<4;i++){
  let d='';for(let x=104;x<505;x+=5)d+=`${x===104?'M':'L'}${x} ${158+i*15+Math.sin(x*.045+i)*6}`;
  waves.push(svg('path',{d,class:'research-microwave',pathLength:1},$('research-microwaves')));
 }
 const dryPores=[];
 for(let i=0;i<24;i++)dryPores.push({e:svg('ellipse',{cx:143+i*43%301,cy:251+i*17%42,rx:0,ry:0,class:'research-dry-pore'},$('research-dry-pores')),r:3+i%4*1.9,i});
 const dryConnections=['M127 268C186 252 179 286 239 272S303 255 350 273S413 291 465 271','M161 243C179 262 207 273 213 304','M292 243C316 268 355 270 360 304'].map(d=>svg('path',{d,class:'research-dry-channel',pathLength:1},$('research-dry-pores')));
 const vapour=[];
 for(let i=0;i<8;i++){
  const x=143+i*41;
  vapour.push(svg('path',{d:`M${x} 242C${x-21} 213 ${x+22} 204 ${x} 177S${x-11} 146 ${x+4} 131`,class:'research-vapour',pathLength:1},$('research-vapour')));
 }
 const strandD='M77 57C-4 87 253 110 182 148S57 194 183 225S265 264 151 298S132 344 247 350';
 const strandShadow=svg('path',{d:strandD,class:'research-long-shadow',pathLength:1},$('research-long-strand'));
 const strandHighlight=svg('path',{d:strandD,class:'research-long-highlight',pathLength:1},$('research-long-strand'));
 const sectionPores=[];
 for(let i=0;i<24;i++){
  const a=i*2.399,r=Math.sqrt((i+.5)/24)*91;
  sectionPores.push(svg('ellipse',{cx:444+Math.cos(a)*r,cy:227+Math.sin(a)*r,rx:5+i%3*2.8,ry:3+i%4*1.7,class:'research-dry-pore'},$('research-strand-pores')));
 }
 const waterPaths=[
  'M340 214C382 203 382 249 414 240S426 214 444 227',
  'M467 123C470 169 421 165 431 193S459 204 444 227',
  'M548 244C505 254 518 209 482 218S461 247 444 227',
  'M438 331C418 297 466 291 455 259S432 248 444 227'
 ].map(d=>svg('path',{d,class:'research-water-channel',pathLength:1},$('research-water-paths')));
 const signals=[],receptors=[],umami=[];
 for(let i=0;i<15;i++)signals.push({e:svg('circle',{r:4+i%3,cx:0,cy:0,fill:i%2?'#b9803b':'#8a2636'},$('research-taste-signals')),i});
 for(let i=0;i<7;i++){
  const x=329+i*36;
  const g=svg('g',{},$('research-taste-receptors'));
  svg('path',{d:`M${x} 224v-42q0-15 11-15t11 15v42`,class:'research-receptor',pathLength:1},g);
  svg('path',{d:`M${x+4} 193h14`,class:'research-receptor',pathLength:1},g);receptors.push({g,x,i});
 }
 for(let i=0;i<12;i++){
  const a=i/12*Math.PI*2;
  umami.push({e:svg('use',{href:'#pitch-seed',x:-7,y:-10,width:14,height:20,color:'#8a2636'},$('research-umami-ring')),a});
 }
 function drawPaths(within,t){within.querySelectorAll('.research-fine-line,.research-draw,.research-tray,.research-machine,.research-chamber-door').forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.01+i*.015,.7+i*.01))}
 function revealData(panel,t){
  const node=panel.querySelector('.research-data');node.style.clipPath=`inset(0 ${(1-phase(t,.08,.72))*100}% 0 0)`;
  node.style.transform=`translateX(${(1-phase(t,.08,.72))*16}px)`;
  node.inert=t<.24;
 }
 function paint(q,now,reduced){
  const index=Math.min(3,Math.floor(clamp(q)*4)),local=clamp(q*4-index);
  if(index!==active){active=index;entered=now;root.dataset.researchStep=String(index);root.closest('.pitch-scenes').scrollTop=0;panels.forEach((p,i)=>{p.hidden=i!==index;p.inert=i!==index});nav.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)))}
  const t=reduced?1:Math.min(phase(local,.015,.75),phase((now-entered)/1000,0,.8));
  const panel=panels[index];drawPaths(panel,t);revealData(panel,t);
  if(index===0){
   grains.forEach(({e,x,y,sx,sy,i})=>{const p=phase(t,i*.0015,.6+i*.002);attr(e,'transform',`translate(${sx+(x-sx)*p} ${sy+(y-sy)*p}) rotate(${(1-p)*i*7+26}) scale(${p})`)});
   const it=reduced?1:phase((now-tableTime)/1000,0,.55);
   const table=$(tableMode==='ingredients'?'research-ingredients':'research-nutrition');table.style.clipPath=`inset(0 ${(1-it)*100}% 0 0)`;
  }else if(index===1){
   const dry=+$('research-drying').value/100*t;
   waves.forEach((e,i)=>{e.style.strokeDashoffset=1-phase(t,.05+i*.035,.65);attr(e,'transform',`translate(${(1-t)*-30} 0)`)});
   dryPores.forEach(({e,r,i})=>{const p=phase(dry,i*.003,.85);attr(e,'rx',r*p*1.5);attr(e,'ry',r*p)});
   dryConnections.forEach((e,i)=>e.style.strokeDashoffset=1-phase(dry,.12+i*.025,.9));
   vapour.forEach((e,i)=>{e.style.strokeDashoffset=1-phase(dry,.03+i*.025,.7+i*.025);attr(e,'transform',`translate(0 ${(1-dry)*19})`)});
   attr($('research-pressure-needle'),'transform',`rotate(${-75*dry} 113 101)`);
   attr($('research-dry-strand'),'transform',`translate(0 ${(1-t)*70})`);
  }else if(index===2){
   const diameter=+$('research-diameter').value,scale=diameter/1.6;
   strandShadow.style.strokeDashoffset=strandHighlight.style.strokeDashoffset=1-phase(t,.02,.7);
   attr(strandShadow,'stroke-width',20*diameter/.8);attr(strandHighlight,'stroke-width',12*diameter/.8);
   // Attribute widths override the default via style, so the thickness control remains visible.
   strandShadow.style.strokeWidth=String(20*diameter/.8);strandHighlight.style.strokeWidth=String(12*diameter/.8);
   attr($('research-section'),'transform',`translate(444 227) scale(${scale*phase(t,.06,.55)}) translate(-444 -227)`);
   sectionPores.forEach((e,i)=>attr(e,'transform',`translate(444 227) scale(${phase(t,.1+i*.004,.65)}) translate(-444 -227)`));
   waterPaths.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.26+i*.025,.92));
   attr($('research-strand-dimension').firstElementChild,'d',`M${444-104*scale} 354h${208*scale}m${-208*scale}-7v14m${208*scale}-14v14`);
  }else{
   const d=data.taste[taste],it=reduced?1:phase((now-tasteTime)/1000,0,.6),build=t*it,msg=d.remaining===null;
   receptors.forEach(({g,x,i})=>{const p=phase(t,.08+i*.025,.7);attr(g,'transform',`translate(${(1-p)*70} ${(1-p)*90})`);g.querySelectorAll('path').forEach(e=>e.style.strokeDashoffset=1-p)});
   signals.forEach(({e,i})=>{const p=phase(build,i*.006,.7+i*.008);attr(e,'cx',63+(i%5)*46+p*60);attr(e,'cy',138+Math.floor(i/5)*35+Math.sin(i*1.9)*10);attr(e,'transform',`scale(${msg?0:p})`)});
   umami.forEach(({e,a},i)=>{const p=msg?phase(build,i*.012,.6+i*.012):0;attr(e,'transform',`translate(${190+Math.cos(a)*73} ${165+Math.sin(a)*73}) rotate(${a*180/Math.PI}) scale(${p})`)});
   const response=d.remaining===null?1:1-(1-d.remaining)*phase(build,.15,.8);attr($('research-taste-bar'),'width',510*response);
   $('research-taste-result').style.transform=`perspective(500px) rotateX(${(1-build)*-70}deg) scaleY(${.7+build*.3})`;
  }
 }
 root.researchScene={paint,needsFrame(now){return now-entered<900||now-tableTime<650||now-tasteTime<700}};
})();
