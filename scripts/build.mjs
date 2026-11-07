import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [page, style, story, script, logo, pitch, pitchStyle, pitchScript, film, filmStyle, filmScript, filmVideo, filmPoster] = await Promise.all([
  read('src/page.html'), read('src/style.css'), read('src/story.html'), read('src/story.js'),
  readFile(new URL('assets/sorami-logo-original.png', root)),
  read('src/pitch.html'), read('src/pitch.css'), read('src/pitch.js'),
  read('src/film.html'), read('src/film.css'), read('src/film.js'),
  readFile(new URL('assets/sorami-opening.mp4', root)),
  readFile(new URL('assets/sorami-opening-poster.jpg', root))
]);
const artwork = story.replace('__SORAMI_LOGO__', () => `data:image/png;base64,${logo.toString('base64')}`);
const opening = film.replace('__FILM_VIDEO__', () => `data:video/mp4;base64,${filmVideo.toString('base64')}`)
  .replace('__FILM_POSTER__', () => `data:image/jpeg;base64,${filmPoster.toString('base64')}`);
const html = page.replace('/*__STYLE__*/', () => style+'\n'+pitchStyle+'\n'+filmStyle)
  .replace('<!--__STORY__-->', () => opening+'\n'+artwork+'\n'+pitch)
  .replace('/*__SCRIPT__*/', () => script+'\n'+pitchScript+'\n'+filmScript);
await writeFile(new URL('index.html', root), html);
console.log('Built Sorami index.html — opening film, cup assembly, and 11 pitch chapters, offline.');
