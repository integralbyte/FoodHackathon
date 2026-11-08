function createLaunchScenes(root){
 const all=s=>[...root.querySelectorAll(s)],by=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
 return {paint(index,t,reduced){
  const reveal=(e,p,dx=0,dy=0)=>{e.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;e.style.transform=reduced?'none':`translate(${dx*(1-p)}px,${dy*(1-p)}px)`};
  if(index===7){
   all('[data-cost-segment]').forEach((e,i)=>{const p=reduced?1:ease((t-i*.08)/.55);e.style.transform=`scaleX(${p})`});
   all('[data-cost-connector]').forEach((e,i)=>e.style.strokeDashoffset=String(1-(reduced?1:ease((t-.25-i*.04)/.5))));
   all('[data-cost-label]').forEach((e,i)=>reveal(e,reduced?1:ease((t-.35-i*.04)/.45),0,12));
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
