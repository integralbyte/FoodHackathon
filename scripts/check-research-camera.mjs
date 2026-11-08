import test from 'node:test';
import assert from 'node:assert/strict';
import {researchKitRegions,researchTourStops,researchCameraPose,sampleResearchCamera} from '../src/research-camera.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
for(const [width,height,phone] of [[1324,624,false],[342,608,true],[598,500,false],[272,400,true]]){
 test(`${width}×${height}: each crop lands on the photographed object and the overview contains the entire kit`,()=>{
  for(const name of ['label','seasoning','noodles','kit']){
   const pose=researchCameraPose(name,width,height,phone),r=researchKitRegions[name]||{x:0,y:0,width:1536,height:1024};
   close(pose.x+r.x*pose.scale,pose.clip.left);close(pose.y+r.y*pose.scale,pose.clip.top);
   close(pose.x+(r.x+r.width)*pose.scale,pose.clip.right);close(pose.y+(r.y+r.height)*pose.scale,pose.clip.bottom);
   assert.ok(pose.clip.left>=0&&pose.clip.top>=0&&pose.clip.right<=width+1e-7&&pose.clip.bottom<=height+1e-7);
   close((pose.clip.right-pose.clip.left)/(pose.clip.bottom-pose.clip.top),r.width/r.height);
  }
 });
 test(`${width}×${height}: camera stops show the intended object and transitions remain continuous`,()=>{
  for(const [i,name] of ['label','label','kit','seasoning','kit','noodles','noodles'].entries()){
   const f=sampleResearchCamera(researchTourStops[i]/7,width,height,false,phone),pose=researchCameraPose(name,width,height,phone);
   assert.equal(f.from,name);assert.equal(f.to,name);close(f.scale,pose.scale);close(f.x,pose.x);close(f.y,pose.y);
  }
  for(const boundary of [.9,1.35,1.9,2.4,2.9,3.35,3.9,4.4,4.9,5.35,5.46,5.74]){
   const a=sampleResearchCamera((boundary-1e-7)/7,width,height,false,phone),b=sampleResearchCamera((boundary+1e-7)/7,width,height,false,phone);
   for(const key of ['scale','x','y'])assert.ok(Math.abs(a[key]-b[key])<.01,`camera jumps at ${boundary}`);
   for(const edge of ['left','top','right','bottom'])assert.ok(Math.abs(a.clip[edge]-b.clip[edge])<.01,`crop jumps at ${boundary}`);
  }
 });
 test(`${width}×${height}: the noodle photograph hands off to diagrams and reduced motion skips camera travel`,()=>{
  assert.equal(sampleResearchCamera(.8/7,width,height).visible,false);
  assert.equal(sampleResearchCamera(5.4/7,width,height).visible,true);
  assert.equal(sampleResearchCamera(5.8/7,width,height).visible,false);
  const names=['label','label','kit','seasoning','kit','noodles','noodles'];
  for(let i=0;i<7;i++){
   const f=sampleResearchCamera((i+.8)/7,width,height,true,phone);
   assert.equal(f.from,names[i]);assert.equal(f.to,names[i]);assert.equal(f.amount,0);
   assert.equal(f.visible,i>0&&i<5);assert.equal(f.handoff,i>=5?1:0);
  }
 });
}
test('overview uses the full screen while label and ingredient close-ups stay beside their text',()=>{
 const frame={x:58,y:113,width:1324,height:612},w=1440,h=900;
 for(const [u,name] of [[1.8,'label'],[3.8,'seasoning'],[5.4,'noodles']]){
  const old=researchCameraPose(name,frame.width,frame.height,false),f=sampleResearchCamera(u/7,w,h,false,false,frame);
  close(f.scale,old.scale);close(f.x,old.x+frame.x);close(f.y,old.y+frame.y);
 }
 for(const u of [2.7,4.7]){
  const f=sampleResearchCamera(u/7,w,h,false,false,frame),old=researchCameraPose('kit',frame.width,frame.height,false);
  close(f.scale,Math.min(w/1536,h/1024));assert.ok(f.scale>old.scale*1.4,'desktop overview must be substantially larger');
  close(f.clip.bottom-f.clip.top,h);assert.ok(f.clip.left>=0&&f.clip.right<=w);
 }
 for(const boundary of [1.9,2.4,2.9,3.35,3.9,4.4,4.9,5.35]){
  const a=sampleResearchCamera((boundary-1e-7)/7,w,h,false,false,frame),b=sampleResearchCamera((boundary+1e-7)/7,w,h,false,false,frame);
  for(const key of ['scale','x','y'])assert.ok(Math.abs(a[key]-b[key])<.01);
  for(const edge of ['left','top','right','bottom'])assert.ok(Math.abs(a.clip[edge]-b.clip[edge])<.01);
 }
});
test('clean label stays opaque when reading and blends into the printed label during zoom-out',()=>{
 assert.equal(sampleResearchCamera(1.8/7,1440,900).labelBlend,1);
 const middle=sampleResearchCamera(2.1/7,1440,900);assert.ok(middle.labelBlend>0&&middle.labelBlend<1);
 for(const u of [2.7,3.8,4.7,5.8,6.8])assert.equal(sampleResearchCamera(u/7,1440,900).labelBlend,0);
 assert.equal(sampleResearchCamera(1.8/7,390,844,true).labelBlend,1);
 assert.equal(sampleResearchCamera(2.7/7,390,844,true).labelBlend,0);
});
