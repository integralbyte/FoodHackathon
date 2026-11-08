import {readFile} from 'node:fs/promises';
import {calculateLaunchModel} from '../src/cost-model.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const range=(values,unit='')=>`${values.join('–')}${unit}`;
const rows=items=>items.map(([label,value])=>`<tr><th scope="row">${escape(label)}</th><td>${escape(value)}</td></tr>`).join('');
export async function buildResearch(root){
 const read=p=>readFile(new URL(p,root),'utf8');
 const [template,script,raw,camera,kit,nutritionLabel]=await Promise.all([read('src/research.html'),read('src/research.js'),read('src/research.json'),read('src/research-camera.mjs'),readFile(new URL('assets/sorami-spicy-garlic-kit.png',root)),read('assets/sorami-nutrition-facts.svg')]);
 const data=JSON.parse(raw),p=data.process,pack=data.pack,total=pack.noodlesGrams+pack.seasoningGrams+pack.toppingsGrams;
 const grainPercent=data.noodleRecipe.slice(0,2).reduce((sum,r)=>sum+r.percent,0);
 const formulation={grainPercent,otherPercent:100-grainPercent,grainGrams:pack.noodlesGrams*grainPercent/100};
 const [launchTemplate,launchScript,launchRaw]=await Promise.all([read('src/launch.html'),read('src/launch.js'),read('src/launch.json')]);
 const model=calculateLaunchModel(JSON.parse(launchRaw)),cash=v=>`$${v.toFixed(2)}`;
 data.steps.push(...model.steps);
 const costNames=['Ingredients','Packaging','Production','Setup & testing','Delivery'];
 let costOffset=0;
 const costParts=model.pilot.breakdown.map(([,value],i)=>{
  const share=value/model.pilot.cost,mid=costOffset+share/2;costOffset+=share;
  return {name:costNames[i],value,share,mid,index:i};
 });
 const launchReplacements={
  '__PILOT_COST__':cash(model.pilot.cost),'__SELLING_PRICE__':cash(model.price),
  '<!--__COST_SEGMENTS__-->':costParts.map(c=>`<i class="launch-cost-segment is-cost-${c.index}" data-cost-segment="${c.index}" style="flex-basis:${c.share*100}%"></i>`).join(''),
  '<!--__COST_CONNECTORS__-->':costParts.map(c=>`<path class="is-cost-${c.index}" data-cost-connector="${c.index}" pathLength="1" d="M${c.mid*1000} 0V18L${(c.index+.5)*200} 58V76"/>`).join(''),
  '<!--__COST_LABELS__-->':costParts.map(c=>`<li class="is-cost-${c.index}" data-cost-label="${c.index}"><span>${escape(c.name)}</span><strong>${cash(c.value)}</strong></li>`).join(''),
  '<!--__COMMUNITY_CUPS__-->':Array.from({length:22},(_,i)=>`<i class="launch-mini-cup${i===21?' is-pantry':i===20?' is-spacer':''}"${i===20?'':` data-community-cup="${i}"`} aria-hidden="true"></i>`).join('')
 };
 let launchHTML=launchTemplate;for(const [key,value] of Object.entries(launchReplacements))launchHTML=launchHTML.replaceAll(key,value);
 const hazardBadges=codes=>`<span class="research-hazard-badges" role="img" aria-label="${escape(codes.map(code=>data.hazardKey.find(h=>h.code===code).label).join(', '))} hazards"><span aria-hidden="true">${codes.map(code=>{const h=data.hazardKey.find(h=>h.code===code);return `<i class="research-hazard is-${h.class}" title="${h.label}">${code}</i>`}).join('')}</span></span>`;
 const boxContents=step=>`${step.control?`<span class="research-flow-control" aria-label="Proposed control ${step.control}"><span>Control </span>${step.control}</span>`:''}${hazardBadges(step.hazards)}<span class="research-flow-label">${escape(step.label).replace('Microwave-vacuum','Microwave-<wbr>vacuum')}</span>${step.note?`<small class="research-flow-note">${escape(step.note)}</small>`:''}`;
 const chart=columns=>{
  const count=data.flow.length,rowCount=Math.ceil(count/columns),positions=data.flow.map((_,i)=>{const row=Math.floor(i/columns),slot=i%columns;return {row,col:row%2?columns-1-slot:slot}});
  const nodes=data.flow.map((step,i)=>{
   const a=positions[i],b=positions[i+1],direction=b?(b.row>a.row?'down':b.col>a.col?'right':'left'):null;
   const link=direction?`<i class="research-flow-link is-${direction}" data-flow-link="${i}" data-flow-direction="${direction}" data-flow-from="${step.id}" data-flow-to="${data.flow[i+1].id}" aria-hidden="true"></i>`:'';
   return `<li class="research-flow-cell" style="grid-row:${a.row+1};grid-column:${a.col+1}"><div class="research-flow-node${step.control?' is-control':''}${step.note?' has-note':''}" data-flow-node="${i}">${boxContents(step)}</div>${link}</li>`;
  }).join('');
  const stages=columns===4?['Preparation','Forming & drying','Finishing & packing']:['Preparation','Forming','Drying','Packing'];
  return `<div class="research-flow-layout research-flow-${columns}" data-flow-layout="${columns}"><div class="research-flow-main" style="--flow-columns:${columns};--flow-rows:${rowCount}"><div class="research-flow-stages" aria-hidden="true">${stages.map(label=>`<span>${escape(label)}</span>`).join('')}</div><ol class="research-flow-grid">${nodes}</ol></div><div class="research-flow-branches"><div class="research-branch-links" aria-hidden="true"><i class="research-branch-bar"></i><i class="research-branch-leg is-first"></i><i class="research-branch-leg is-second"></i><i class="research-branch-up"></i></div>${data.flowBranches.map((step,i)=>`<div class="research-flow-node research-flow-branch has-note" data-flow-branch="${i}">${boxContents(step)}</div>`).join('')}</div></div>`;
 };
 const legend=`<div class="research-flow-key" aria-label="Flowchart legend">${data.hazardKey.map(h=>`<span class="research-flow-key-item"><i class="research-hazard is-${h.class}" aria-hidden="true">${h.code}</i>${h.label}</span>`).join('')}<span class="research-flow-key-item"><i class="research-control-swatch" aria-hidden="true"></i>Proposed control</span></div>`;
 const replacements={
  '<!--__LAUNCH_SCENES__-->':launchHTML,
  '<!--__LAUNCH_DETAILS__-->':`<section data-research-details="costs" hidden><p class="research-explanation">One-flavour Spicy Garlic scenario adapted from the supplied Sorami_Cost_Model_v9.xlsx. USD per 78g cup. Pilot: 50,000 cups in one run. Scale: ten 100,000-cup runs per year. These are model estimates, not manufacturing quotes.</p><table class="research-table"><thead><tr><th>Per cup</th><td>Pilot</td><td>Scale</td></tr></thead><tbody>${model.pilot.breakdown.map(([label,v],i)=>`<tr><th>${escape(label)}</th><td>${cash(v)}</td><td>${cash(model.scale.breakdown[i][1])}</td></tr>`).join('')}<tr><th>Total make &amp; deliver</th><td>${cash(model.pilot.cost)}</td><td>${cash(model.scale.cost)}</td></tr></tbody></table><p class="research-footnote">Start with Summary!D40:E40 (Spicy Garlic in a shared two-flavour run). Remove the extra-flavour changeover: $750 ÷ 50,000 pilot; $500 ÷ 100,000 scale. Remove four extra-flavour tests at $60 pilot / $50 scale. All other rates stay unchanged. The full $30,400 start-up budget is retained conservatively, including its two-flavour design and trial allowances.</p><h3>Price &amp; channels</h3><p class="research-explanation">Planned price: ${cash(model.price)}. Pilot direct sales deduct 3% card fees. Retail deducts 30% retailer margin, then 13% distributor margin, then 18% trade promotions. That leaves ${cash(model.retailNet)} revenue and ${cash(model.scale.gross)} gross profit per scale cup, before overhead, tax and pantry support. Cups sold direct in packs or introductory offers earn less than the single-cup example.</p><p class="research-footnote">Inputs!B6:C18, B20:C29; Summary!D57:E61; Ingredients!G42:H42. Ingredient loss is 8% pilot / 4% scale. Microwave-vacuum processing, specialty ingredients, printed sachets and lids still need quotes. The workbook uses ±20% cost sensitivity; the one-flavour ranges are ${cash(model.pilot.cost*.8)}–${cash(model.pilot.cost*1.2)} pilot and ${cash(model.scale.cost*.8)}–${cash(model.scale.cost*1.2)} scale. These are scenarios, not confidence intervals.</p></section>
  <section data-research-details="launch" hidden><p class="research-explanation">Proposed one-flavour campus launch, using Pilot plan and Scale plan from the supplied workbook. Sales targets and phase dates are planning assumptions, not orders or customer commitments.</p><table class="research-table research-settings"><tbody>${rows([['First run','50,000 Spicy Garlic cups'],['Cash for the batch',cash(model.pilot.cost*model.pilot.cupsPerRun)],['Start-up budget',cash(model.startupBudget)],['Pre-launch marketing',cash(model.prelaunchMarketing)],['Cash to begin',cash(model.launchCash)],['Three-month sales target',`${model.sold.toLocaleString('en-US')} cups`],['Samples + pantry cups','500 samples + 342 pantry cups'],['Stock after three months',`${model.stock.toLocaleString('en-US')} cups`],['Three-month operating result',`−${cash(-model.operating)} including start-up and marketing`]])}</tbody></table><h3>Launch sequence</h3><p class="research-explanation">The presentation now starts with a proposed Cornell Dining Hall launch in months 1–3, then other campuses in months 4–12 and grocery stores in year 2. No dining-hall agreement or purchase order is claimed. The workbook’s underlying sales and cash scenario still assumes Cornell pop-ups and online packs; dining-hall pricing and channel costs have not been modelled separately. The workbook targets 6,000+ sales, repeat buyers and a taste-test win before expansion. Months 4–12: Upstate NY campuses and local grocers, remaining mostly direct. Year 2: broader retail after signed orders and a co-packer quote for 100,000+ cups per run.</p><p class="research-footnote">The 6,840-cup plan is 4,400 full-price singles, 1,440 online pack cups and 1,000 introductory cups; card fees and discounts are included in the operating result. At the month-3 pace, remaining stock would take about 16 months to sell, beyond the planned 12-month shelf life. Begin regional sales by month 4 or reduce the initial batch. Retail at pilot cost loses about ${cash(model.pilot.cost-model.retailNet)} per cup before overhead; scale is conditional on lower costs and orders. Shipping on online parcels is charged separately to buyers. References: Pilot plan!B5:B12, C18:E25, B34:E43, B46:B62; Scale plan!B5:D23. The starting cash figure excludes later overhead and any extra financing reserve.</p></section>
  <section data-research-details="sustainability" hidden><h3>Packaging design</h3><p class="research-explanation">The cost model proposes an insulated polypropylene (PP) cup, printed directly, with a high-barrier mono-PP peelable lid and no separate paper sleeve. This is a design target; the illustrated foil-lid package elsewhere in the pitch is concept artwork. The seasoning and toppings still use two high-barrier laminate sachets.</p><p class="research-footnote">Packaging!A5:I12. Pilot cup + lid: $0.295; scale: $0.108. A separate sleeve is set to zero units. The former sleeve line was $0.12 pilot / $0.03 scale; those figures are not additional savings deducted in this adaptation. Material compatibility and local collection must be checked before making recyclability claims. No packaging mass, lifecycle assessment or measured carbon reduction was supplied.</p><h3>Campus pantry proposal</h3><p class="research-explanation">One cup donated for every 20 sold. At the modelled cup cost, this allocates about ${(model.pilot.pantry*100).toFixed(1)}¢ per pilot sale or ${(model.scale.pantry*100).toFixed(1)}¢ per scale sale, before extra program delivery costs. The three-month plan would donate 342 cups. This is a proposed program, not an existing commitment.</p><p class="research-footnote">Pilot plan!B11 and C23:F23. The grains’ drought tolerance is discussed in the earlier grain scene; no lower water-use or carbon-footprint claim is inferred for the finished product. Non-fried processing is not evidence of lower manufacturing energy, especially with refrigerated holding and microwave-vacuum treatment.</p></section>`,
  '__PRODUCT_KIT_IMAGE__':`data:image/png;base64,${kit.toString('base64')}`,
  '__CLEAN_NUTRITION_LABEL__':nutritionLabel,
  '<!--__NOODLE_RECIPE__-->':data.noodleRecipe.map((r,i)=>`<li data-recipe-line="${i}" aria-label="${escape(r.name)}, ${r.percent}%"><span class="research-recipe-name">${escape(r.displayName)}</span><strong class="research-recipe-share">${r.percent}%</strong></li>`).join(''),
  '<!--__RECIPE_DETAILS__-->':rows(data.noodleRecipe.map(r=>[`${r.name} · ${r.percent}%`,r.role])),
  '<!--__PACKAGE_NUTRITION__-->':rows([['Calories',`${data.packageMockup.calories} kcal`],['Protein',`${data.packageMockup.proteinGrams}g`],['Fibre',`${data.packageMockup.fibreGrams}g`],['Sodium',`${data.packageMockup.sodiumMg}mg`]]),
  '<!--__PROCESS_FLOWCHART__-->':chart(4)+chart(3)+legend,
  '<!--__CONTROL_NOTES__-->':rows(data.controls),
  '<!--__FORM_SETTINGS__-->':rows([
   ['Receive & inspect','Quality, safety and supplier specifications; route ingredients to their respective lines.'],
   ['Flour sieving',`≤${range(p.sieveCutMicron,' µm')}; target D50 ${range(p.medianParticleMicron,' µm')}`],
   ['Dry blend',range(p.dryBlendMinutes,' min')],
   ['Added water',`${p.waterPercentDryMass}% of dry ingredient mass; trial range ${range(p.waterTrialPercentDryMass,'%')}`],
   ['Hydrate & mix',range(p.hydrationMixMinutes,' min')],
   ['Steam precondition',`${range(p.steamC,'°C')} for ${range(p.steamMinutes,' min')}`],
   ['Extrude strands',`${p.strandMm.toFixed(1)} mm target; trial range ${range(p.strandTrialMm,' mm')}`]
  ]),
  '<!--__INGREDIENTS__-->':rows(data.ingredients.map(r=>[r.name,r.role])),
  '<!--__CUP_TARGETS__-->':rows([['Protein',`${data.cupTargets.protein}g target`],['Fibre',`${data.cupTargets.fibre}g target`],['Sodium',`${data.cupTargets.sodium}mg target`]]),
  '<!--__OBJECTIVES__-->':data.objectives.map(s=>`<li>${escape(s)}</li>`).join(''),
  '<!--__CHILL_SETTINGS__-->':rows([['Refrigerated hold',`${p.chillHours} hours at ${p.chillC}°C`],['Handling','Covered, food-grade trays after steam preconditioning and extrusion.']]),
  '<!--__DRY_SETTINGS__-->':rows([
   ['Hot-air pre-drying',`${range(p.preDryAirC,'°C')} to ${range(p.preDryMoistureWetPercent,'%')} moisture, wet basis`],
   ['Microwave-vacuum',`${range(p.vacuumAbsoluteKPa,' kPa')} absolute; controlled microwave power; target product ${range(p.microwaveProductC,'°C')}`],
   ['Hot-air finish drying',`${range(p.finishDryAirC,'°C')} to ${range(p.finalMoistureWetPercent,'%')} moisture, wet basis, and aw ≤${p.finalWaterActivityMax.toFixed(2)}`],
   ['Cool before packaging',`Near ambient, ≤${p.packCoolingMaxC}°C, under RH ≤${p.packCoolingRHMax}%`]
  ]),
  '<!--__SEASONING_SETTINGS__-->':rows([
   ['Receive & inspect','Dry seasoning ingredients; quality, safety and supplier specifications.'],
   ['Sieve',`≤${p.seasoningSieveMicronMax} µm`],['Dry blend',range(p.seasoningBlendMinutes,' min')],
   ['Portion & seal',`${pack.seasoningGrams}g sachet`],['Variants',`${data.flavours.join(' / ')}; different seasoning, shared noodle block and toppings.`]
  ]),
  '<!--__TOPPINGS_SETTINGS__-->':rows([['Receive & inspect',data.toppings.join(', ')],['Weigh, blend & seal',`${pack.toppingsGrams}g sachet`]]),
  '<!--__ASSEMBLY_SETTINGS__-->':rows([
   ['Cup contents',`${pack.noodlesGrams}g dried noodle block + ${pack.seasoningGrams}g seasoning sachet + ${pack.toppingsGrams}g toppings sachet = ${total}g net`],
   ['Seal','High-moisture-barrier packaging to minimise moisture ingress.'],
   ['Label','Nutrition Facts, ingredients, allergens, preparation instructions, lot/batch code and expiry or best-before date.'],
   ['Finished inspection','Check moisture, water activity, seal integrity, net weight and label accuracy, especially allergens.'],
   ['Store & distribute',`Cool and dry, ≤${p.storageMaxC}°C and RH ≤${p.storageRHMax}%; then retail and food-service distribution.`]
  ]),
  '<!--__PREPARATION_SETTINGS__-->':rows([
   ['Add sachets','Add the seasoning and toppings to the noodle cup.'],
   ['Add water',`Approximately ${p.preparationWaterMl}mL freshly boiled water at ${range(p.preparationWaterC,'°C')}`],
   ['Cover & stand',`${p.preparationMinutes} min target, then stir.`]
  ]),
  '<!--__QUALITY_SETTINGS__-->':rows([
   ['Complete rehydration',`Within ${p.preparationMinutes} min with boiling water; confirm texture and structural integrity in trials.`],
   ['Rehydration loss',`<${p.rehydrationLossPercentMax}% target`],['Broken noodle mass',`<${p.brokenNoodleMassPercentMax}% target`],
   ['Finished moisture',`${range(p.finalMoistureWetPercent,'%')} wet basis`],['Water activity',`aw ≤${p.finalWaterActivityMax.toFixed(2)} target`],
   ['Resistant starch','Potential retained RS3; its formation and retention must be measured.']
  ]),
  '<!--__TASTE_RESEARCH__-->':data.taste.map(t=>`<section class="research-study"><h4>${escape(t.id==='salt'?'Sea salt in the recipe · published salt research':t.id==='yeast'?'Yeast extract · ≥40% less response from bitter sensors':'MSG · savoury depth')}</h4><p>${escape(t.detail)} ${escape(t.basis)}</p><a class="research-source" href="${escape(t.source)}" target="_blank" rel="noopener">Read the study ↗</a></section>`).join(''),
  '__SALT_NUMBER__':data.taste.find(t=>t.id==='salt').number,'__YEAST_NUMBER__':data.taste.find(t=>t.id==='yeast').number,
  '__DIAMETER__':p.strandMm.toFixed(1),'__CHILL_HOURS__':p.chillHours,'__CHILL_C__':p.chillC,
  '__TOTAL_GRAMS__':total,'__NOODLE_GRAMS__':pack.noodlesGrams,'__SEASONING_GRAMS__':pack.seasoningGrams,'__TOPPING_GRAMS__':pack.toppingsGrams,
  '__PREP_MINUTES__':p.preparationMinutes,'__WATER_ML__':p.preparationWaterMl
 };
 replacements['<!--__PORE_DRY_SETTINGS__-->']=replacements['<!--__DRY_SETTINGS__-->'];
 let html=template;for(const [key,value] of Object.entries(replacements))html=html.replaceAll(key,String(value));
 return {html,model,formulation,script:script.replace('/*__RESEARCH_DATA__*/',()=>JSON.stringify(data)).replace('/*__RESEARCH_CAMERA__*/',()=>camera.replace(/^export /gm,'')).replace('/*__LAUNCH_RUNTIME__*/',()=>launchScript+'\nconst launchScenes=createLaunchScenes(root);')};
}
