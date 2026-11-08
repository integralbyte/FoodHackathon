const handoffClamp=v=>Math.max(0,Math.min(1,v));
const handoffEase=v=>{v=handoffClamp(v);return v*v*(3-2*v)};
const handoffPhase=(v,a,b)=>handoffEase((v-a)/(b-a));
export function sampleOpeningHandoff(scrolled,contentHeight,viewportHeight,reduced=false){
 const distance=Math.max(1,viewportHeight),start=Math.max(0,contentHeight-distance),progress=handoffClamp((scrolled-start)/distance);
 if(reduced){const next=progress>=.5;return {progress,introOpacity:next?0:1,shelfOpacity:next?1:0,imageScale:1,shelfScale:1,cards:Array(6).fill(next?1:0)}}
 return {
  progress,
  introOpacity:1-handoffPhase(progress,.33,.94),
  shelfOpacity:handoffPhase(progress,.22,.90),
  imageScale:1+handoffEase(progress)*.08,
  shelfScale:1+(1-handoffEase(progress))*.035,
  cards:Array.from({length:6},(_,i)=>handoffPhase(progress,.02+i*.05,.46+i*.05))
 };
}
