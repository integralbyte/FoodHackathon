function createLaunchScenes(root,model){
 const all=s=>[...root.querySelectorAll(s)],by=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
 const cash=x=>`$${x.toFixed(2)}`;
 let selected='pilot';
 function updateCost(){
  const c=model[selected];
  all('[data-cost-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.costCase===selected)));
  by('launch-cost-number').textContent=cash(c.cost);by('launch-split-cost').textContent=cash(c.cost);by('launch-split-fees').textContent=cash(c.fees);by('launch-split-gross').textContent=cash(c.gross);
  by('launch-fee-label').textContent=selected==='pilot'?'Card fees':'Channel costs';
  by('launch-case-caption').textContent=`${c.channel} · before overhead${selected==='scale'?' · 100,000 cups per run':''}`;
  for(const key of ['cost','fees','gross'])root.querySelector(`[data-money-segment="${key}"]`).style.flexBasis=`${c[key]/model.price*100}%`;
  by('launch-money-track').setAttribute('aria-label',`${cash(model.price)} price: ${cash(c.cost)} cup cost, ${cash(c.fees)} ${selected==='pilot'?'card fees':'channel costs'}, ${cash(c.gross)} gross profit before overhead.`);
  all('[data-cost-part]').forEach((e,i)=>{e.querySelector('strong').textContent=cash(c.breakdown[i][1]);e.querySelector('i').style.width=`${c.breakdown[i][1]/c.cost*100}%`});
 }
 all('[data-cost-case]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.costCase;updateCost()}));updateCost();
 return {paint(index,t,reduced){
  const reveal=(e,p,dx=0,dy=0)=>{e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=reduced?'none':`translate(${dx*(1-p)}px,${dy*(1-p)}px)`};
  if(index===7){
   by('launch-money-track').style.transform=`scaleX(${ease((t-.1)/.7)})`;
   all('[data-cost-part]').forEach((e,i)=>reveal(e,ease((t-i*.06)/.65),28));
  }else if(index===8){
   all('[data-launch-phase]').forEach((e,i)=>{const p=ease((t-i*.16)/.6);reveal(e,p,0,28);e.style.setProperty('--route-progress',p)});
  }else if(index===9){
   by('launch-pp-cup').style.transform=`translateY(${(1-ease(t/.7))*32}px)`;
   by('launch-pp-lid').style.transform=`translateY(${(1-ease((t-.1)/.7))*-55}px)`;
   all('[data-pack-line]').forEach(e=>e.style.strokeDashoffset=String(1-ease((t-.2)/.65)));
   all('[data-community-cup]').forEach((e,i)=>{const p=ease((t-i*.016)/.5);e.style.transform=`translateY(${(1-p)*25}px) scaleY(${p})`;e.style.opacity=String(p)});
  }
 }};
}
