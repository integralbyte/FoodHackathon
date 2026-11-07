import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [page, style, story, script, logo] = await Promise.all([
  read('src/page.html'), read('src/style.css'), read('src/story.html'), read('src/story.js'),
  readFile(new URL('assets/sorami-logo-original.png', root))
]);
const artwork = story.replace('__SORAMI_LOGO__', () => `data:image/png;base64,${logo.toString('base64')}`);
const html = page.replace('/*__STYLE__*/', () => style)
  .replace('<!--__STORY__-->', () => artwork)
  .replace('/*__SCRIPT__*/', () => script);
await writeFile(new URL('index.html', root), html);
console.log('Built Sorami index.html — embedded logo, standalone, offline.');
