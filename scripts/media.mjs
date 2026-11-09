import {readFile} from 'node:fs/promises';

export async function createMediaResolver(root,{offline=false}={}){
 const manifest=JSON.parse(await readFile(new URL('assets/web/manifest.json',root),'utf8'));
 const cache=new Map();
 return async source=>{
  const file=manifest[source]?.src??source;
  if(!offline)return file;
  if(!cache.has(file))cache.set(file,readFile(new URL(file,root)).then(bytes=>{
   const extension=file.split('.').at(-1),mime={webp:'image/webp',png:'image/png',jpg:'image/jpeg',mp4:'video/mp4'}[extension];
   if(!mime)throw new Error(`Unsupported media type: ${file}`);
   return `data:${mime};base64,${bytes.toString('base64')}`;
  }));
  return cache.get(file);
 };
}
