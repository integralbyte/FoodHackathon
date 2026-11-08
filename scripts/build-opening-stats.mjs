import {readFile} from 'node:fs/promises';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildOpeningStats(root){
 const read=p=>readFile(new URL(p,root),'utf8');
 const [template,css,script,raw,products,background,handoff,transition]=await Promise.all([read('src/opening-stats.html'),read('src/opening-stats.css'),read('src/opening-stats.js'),read('src/opening-stats.json'),read('src/shelf-products.json'),readFile(new URL('assets/sorami-opening-shelf.png',root)),read('src/opening-handoff.mjs'),read('src/opening-transition.js')]);
 const data=JSON.parse(raw),catalog=JSON.parse(products),sample=data.sodiumSample.ids.map(id=>catalog.find(p=>p.id===id));
 if(sample.some(p=>!p||p.market!=='U.S.'||!Number.isFinite(p.sodium)))throw new Error('Opening sodium sample must contain sourced U.S. products.');
 const mean=Math.round(sample.reduce((sum,p)=>sum+p.sodium,0)/sample.length);
 const replacements={
  '__OPENING_SHELF_IMAGE__':`data:image/png;base64,${background.toString('base64')}`,
  '__WHOLE_GRAINS__':data.wholeGrains.value,'__WHOLE_GRAINS_BASIS__':escape(data.wholeGrains.basis),'__WHOLE_GRAINS_SOURCE__':escape(data.wholeGrains.source),
  '__SODIUM_MEAN__':mean,'__SODIUM_DISPLAY__':mean.toLocaleString('en-US'),'__LESS_SODIUM__':data.lessSodium.value,'__MORE_PROTEIN__':data.moreProtein.value,'__NUTRITION_SHARE__':data.nutritionFocused.value,'__MARKET_SIZE__':data.market.value.toFixed(1),'__MARKET_GROWTH__':data.market.growthPercent,
  '<!--__SODIUM_SAMPLE__-->':sample.map(p=>`<li><a href="${escape(p.source)}" target="_blank" rel="noopener">${escape(p.brand+' '+p.name)}</a><span>${p.sodium.toLocaleString('en-US')}mg</span></li>`).join('')
 };
 let html=template;for(const [key,value] of Object.entries(replacements))html=html.replaceAll(key,()=>String(value));
 return {html,css,script,transitionScript:transition.replace('/*__OPENING_HANDOFF__*/',()=>handoff.replace(/^export /gm,''))};
}
