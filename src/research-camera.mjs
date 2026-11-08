// Image-space coordinates keep each zoom attached to the supplied 1536 × 1024 kit.
export const researchKitRegions={
 label:{x:1028,y:153,width:192,height:349},
 seasoning:{x:529,y:681,width:283,height:291},
 noodles:{x:1161,y:681,width:316,height:279}
};
export const researchTourStops=[.8,1.8,2.4,3.8,4.7,5.8,6.8];
const cameraClamp=v=>Math.max(0,Math.min(1,v));
const cameraEase=v=>{v=cameraClamp(v);return v*v*v*(v*(v*6-15)+10)};
const cameraMix=(a,b,t)=>a+(b-a)*t;

export function researchCameraPose(name,width,height,phone=width<=620){
 let region={x:0,y:0,width:1536,height:1024},box={x:0,y:0,width,height};
 if(name==='label'){
  region=researchKitRegions.label;
  box=phone?{x:0,y:height*.06,width:width*.46,height:height*.88}:{x:width*.045,y:height*.025,width:width*.4,height:height*.95};
 }else if(name==='seasoning'){
  region=researchKitRegions.seasoning;
  box=phone?{x:width*.19,y:height*.57,width:width*.62,height:height*.4}:{x:width*.57,y:height*.07,width:width*.37,height:height*.86};
 }else if(name==='noodles'){
  region=researchKitRegions.noodles;
  box=phone?{x:width*.1,y:height*.53,width:width*.8,height:height*.44}:{x:width*.54,y:height*.14,width:width*.44,height:height*.75};
 }
 const scale=Math.min(box.width/region.width,box.height/region.height);
 const left=box.x+(box.width-region.width*scale)/2,top=box.y+(box.height-region.height*scale)/2;
 return {scale,x:left-region.x*scale,y:top-region.y*scale,clip:{left,top,right:left+region.width*scale,bottom:top+region.height*scale}};
}

export function sampleResearchCamera(progress,width,height,reduced=false,phone=width<=620,contentFrame={x:0,y:0,width,height}){
 width=Math.max(1,width);height=Math.max(1,height);
 const u=Math.max(0,Math.min(7,progress*7)),step=Math.min(6,Math.floor(u));
 const focusedPose=name=>{
  const p=researchCameraPose(name,contentFrame.width,contentFrame.height,phone);
  p.x+=contentFrame.x;p.y+=contentFrame.y;
  for(const edge of ['left','right'])p.clip[edge]+=contentFrame.x;
  for(const edge of ['top','bottom'])p.clip[edge]+=contentFrame.y;
  return p;
 };
 const poses={label:focusedPose('label'),kit:researchCameraPose('kit',width,height,phone),seasoning:focusedPose('seasoning'),noodles:focusedPose('noodles')};
 let from='label',to='label',amount=0;
 if(u>=1.9&&u<2.4){to='kit';amount=cameraEase((u-1.9)/.5)}
 else if(u>=2.4&&u<2.9)from=to='kit';
 else if(u>=2.9&&u<3.35){from='kit';to='seasoning';amount=cameraEase((u-2.9)/.45)}
 else if(u>=3.35&&u<3.9)from=to='seasoning';
 else if(u>=3.9&&u<4.4){from='seasoning';to='kit';amount=cameraEase((u-3.9)/.5)}
 else if(u>=4.4&&u<4.9)from=to='kit';
 else if(u>=4.9&&u<5.35){from='kit';to='noodles';amount=cameraEase((u-4.9)/.45)}
 else if(u>=5.35)from=to='noodles';
 if(reduced){from=to=['label','label','kit','seasoning','kit','noodles','noodles'][step];amount=0}
 const a=poses[from],b=poses[to],clip={};
 for(const edge of ['left','top','right','bottom'])clip[edge]=cameraMix(a.clip[edge],b.clip[edge],amount);
 const emerge=reduced?1:cameraEase((u-.9)/.45),handoff=reduced?(step>=5?1:0):cameraEase((u-5.46)/.28);
 clip.top=cameraMix(clip.bottom,clip.top,emerge);
 clip.left=cameraMix(clip.left,clip.right,handoff);
 return {
  step,from,to,amount,emerge,handoff,
  labelBlend:reduced?(step===1?1:0):1-cameraEase((u-1.98)/.24),
  visible:handoff<1&&(reduced?step>0:u>.9),
  scale:Math.exp(cameraMix(Math.log(a.scale),Math.log(b.scale),amount)),
  x:cameraMix(a.x,b.x,amount),y:cameraMix(a.y,b.y,amount),clip
 };
}
