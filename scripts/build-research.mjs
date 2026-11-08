import {readFile} from 'node:fs/promises';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const range=(values,unit='')=>`${values.join('–')}${unit}`;
const rows=items=>items.map(([label,value])=>`<tr><th scope="row">${escape(label)}</th><td>${escape(value)}</td></tr>`).join('');
export async function buildResearch(root){
 const read=p=>readFile(new URL(p,root),'utf8');
 const [template,script,raw]=await Promise.all([read('src/research.html'),read('src/research.js'),read('src/research.json')]);
 const data=JSON.parse(raw),p=data.process,pack=data.pack,total=pack.noodlesGrams+pack.seasoningGrams+pack.toppingsGrams;
 const replacements={
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
  '<!--__TASTE_RESEARCH__-->':data.taste.map(t=>`<section class="research-study"><h4>${escape(t.id==='salt'?'Salt · about 30% less rated bitterness':t.id==='yeast'?'Yeast extract · ≥40% lower receptor activity':'MSG · savoury depth')}</h4><p>${escape(t.detail)} ${escape(t.basis)}</p><a class="research-source" href="${escape(t.source)}" target="_blank" rel="noopener">Read the study ↗</a></section>`).join(''),
  '__DIAMETER__':p.strandMm.toFixed(1),'__CHILL_HOURS__':p.chillHours,'__CHILL_C__':p.chillC,
  '__TOTAL_GRAMS__':total,'__NOODLE_GRAMS__':pack.noodlesGrams,'__SEASONING_GRAMS__':pack.seasoningGrams,'__TOPPING_GRAMS__':pack.toppingsGrams,
  '__PREP_MINUTES__':p.preparationMinutes,'__WATER_ML__':p.preparationWaterMl
 };
 let html=template;for(const [key,value] of Object.entries(replacements))html=html.replaceAll(key,String(value));
 return {html,script:script.replace('/*__RESEARCH_DATA__*/',JSON.stringify(data))};
}
