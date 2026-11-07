import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [page, style, story, script, logo, pitch, pitchStyle, pitchScript] = await Promise.all([
  read('src/page.html'), read('src/style.css'), read('src/story.html'), read('src/story.js'),
  readFile(new URL('assets/sorami-logo-original.png', root)),
  read('src/pitch.html'), read('src/pitch.css'), read('src/pitch.js')
]);
const artwork = story.replace('__SORAMI_LOGO__', () => `data:image/png;base64,${logo.toString('base64')}`);
const html = page.replace('/*__STYLE__*/', () => style+'\n'+pitchStyle)
  .replace('<!--__STORY__-->', () => artwork+'\n'+pitch)
  .replace('/*__SCRIPT__*/', () => script+'\n'+pitchScript);
await writeFile(new URL('index.html', root), html);
console.log('Built Sorami index.html — cup assembly + 11 interactive pitch chapters, offline.');
