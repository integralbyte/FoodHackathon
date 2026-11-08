function createLaunchScenes(root){
 const all=s=>[...root.querySelectorAll(s)],by=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
 return {paint(index,t,reduced){
  const reveal=(e,p,dx=0,dy=0)=>{e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=reduced?'none':`translate(${dx*(1-p)}px,${dy*(1-p)}px)`};
  if(index===7){
   all('[data-cost-segment]').forEach((e,i)=>{const p=reduced?1:ease((t-i*.08)/.55);e.style.transform=`scaleX(${p})`});
   all('[data-cost-connector]').forEach((e,i)=>e.style.strokeDashoffset=String(1-(reduced?1:ease((t-.25-i*.04)/.5))));
   all('[data-cost-label]').forEach((e,i)=>reveal(e,reduced?1:ease((t-.35-i*.04)/.45),0,12));
  }else if(index===8){
   // The logo stays outside the text wipes: reveal it whole, never letter by letter.
   const logo=root.querySelector('.launch-cornell-logo'),p=reduced?1:ease((t-.08)/.62);
   logo.style.opacity=String(p);logo.style.transform=reduced?'none':`translateY(${(1-p)*10}px) scale(${.98+p*.02})`;
   all('[data-launch-flavour]').forEach((e,i)=>{const p=reduced?1:ease((t-.1-i*.1)/.65);e.style.opacity=String(p);e.style.transform=reduced?'none':`translateY(${(1-p)*12}px) scale(${.97+p*.03})`});
   all('[data-launch-phase]').forEach((e,i)=>{const p=ease((t-i*.16)/.6);reveal(e,p,0,28);e.style.setProperty('--route-progress',p)});
  }else if(index===9){
   by('sorami-film').style.setProperty('--film-reveal',reduced?1:ease(t/.6));
   all('[data-impact-panel]').forEach((e,i)=>{
    const p=reduced?1:ease((t-i*.13)/.75);
    e.style.clipPath=`inset(${(1-p)*100}% 0 0 0)`;
    e.style.transform=reduced?'none':`translateX(${(1-p)*(i?32:-32)}px) scale(${.97+p*.03})`;
   });
   const amount=by('impact-grain-total');amount.textContent=(Number(amount.dataset.impactTarget)*(reduced?1:ease((t-.12)/.7))).toFixed(1);
   const ratio=root.querySelector('.impact-donation-number');ratio.style.transform=reduced?'none':`perspective(900px) rotateX(${(1-ease((t-.18)/.65))*-28}deg)`;
  }
 }};
}
