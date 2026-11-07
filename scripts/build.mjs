import {buildShelf} from './build-shelf.mjs';
import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [page, style, story, script, logo, pitch, pitchStyle, pitchScript, film, filmStyle, filmScript, filmVideo, filmPoster, packageReference, pitchTheme, hook, hookStyle, hookScript] = await Promise.all([
  read('src/page.html'), read('src/style.css'), read('src/story.html'), read('src/story.js'),
  readFile(new URL('assets/sorami-logo-original.png', root)),
  read('src/pitch.html'), read('src/pitch.css'), read('src/pitch.js'),
  read('src/film.html'), read('src/film.css'), read('src/film.js'),
  readFile(new URL('assets/sorami-opening.mp4', root)),
  readFile(new URL('assets/sorami-opening-poster.jpg', root)),
  readFile(new URL('assets/sorami-package-reference.png', root)),read('src/pitch-theme.css'),
  read('src/hook.html'),read('src/hook.css'),read('src/hook.js')
]);
const artwork = story.replace('__SORAMI_LOGO__', () => `data:image/png;base64,${logo.toString('base64')}`)
  .replace('__PACKAGE_REFERENCE__', () => `data:image/png;base64,${packageReference.toString('base64')}`);
const opening = film.replace('__FILM_VIDEO__', () => `data:video/mp4;base64,${filmVideo.toString('base64')}`)
  .replace('__FILM_POSTER__', () => `data:image/jpeg;base64,${filmPoster.toString('base64')}`);
const shelf = await buildShelf(root, hook, hookScript);
const html = page.replace('/*__STYLE__*/', () => style+'\n'+pitchStyle+'\n'+pitchTheme+'\n'+filmStyle+'\n'+hookStyle)
  .replace('<!--__STORY__-->', () => shelf.html+'\n'+opening+'\n'+artwork+'\n'+pitch)
  .replace('/*__SCRIPT__*/', () => script+'\n'+pitchScript+'\n'+filmScript+'\n'+shelf.script);
await writeFile(new URL('index.html', root), html);
console.log('Built Sorami index.html — interactive shelf, opening film, cup assembly, and 11 pitch chapters, offline.');
