// A one-flavour adaptation of the supplied v9 workbook. All amounts are USD.
export function calculateLaunchModel(input){
 const cases={};
 const retailNet=input.price*(1-input.retailerMargin)*(1-input.distributorMargin)*(1-input.tradePromotions);
 for(const key of ['pilot','scale']){
  const p=input[key],removed=(p.extraFlavourChangeover+p.extraFlavourTests*p.costPerTest)/p.cupsPerRun;
  const cost=p.spicyGarlicCostSharedRun-removed;
  const breakdown=[['Ingredients',p.ingredients],['Packaging',p.packaging],['Processing',p.processing],['Setup & tests',p.setupAndTestsSharedRun-removed],['Freight & storage',p.freightAndStorage]];
  const net=key==='pilot'?input.price*(1-input.cardFee):retailNet;
  cases[key]={...p,cost,breakdown,net,fees:input.price-net,gross:net-cost,margin:(net-cost)/net,pantry:cost*input.donationPerSale,channel:key==='pilot'?'Campus direct sales':'Retail through a distributor'};
 }
 const sales=input.pilotSales,months=sales.singleCups.map((single,i)=>{
  const sold=single+sales.onlineCups[i]+sales.introCups[i],donated=sold*input.donationPerSale,used=sold+sales.samples[i]+donated;
  const revenue=(single*input.price+sales.onlineCups[i]*sales.onlinePricePerCup+sales.introCups[i]*sales.introPrice)*(1-input.cardFee);
  return {sold,donated,used,revenue,operating:revenue-used*cases.pilot.cost-sales.monthlyMarketing[i]};
 });
 const sold=months.reduce((s,m)=>s+m.sold,0),used=months.reduce((s,m)=>s+m.used,0),stock=input.pilot.cupsPerRun-used;
 const operating=months.reduce((s,m)=>s+m.operating,0)-input.startupBudget-input.prelaunchMarketing;
 return {...input,...cases,retailNet,months,sold,used,stock,operating,launchCash:input.pilot.cupsPerRun*cases.pilot.cost+input.startupBudget+input.prelaunchMarketing};
}
