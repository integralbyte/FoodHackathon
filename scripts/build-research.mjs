import {readFile} from 'node:fs/promises';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const range=(values,unit='')=>`${values.join('–')}${unit}`;
const rows=items=>items.map(([label,value])=>`<tr><th scope="row">${escape(label)}</th><td>${escape(value)}</td></tr>`).join('');
export async function buildResearch(root){
 const read=p=>readFile(new URL(p,root),'utf8');
 const [template,script,raw,camera,kit]=await Promise.all([read('src/research.html'),read('src/research.js'),read('src/research.json'),read('src/research-camera.mjs'),readFile(new URL('assets/sorami-spicy-garlic-kit.png',root))]);
 const data=JSON.parse(raw),p=data.process,pack=data.pack,total=pack.noodlesGrams+pack.seasoningGrams+pack.toppingsGrams;
 const chart=columns=>{
  const count=data.flow.length,rowCount=Math.ceil(count/columns),positions=data.flow.map((_,i)=>{const row=Math.floor(i/columns),slot=i%columns;return {row,col:row%2?columns-1-slot:slot}});
  const nodes=data.flow.map((step,i)=>{
   const a=positions[i],b=positions[i+1],direction=b?(b.row>a.row?'down':b.col>a.col?'right':'left'):null;
   const link=direction?`<i class="research-flow-link is-${direction}" data-flow-link="${i}" data-flow-direction="${direction}" data-flow-from="${step.id}" data-flow-to="${data.flow[i+1].id}" aria-hidden="true"></i>`:'';
   return `<li class="research-flow-cell" style="grid-row:${a.row+1};grid-column:${a.col+1}"><div class="research-flow-node${step.id==='vacuum'?' is-innovation':''}" data-flow-node="${i}"><span>${escape(step.label).replace('Microwave-vacuum','Microwave-<wbr>vacuum')}</span></div>${link}</li>`;
  }).join('');
  const stages=columns===4?['Preparation','Forming & drying','Finishing & packing']:['Preparation','Forming','Drying','Packing'];
  return `<div class="research-flow-layout research-flow-${columns}" data-flow-layout="${columns}"><div class="research-flow-main" style="--flow-columns:${columns};--flow-rows:${rowCount}"><div class="research-flow-stages" aria-hidden="true">${stages.map(label=>`<span>${escape(label)}</span>`).join('')}</div><ol class="research-flow-grid">${nodes}</ol></div><div class="research-flow-branches"><div class="research-branch-links" aria-hidden="true"><i class="research-branch-bar"></i><i class="research-branch-leg is-first"></i><i class="research-branch-leg is-second"></i><i class="research-branch-up"></i></div><div class="research-flow-node research-flow-branch" data-flow-branch="0">Seasoning</div><div class="research-flow-node research-flow-branch" data-flow-branch="1">Toppings</div></div></div>`;
 };
 const replacements={
  '__PRODUCT_KIT_IMAGE__':`data:image/png;base64,${kit.toString('base64')}`,
  '<!--__NOODLE_RECIPE__-->':data.noodleRecipe.map((name,i)=>`<li data-recipe-line="${i}"><span>${escape(name)}</span></li>`).join(''),
  '<!--__PACKAGE_NUTRITION__-->':rows([['Calories',`${data.packageMockup.calories} kcal`],['Protein',`${data.packageMockup.proteinGrams}g`],['Fibre',`${data.packageMockup.fibreGrams}g`],['Sodium',`${data.packageMockup.sodiumMg}mg`]]),
  '<!--__PROCESS_FLOWCHART__-->':chart(4)+chart(3),
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
 return {html,script:script.replace('/*__RESEARCH_DATA__*/',()=>JSON.stringify(data)).replace('/*__RESEARCH_CAMERA__*/',()=>camera.replace(/^export /gm,''))};
}
