(() => {
 const root=document.getElementById('noodle-shelf');if(!root)return;
 const $=id=>document.getElementById(id),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const first=root.querySelector('.hook-request-first'),filterTitle=root.querySelector('.hook-request-filter'),final=root.querySelector('.hook-request-final'),filters=root.querySelector('.hook-filters'),chips=[...root.querySelectorAll('.hook-filter')],result=root.querySelector('.hook-result');
 const products=[...root.querySelectorAll('.hook-product')],steps=[...root.querySelectorAll('[data-hook-step]')],play=$('hook-play'),dialog=$('hook-evidence');
 const {catalog,rules:thresholds,counts,verifiedCounts}=/*__SHELF_DATA__*/{};
 const points=[0,.28,.46,.63,.80,.98],starts=[0,.14,.33,.50,.67];
 const nutrients=Object.fromEntries(catalog.map(p=>[p.id,p]));
 const mobileSlots=[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,0],[1,1],[1,4],[1,5],[2,0],[2,1],[2,4],[2,5],[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]];
 products.filter(el=>el.dataset.product!=='sorami').forEach((el,i)=>{el.style.setProperty('--mobile-row',mobileSlots[i][0]);el.style.setProperty('--mobile-column',mobileSlots[i][1])});
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t)};
 let progress=0,frame=0,visible=true,playing=false,start=0,from=0,beat=-1,reducedStep=0,lastOpener=null;
 let illustrated=thresholds.illustratedAssumptions;
 const elimination=n=>illustrated?n.firstFailure:n.verifiedFirstFailure;
 const set=(el,key,value)=>el.style.setProperty(key,String(value));
 function request(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
 function stop(){playing=false;play.setAttribute('aria-pressed','false');play.querySelector('span').textContent='Watch the choice'}
 function target(){const r=root.getBoundingClientRect();return clamp(-r.top/Math.max(1,root.offsetHeight-window.innerHeight))}
 function scrollToProgress(p){const top=root.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:top+p*Math.max(1,root.offsetHeight-window.innerHeight),behavior:'instant'})}
 function textPose(el,amount,direction=1){el.style.visibility=amount>.001?'visible':'hidden';el.style.clipPath=`inset(${(1-amount)*100}% 0 0)`;el.style.transform=`translateY(${(1-amount)*28*direction}px) rotateX(${(1-amount)*-32}deg)`}
 function render(p){
  const hero=smooth(.83,.96,p),foldAway=smooth(.81,.86,p);
  const active=p<starts[1]?0:p<starts[2]?1:p<starts[3]?2:p<starts[4]?3:4;
  set(root,'--hook-progress',p);set(root,'--reveal',hero);root.dataset.scenario=illustrated?'illustrated':'verified';
  const note=$('hook-assumption-note');note.style.visibility=p>=.65?'visible':'hidden';note.setAttribute('aria-hidden',String(p<.65));note.textContent=illustrated?'*Final cross-outs assume Soba + immi are deep-fried; unverified.':'Confirmed data: 4 frying methods unverified. Those cups stay in contention.';
  textPose(first,1-smooth(.09,.16,p));textPose(filterTitle,smooth(.12,.19,p)*(1-foldAway));textPose(final,hero);
  filters.style.visibility=p>.12&&foldAway<.999?'visible':'hidden';filters.setAttribute('aria-hidden',String(p<.12||foldAway>.99));
  chips.forEach((el,i)=>{
   const unfold=smooth(starts[i+1]-.015,starts[i+1]+.045,p)*(1-foldAway);
   el.style.transform=`translateY(${(1-unfold)*32}px) rotateX(${(1-unfold)*-85}deg) rotate(${(i%2?1:-1)*(1-unfold)*8}deg)`;
   el.style.clipPath=`inset(0 0 ${(1-unfold)*100}% 0)`;
   el.setAttribute('aria-hidden',String(unfold<.01));el.classList.toggle('is-current',active===i+1);el.classList.toggle('is-complete',active>i+1);
  });
  let remaining=products.length;
  products.forEach((el,i)=>{
   const n=nutrients[el.dataset.product],isSorami=n.id==='sorami',stage=elimination(n);
   const group=catalog.filter(item=>elimination(item)===stage),order=group.findIndex(item=>item.id===n.id);
   const stagger=group.length>1?order/(group.length-1)*.035:0;
   const strike=stage?smooth(starts[stage]+.025+stagger,starts[stage]+.085+stagger,p):0;
   set(el,'--strike',strike);el.dataset.excluded=String(strike>.99);el.dataset.eliminationStage=String(stage);
   el.classList.toggle('is-contender',active>0&&strike<.01&&hero<.01);
   if(strike>.5)remaining--;
   el.querySelector('.hook-cup-art').style.transform=isSorami?`translateY(${-hero*4}px)`:`translateY(${strike*2}px) rotate(${strike*(i%2?-4:4)}deg)`;
  });
  $('hook-match-number').textContent=String(remaining);
  $('hook-match-label').textContent=remaining===1?'concept, if the assumptions hold.':active===0?'cups & bowls. One wishlist.':`remain · ${['','protein','protein + sodium','protein + sodium + fibre','all four preferences'][active]}`;
  set(root,'--seal-scale',hero);result.style.clipPath=`inset(${(1-hero)*100}% 0 0)`;result.style.transform=`translateY(${(1-hero)*15}px)`;
  const next=p>=.86?5:active;
  if(next!==beat){
   beat=next;root.dataset.beat=String(beat);steps.forEach((el,i)=>i===beat?el.setAttribute('aria-current','step'):el.removeAttribute('aria-current'));
   $('hook-announcement').textContent=[
    'Twenty-one selected cups and bowls, with Sorami in the middle. Scroll or use the six stage buttons.',
    `At least ${thresholds.proteinMin} grams protein per cup. ${counts[1]} remain. Ten standard cups do not meet this preference.`,
    `Also under ${thresholds.sodiumUnder} milligrams sodium per cup. ${counts[2]} remain. Shin Black, Miyoka Chicken and Nissin Protein Chicken leave the selection.`,
    `Also at least ${thresholds.fibreMin} grams fibre. ${counts[3]} remain. NOMI has 4 to 5 grams per cup and leaves here.`,
    illustrated?'Also not deep-fried. The four remaining competitor cups are crossed out on an explicit, unverified frying assumption. Sorami alone remains only if those assumptions hold.':'Also not deep-fried. Four competitors have unverified frying methods and remain in contention alongside Sorami. Five remain.',
    'I want the healthiest noodles! Meet the Sorami concept: 11 grams protein, 400 milligrams sodium, 6.5 grams fibre and a non-fried process target. The illustrated final exclusions rely on unverified frying assumptions. This is a shopper wish, not a health ranking.'
   ][beat];
  }
 }
 function tick(now){
  frame=0;if(!visible||document.hidden)return;
  if(playing){const p=clamp(from+(now-start)/26000);scrollToProgress(p);if(p>=1)stop()}
  const next=motion.matches?points[reducedStep]:target();
  progress=next;render(progress);
  if(playing)request();
 }
 function go(index){stop();if(motion.matches){reducedStep=index;progress=points[index];render(progress)}else{visible=true;scrollToProgress(points[index]);request()}}
 steps.forEach((el,i)=>el.addEventListener('click',()=>go(i)));
 play.addEventListener('click',()=>{if(playing){stop();return}if(motion.matches){go((reducedStep+1)%points.length);return}if(progress>.96){scrollToProgress(0);progress=0}from=progress;start=performance.now();playing=true;play.setAttribute('aria-pressed','true');play.querySelector('span').textContent='Pause';visible=true;request()});
 root.querySelector('.hook-brand').addEventListener('click',e=>{e.preventDefault();go(0)});
 root.querySelector('.hook-continue').addEventListener('click',e=>{e.preventDefault();stop();const film=$('sorami-film');window.scrollTo({top:film.getBoundingClientRect().top+window.scrollY,behavior:motion.matches?'instant':'smooth'})});
 function inspect(id,opener){
  stop();lastOpener=opener;dialog.querySelectorAll('[data-evidence-product]').forEach(row=>row.classList.toggle('is-inspected',row.dataset.evidenceProduct===id));
  const panel=$('hook-inspection'),n=nutrients[id];panel.replaceChildren();panel.hidden=!n;
  if(n){
   const title=document.createElement('h3');title.textContent=n.brand+' '+n.name;panel.append(title);
   const size=document.createElement('p');size.textContent=`${n.market} product · ${n.size}g dry package${n.preparedWeight?`, ${n.preparedWeight}g prepared serving`:""}, including its complete seasoning portion.`;panel.append(size);
   const checks=document.createElement('div');checks.className='hook-checks';
   [['protein',n.protein>=thresholds.proteinMin,`${n.protein}g protein`],['sodium',n.sodium<thresholds.sodiumUnder,`${n.sodium.toLocaleString('en-US')}mg sodium`],['fibre',n.fibre>=thresholds.fibreMin,`${n.fibre}g fibre`],['nonfried',n.nonfried,n.id==='sorami'?'Non-fried target':n.nonfried===true?'Air-dried':n.nonfried===false?'Deep-fried':'Frying: unverified']].forEach(([,pass,label])=>{const tag=document.createElement('span');tag.textContent=(pass===true?'✓ ':pass===false?'× ':'? ')+label;tag.classList.toggle('passes',pass===true);tag.classList.toggle('unknown',pass===null);checks.append(tag)});panel.append(checks);
   const reason=document.createElement('p');
   const why=['No verified failing preference.',`Protein is below ${thresholds.proteinMin}g per complete cup.`,`Sodium is at or above the ${thresholds.sodiumUnder}mg cutoff.`,`Fibre is below ${thresholds.fibreMin}g per complete cup.`,n.nonfried===false?'The verified process is deep-fried.':'Illustrated assumption only: this cup is treated as deep-fried for the demonstration. Its actual frying process has not been verified.'];
   reason.textContent=id==='sorami'?'Meets this wishlist on the team’s unvalidated nutrition and non-fried process targets. Final formulation and manufacturing still require validation.':(elimination(n)?`Leaves at filter ${elimination(n)}. ${why[elimination(n)]}`:'Retained: all nutrition preferences pass and the frying method is unknown. It cannot be excluded on confirmed data.')+(n.protein>11||n.fibre>6.5?' This product has more '+(n.protein>11&&n.fibre>6.5?'protein and fibre':n.protein>11?'protein':'fibre')+' than the Sorami target.':'');panel.append(reason);
   if(n.assumptionNote){const assumption=document.createElement('p');assumption.className='hook-inspection-assumption';assumption.textContent=n.assumptionNote;panel.append(assumption)}
   if(n.note){const note=document.createElement('p');note.textContent=n.note;panel.append(note)}
   if(n.source){const link=document.createElement('a');link.href=n.labelSource||n.source;link.target='_blank';link.rel='noopener';link.textContent=n.labelPublisher?`Read the label at ${n.labelPublisher} ↗`:'Read the manufacturer’s label ↗';panel.append(link)}
   if(n.labelPublisher){const maker=document.createElement('a');maker.href=n.source;maker.target='_blank';maker.rel='noopener';maker.textContent='Manufacturer’s product and allergen information ↗';panel.append(document.createElement('br'),maker)}
  }
  dialog.showModal();dialog.scrollTop=0;
 }
 dialog.querySelectorAll('[data-hook-scenario]').forEach(button=>button.addEventListener('click',()=>{illustrated=button.dataset.hookScenario==='illustrated';dialog.querySelectorAll('[data-hook-scenario]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));beat=-1;render(progress);$('hook-inspection').hidden=true}));
 $('hook-sources').addEventListener('click',e=>inspect(null,e.currentTarget));
 root.querySelectorAll('[data-inspect]').forEach(el=>el.addEventListener('click',e=>inspect(el.dataset.inspect,e.currentTarget)));
 $('hook-evidence-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>lastOpener?.focus({preventScroll:true}));
 dialog.querySelectorAll('[data-hook-basis]').forEach(button=>button.addEventListener('click',()=>{
  const per100=button.dataset.hookBasis==='100g';dialog.querySelectorAll('[data-hook-basis]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  dialog.querySelectorAll('[data-evidence-product]').forEach(row=>{const n=nutrients[row.dataset.evidenceProduct],mult=per100?100/n.size:1;row.querySelectorAll('[data-nutrient]').forEach(cell=>{const key=cell.dataset.nutrient;const value=n[key]*mult;cell.textContent=value.toLocaleString('en-US',{maximumFractionDigits:key==='sodium'?0:1})+(key==='sodium'?'mg':'g')})});
  $('hook-table-caption').textContent=per100?'Whole-cup nutrition divided by original dry package weight × 100. Soba retains its labeled prepared-serving basis; this is not a dry-product assay.':'Published label values per complete cup or bowl; Sorami targets supplied by the team.';
 }));
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else request()});
 document.addEventListener('keydown',e=>{const r=root.getBoundingClientRect();if(!visible||r.top>0||r.bottom<window.innerHeight*.5||dialog.open||['INPUT','SELECT','TEXTAREA','BUTTON','A'].includes(document.activeElement.tagName))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(clamp(beat+(e.key==='ArrowRight'?1:-1),0,points.length-1))}else if(e.key===' '){e.preventDefault();play.click()}else if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End','Escape'].includes(e.key))stop()});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();else stop()}).observe(root);
 motion.addEventListener('change',()=>{stop();reducedStep=0;visible=true;request()});
 render(motion.matches?0:target());request();
})();
