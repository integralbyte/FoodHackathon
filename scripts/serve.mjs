import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const page = new URL('../index.html', import.meta.url);
const port = Number(process.env.PORT || 8766);
const server = createServer(async (req, res) => {
  if (req.url === '/favicon.ico') {res.writeHead(204); res.end(); return;}
  if (req.url.split('?')[0] !== '/' && req.url.split('?')[0] !== '/index.html') {
    res.writeHead(404, {'content-type':'text/plain'}); res.end('Not found'); return;
  }
  try {
    const html = await readFile(page);
    res.writeHead(200, {'content-type':'text/html; charset=utf-8', 'cache-control':'no-store'});
    res.end(html);
  } catch {
    res.writeHead(500, {'content-type':'text/plain'}); res.end('Build the page with npm run build.');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
