import {readFile} from 'node:fs/promises';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildResearch(root){
 const read=p=>readFile(new URL(p,root),'utf8');
 const [template,script,raw,grainsRaw]=await Promise.all([read('src/research.html'),read('src/research.js'),read('src/research.json'),read('src/grain-benefits.json')]);
 const data=JSON.parse(raw),grains=JSON.parse(grainsRaw);
 const rows=data.recipe.map(r=>`<tr><th scope="row"><i class="research-${r.tone}"></i>${escape(r.name)}</th><td>${r.percent}%</td></tr>`).join('');
 const head=`<tr><th scope="col">Nutrient</th>${grains.map(g=>`<th scope="col"><a href="${escape(g.nutritionSource)}" target="_blank" rel="noopener">${g.name==='Millet'?'Proso millet':g.name} ↗</a></th>`).join('')}</tr>`;
 const nutrients=[['Energy',g=>`${g.nutrition.energyKcal} kcal`],['Protein',g=>`${g.nutrition.protein}g`],['Carbohydrate',g=>`${g.nutrition.carbohydrate}g`],['Fat',g=>`${g.nutrition.fat}g`],['Fibre',g=>`${g.fibre}g`],['Magnesium',g=>`${g.minerals.magnesium}mg`],['Phosphorus',g=>`${g.minerals.phosphorus}mg`]];
 const nutrition=nutrients.map(([label,value])=>`<tr><th scope="row">${label}</th>${grains.map(g=>`<td>${value(g)}</td>`).join('')}</tr>`).join('');
 const html=template.replace('<!--__RESEARCH_RECIPE__-->',rows).replace('<!--__RESEARCH_NUTRIENT_HEAD__-->',head).replace('<!--__RESEARCH_NUTRIENTS__-->',nutrition).replace('__DRYING_SOURCE__',escape(data.dryingSource)).replace('__STRAND_SOURCE__',escape(data.strandSource)).replace('__CUP_PROTEIN__',data.cupTargets.protein).replace('__CUP_FIBRE__',data.cupTargets.fibre).replace('__CUP_SODIUM__',data.cupTargets.sodium);
 return {html,script:script.replace('/*__RESEARCH_DATA__*/',JSON.stringify(data))};
}
