(() => {
 const root=document.getElementById('grain-benefits'),flow=document.getElementById('product-journey')?.soramiFlow;if(!root||!flow)return;
 const columns=[...root.querySelectorAll('.grain-benefit-column')];
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return 1-(1-x)**3};
 flow.onFrame(state=>{
  const p=state.facts,open=p>0;root.style.visibility=open?'visible':'hidden';root.inert=!open;root.setAttribute('aria-hidden',String(!open));
  columns.forEach((column,side)=>column.querySelectorAll('[data-benefit-row]').forEach((row,index)=>{
   const delay=index*.19+side*.045,t=state.reduced?(p>delay?1:0):ease((p-delay)/.36);
   row.style.clipPath=`inset(0 ${(1-t)*100}% 0 0)`;
   row.style.transform=state.reduced?'none':`translateX(${(side?1:-1)*(1-t)*22}px)`;
   row.style.setProperty('--benefit-draw',String(t));row.inert=t<.99;row.setAttribute('aria-hidden',String(t<.99));
  }));
 });
})();
