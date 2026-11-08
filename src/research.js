/* Proposed manufacturing flow. Geometry illustrates mechanisms, not validated process results. */
(() => {
 'use strict';
 const root=document.querySelector('.research-scene');if(!root)return;
 const data=/*__RESEARCH_DATA__*/;
 const $=id=>document.getElementById(id),all=s=>[...root.querySelectorAll(s)],NS='http://www.w3.org/2000/svg';
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>1-(1-clamp(x))**3,phase=(x,a=0,b=1)=>ease((x-a)/(b-a));
 const attr=(e,k,v)=>e.setAttribute(k,String(v));
 const svg=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>attr(e,k,v));parent.appendChild(e);return e};
 const panels=all('[data-research-panel]'),nav=all('[data-research-step]'),detailPanels=all('[data-research-details]'),dialog=$('research-details');
 let active=-1,entered=0,tableTime=-10000,tableMode='process',flavourTime=-10000;
 const update=()=>root.dispatchEvent(new CustomEvent('sorami-research-update',{bubbles:true}));
 $('research-details-open').addEventListener('click',()=>{dialog.showModal();$('research-details-close').focus()});
 $('research-details-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>$('research-details-open').focus());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 nav.forEach(b=>b.addEventListener('click',()=>root.dispatchEvent(new CustomEvent('sorami-research-seek',{bubbles:true,detail:{step:+b.dataset.researchStep}}))));
 all('[data-research-table]').forEach(b=>b.addEventListener('click',()=>{
  tableMode=b.dataset.researchTable;tableTime=performance.now();
  all('[data-research-table]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));
  ['process','ingredients','nutrition'].forEach(name=>$(`research-${name}`).hidden=name!==tableMode);update();
 }));
 $('research-drying').addEventListener('input',()=>{$('research-drying-label').textContent=`${$('research-drying').value}%`;update()});
 all('[data-research-flavour]').forEach(b=>b.addEventListener('click',()=>{
  const index=+b.dataset.researchFlavour,name=data.flavours[index];flavourTime=performance.now();
  all('[data-research-flavour]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));
  $('research-flavour-detail').textContent=`${name} seasoning. Both variants share the same noodle block and toppings.`;
  const label=$('research-packet-flavour');label.replaceChildren();
  const lines=index===0?['Spicy','Garlic']:['Chicken &','Mushroom'];
  lines.forEach((line,i)=>{const span=svg('tspan',{x:95,dy:i?13:0},label);span.textContent=line});
  root.querySelector('.research-sachet').style.fill=index===0?'#a94c29':'#8a2636';update();
 }));
 const grains=[];
 for(let i=0;i<38;i++){
  const a=i*2.399,e=svg('use',{href:'#pitch-seed',x:-6,y:-9,width:12,height:18,class:i%7===0?'research-starch':i%2?'research-sorghum':'research-millet'},$('research-form-grains'));
  grains.push({e,i,sx:250+Math.cos(a)*145,sy:25+Math.sin(a)*24,x:174+i*37%173,y:119+i*23%55});
 }
 for(let i=0;i<10;i++)svg('path',{d:`M${145+i*28} 255q-13 16 0 35m0-35q13 16 0 35`,class:'research-screw',pathLength:1},$('research-extruder-screw'));
 const extrusion=[];
 for(let i=0;i<4;i++)extrusion.push(svg('path',{d:`M489 ${250+i*12}C${527+i*5} ${234+i*12} ${503-i*7} ${318+i*8} ${545+i*11} ${310+i*17}S${576+i*3} ${354+i*4} ${588-i*8} ${365+i*4}`,class:'research-extrusion',pathLength:1},$('research-extruded-strands')));
 const formSteam=[];
 for(let i=0;i<3;i++)formSteam.push(svg('path',{d:`M${166+i*37} 214q-18-23 0-45t0-43`,class:'research-vapour',pathLength:1},$('research-form-steam')));
 const chains=[],bonds=[];
 for(let i=0;i<7;i++)chains.push({e:svg('path',{class:i%2?'research-starch-chain light':'research-starch-chain',pathLength:1},$('research-starch-chains')),i});
 for(let i=0;i<6;i++)for(let j=0;j<3;j++)bonds.push(svg('path',{d:`M${176+j*93} ${143+i*19}v19`,class:'research-starch-bond',pathLength:1},$('research-starch-bonds')));
 const preAir=[],finishAir=[],microwaves=[],vapour=[],pores=[],connections=[];
 for(const [parent,items,base] of [[ $('research-pre-air'),preAir,53 ],[ $('research-finish-air'),finishAir,476 ]]){
  for(let i=0;i<3;i++)items.push(svg('path',{d:`M${base} ${206+i*20}q23-12 46 0t45 0`,class:'research-hot-air',pathLength:1},parent));
 }
 for(let i=0;i<3;i++)microwaves.push(svg('path',{d:`M246 ${153+i*20}q24-12 48 0t48 0t49 0`,class:'research-microwave',pathLength:1},$('research-microwaves')));
 for(let i=0;i<18;i++)pores.push({e:svg('ellipse',{cx:247+i*31%145,cy:248+i*13%31,rx:0,ry:0,class:'research-dry-pore'},$('research-dry-pores')),r:2+i%4*1.5,i});
 for(const d of ['M236 260c31-17 40 23 74 7s55-10 96-6','M275 239q-11 24 12 48','M352 239q17 23 0 48'])connections.push(svg('path',{d,class:'research-dry-channel',pathLength:1},$('research-dry-pores')));
 for(let i=0;i<5;i++)vapour.push(svg('path',{d:`M${253+i*31} 240q-13-24 0-44t0-49`,class:'research-vapour',pathLength:1},$('research-vapour')));
 const dryerStages=all('[data-dryer-stage]');
 for(let i=0;i<10;i++){
  let d='';for(let x=58;x<=153;x+=3)d+=`${x===58?'M':'L'}${x} ${60+i*4+Math.sin(x*.2+i)*2.2}`;
  svg('path',{d,class:'research-block-noodle',pathLength:1},$('research-assembly-noodles'));
 }
 const toppingColours=['#ab7b39','#b86731','#859049','#e5c56f'];
 for(let i=0;i<18;i++)svg('circle',{cx:61+i*17%73,cy:307+i*13%40,r:2+i%3,fill:toppingColours[i%4]},$('research-topping-pieces'));
 const assemblyPaths=[],tokens=[],sourceY=[86,203,326];
 for(let i=0;i<3;i++){
  assemblyPaths.push(svg('path',{d:`M175 ${sourceY[i]}Q285 ${sourceY[i]} 453 177`,class:'research-assembly-route',pathLength:1},$('research-assembly-paths')));
  tokens.push(svg('circle',{r:7,fill:['#d3a24c','#8a2636','#859049'][i]},$('research-assembly-tokens')));
 }
 const prepSteam=[];
 for(let i=0;i<3;i++)prepSteam.push(svg('path',{d:`M${158+i*38} 134q-20-27 0-50t0-45`,class:'research-vapour',pathLength:1},$('research-prepare-steam')));
 for(let i=0;i<12;i++){
  const a=i/12*Math.PI*2,r=i%3===0?75:79;
  svg('path',{d:`M${447+Math.sin(a)*r} ${166-Math.cos(a)*r}L${447+Math.sin(a)*84} ${166-Math.cos(a)*84}`,class:'research-clock-tick'},$('research-clock-ticks'));
 }
 function scaleAt(e,x,y,scale){attr(e,'transform',`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`)}
 function drawPaths(panel,t){panel.querySelectorAll('.research-machine,.research-fine-line,.research-draw,.research-screw').forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.01+i*.006,.75+i*.005))}
 function paint(q,now,reduced){
  const index=Math.min(panels.length-1,Math.floor(clamp(q)*panels.length)),local=clamp(q*panels.length-index);
  if(index!==active){
   active=index;entered=now;root.dataset.researchStep=String(index);root.closest('.pitch-scenes').scrollTop=0;
   panels.forEach((e,i)=>{e.hidden=i!==index;e.inert=i!==index});detailPanels.forEach((e,i)=>e.hidden=i!==index);
   nav.forEach((e,i)=>e.setAttribute('aria-pressed',String(i===index)));$('research-details-title').textContent=data.steps[index].title;
  }
  const t=reduced?1:Math.min(phase(local,.015,.75),phase((now-entered)/1000,0,.8));
  const panel=panels[index],copy=panel.querySelector('.research-data');drawPaths(panel,t);
  copy.style.clipPath=`inset(0 ${(1-phase(t,.08,.72))*100}% 0 0)`;copy.style.transform=`translateX(${(1-phase(t,.08,.72))*16}px)`;copy.inert=t<.24;
  if(index===0){
   grains.forEach(({e,i,sx,sy,x,y})=>{const p=phase(t,i*.003,.6+i*.003);attr(e,'transform',`translate(${sx+(x-sx)*p} ${sy+(y-sy)*p}) rotate(${i*37+(1-p)*150}) scale(${p})`)});
   extrusion.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.25+i*.03,.88));formSteam.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.15+i*.04,.7));
   $( `research-${tableMode}` ).style.clipPath=`inset(0 ${(1-(reduced?1:phase((now-tableTime)/1000,0,.55)))*100}% 0 0)`;
  }else if(index===1){
   chains.forEach(({e,i})=>{
    const p=phase(t,.03+i*.025,.75);let d='';
    for(let j=0;j<=24;j++){const x=138+j*11,y=143+i*19+(1-p)*Math.sin(j*.65+i)*22;d+=`${j===0?'M':'L'}${x} ${y}`}
    attr(e,'d',d);e.style.strokeDashoffset=1-p;
   });bonds.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.35+i*.004,.95));
   panel.querySelector('.research-clock-progress').style.strokeDashoffset=1-phase(t,.2,.95);
  }else if(index===2){
   const dry=+$('research-drying').value/100*t;
   dryerStages.forEach((e,i)=>scaleAt(e,[108,321,530][i],[241,194,241][i],phase(t,.03+i*.09,.53+i*.1)));
   preAir.forEach((e,i)=>e.style.strokeDashoffset=1-phase(dry,.01+i*.025,.4));
   microwaves.forEach((e,i)=>e.style.strokeDashoffset=1-phase(dry,.18+i*.025,.7));
   finishAir.forEach((e,i)=>e.style.strokeDashoffset=1-phase(dry,.45+i*.025,.98));
   pores.forEach(({e,r,i})=>{const p=phase(dry,.2+i*.003,.9);attr(e,'rx',r*p*1.4);attr(e,'ry',r*p)});
   connections.forEach((e,i)=>e.style.strokeDashoffset=1-phase(dry,.3+i*.025,.95));vapour.forEach((e,i)=>e.style.strokeDashoffset=1-phase(dry,.2+i*.025,.85));
   attr($('research-pressure-needle'),'transform',`rotate(${-75*dry} 264 105)`);
  }else if(index===3){
   ['noodles','seasoning','toppings'].forEach((name,i)=>{
    const p=phase(t,.01+i*.07,.55+i*.06),flip=name==='seasoning'?(reduced?1:phase((now-flavourTime)/1000,0,.6)):1;
    const e=$(`research-source-${name}`);attr(e,'transform',`translate(98 ${sourceY[i]}) scale(${p*flip} ${p}) translate(-98 ${-sourceY[i]})`);
   });
   assemblyPaths.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.12+i*.06,.78+i*.03));
   tokens.forEach((e,i)=>{const p=phase(t,.2+i*.08,.8+i*.05),x=(1-p)**2*175+2*(1-p)*p*285+p*p*453,y=(1-p)**2*sourceY[i]+2*(1-p)*p*sourceY[i]+p*p*177;attr(e,'cx',x);attr(e,'cy',y);attr(e,'r',7*Math.sin(p*Math.PI))});
   scaleAt($('research-assembly-cup'),457,290,phase(t,.15,.72));
   const lid=phase(t,.63,.98);attr($('research-assembly-lid'),'transform',`translate(0 ${-95*(1-lid)}) rotate(${-14*(1-lid)} 457 181)`);
  }else{
   scaleAt($('research-prepared-cup'),198,283,phase(t,.02,.63));scaleAt($('research-prepare-clock'),447,166,phase(t,.1,.6));
   const p=phase(t,.22,.98);$('research-prep-arc').style.strokeDashoffset=1-p;attr($('research-prep-hand'),'transform',`rotate(${p*360} 447 166)`);prepSteam.forEach((e,i)=>e.style.strokeDashoffset=1-phase(t,.25+i*.06,.9));
  }
 }
 root.researchScene={steps:panels.length,timelineWeight:panels.length*.8,paint,needsFrame(now){return now-entered<900||now-tableTime<650||now-flavourTime<700}};
})();
