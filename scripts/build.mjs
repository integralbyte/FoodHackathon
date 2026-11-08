import {buildShelf} from './build-shelf.mjs';
import {buildGrainBenefits} from './build-grain-benefits.mjs';
import {buildResearch} from './build-research.mjs';
import {buildOpeningStats} from './build-opening-stats.mjs';
import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [page, style, story, script, logo, pitch, pitchStyle, pitchScript, film, filmStyle, filmScript, filmVideo, filmPoster, packageReference, pitchTheme, hook, hookStyle, hookScript, journey, journeyStyle, journeyScript, benefitStyle, benefitScript, researchStyle] = await Promise.all([
  read('src/page.html'), read('src/style.css'), read('src/story.html'), read('src/story.js'),
  readFile(new URL('assets/sorami-logo-original.png', root)),
  read('src/pitch.html'), read('src/pitch.css'), read('src/pitch.js'),
  read('src/film.html'), read('src/film.css'), read('src/film.js'),
  readFile(new URL('assets/sorami-opening.mp4', root)),
  readFile(new URL('assets/sorami-opening-poster.jpg', root)),
  readFile(new URL('assets/sorami-package-reference.png', root)),read('src/pitch-theme.css'),
  read('src/hook.html'),read('src/hook.css'),read('src/hook.js'),
  read('src/journey.html'),read('src/journey.css'),read('src/journey.js'),
  read('src/grain-benefits.css'),read('src/grain-benefits.js'),read('src/research.css')
]);
const artwork = story.replace('__SORAMI_LOGO__', () => `data:image/png;base64,${logo.toString('base64')}`)
  .replace('__PACKAGE_REFERENCE__', () => `data:image/png;base64,${packageReference.toString('base64')}`);
const impactFilm = film.replace('__FILM_VIDEO__', () => `data:video/mp4;base64,${filmVideo.toString('base64')}`)
  .replace('__FILM_POSTER__', () => `data:image/jpeg;base64,${filmPoster.toString('base64')}`);
const shelf = await buildShelf(root, hook, hookScript);
const benefits=await buildGrainBenefits(root);
const research=await buildResearch(root);
const openingStats=await buildOpeningStats(root);
const launchStyle=await read('src/launch.css');
const navigationScript=await read('src/navigation.js');
const fillFormulation=s=>s.replaceAll('__GRAIN_SHARE__',String(research.formulation.grainPercent)).replaceAll('__OTHER_SHARE__',String(research.formulation.otherPercent)).replaceAll('__GRAIN_GRAMS__',String(research.formulation.grainGrams)).replaceAll('__GRAIN_TONNES__',(research.formulation.grainGrams/10).toFixed(1));
const deck=fillFormulation(pitch.replace('<!--__RESEARCH_CHAPTER__-->',()=>research.html).replace('<!--__IMPACT_FILM__-->',()=>impactFilm));
const economicScript=fillFormulation(pitchScript.replace('/*__COST_MODEL__*/',()=>JSON.stringify(research.model)).replace('/*__FORMULATION__*/',()=>JSON.stringify(research.formulation)));
const joined=journey.replace('<!--__JOURNEY_SHELF__-->',()=>shelf.html).replace('<!--__JOURNEY_ASSEMBLY__-->',()=>artwork).replace('<!--__GRAIN_BENEFITS__-->',()=>benefits);
const html = page.replace('/*__STYLE__*/', () => style+'\n'+pitchStyle+'\n'+pitchTheme+'\n'+filmStyle+'\n'+hookStyle+'\n'+journeyStyle+'\n'+benefitStyle+'\n'+researchStyle+'\n'+launchStyle+'\n'+openingStats.css)
  .replace('<!--__STORY__-->', () => openingStats.html+'\n<script>'+openingStats.script+'</script>\n'+joined+'\n'+deck)
  .replace('/*__SCRIPT__*/', () => journeyScript+'\n'+script+'\n'+research.script+'\n'+economicScript+'\n'+filmScript+'\n'+shelf.script+'\n'+benefitScript+'\n'+openingStats.transitionScript+'\n'+navigationScript);
await writeFile(new URL('index.html', root), html);
console.log('Built Sorami index.html — count-up opening, joined shelf and reverse cup animation, film, and 11 pitch chapters, offline.');
