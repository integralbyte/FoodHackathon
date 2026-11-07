import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [page, style, story, script] = await Promise.all([
  read('src/page.html'), read('src/style.css'), read('src/story.html'), read('src/story.js')
]);
const html = page.replace('/*__STYLE__*/', () => style)
  .replace('<!--__STORY__-->', () => story)
  .replace('/*__SCRIPT__*/', () => script);
await writeFile(new URL('index.html', root), html);
console.log('Built index.html — standalone, offline, no external dependencies.');
