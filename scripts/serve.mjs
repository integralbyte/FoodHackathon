import {createServer} from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,sep,extname} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4'};
const port = Number(process.env.PORT || 8766);
const server = createServer(async (req, res) => {
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return}
    const page=pathname==='/'||pathname==='/index.html',file=resolve(root,page?'index.html':'.'+pathname);
    if(!page&&(!pathname.startsWith('/assets/')||!file.startsWith(resolve(root,'assets')+sep))){res.writeHead(404);res.end('Not found');return}
    const info=await stat(file);
    if(!info.isFile()){res.writeHead(404);res.end('Not found');return}
    const headers={'content-type':types[extname(file)]||'application/octet-stream','cache-control':page?'no-cache':pathname.startsWith('/assets/web/')?'public, max-age=31536000, immutable':'public, max-age=600','accept-ranges':'bytes'};
    let start=0,end=info.size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(match&&(match[1]||match[2])){
        start=match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]));
        end=match[1]&&match[2]?Math.min(end,Number(match[2])):end;
      }else start=info.size;
      if(start>end||start>=info.size){res.writeHead(416,{'content-range':`bytes */${info.size}`});res.end();return}
      status=206;headers['content-range']=`bytes ${start}-${end}/${info.size}`;
    }
    headers['content-length']=end-start+1;
    res.writeHead(status,headers);
    if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
  } catch {
    res.writeHead(404, {'content-type':'text/plain'}); res.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
