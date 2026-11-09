import {buildShelf} from './build-shelf.mjs';
import {buildGrainBenefits} from './build-grain-benefits.mjs';
import {buildResearch} from './build-research.mjs';
import {buildOpeningStats} from './build-opening-stats.mjs';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {parseArgs} from 'node:util';
import {createMediaResolver} from './media.mjs';
const root = new URL('../', import.meta.url);
const {values}=parseArgs({options:{offline:{type:'boolean',default:false},output:{type:'string',default:'index.html'}}});
const media=await createMediaResolver(root,{offline:values.offline});
const read = name => readFile(new URL(name, root), 'utf8');
const [page, style, story, script, logo, pitch, pitchStyle, pitchScript, film, filmStyle, filmScript, filmVideo, filmPoster, packageReference, pitchTheme, hook, hookStyle, hookScript, journey, journeyStyle, journeyScript, benefitStyle, benefitScript, researchStyle] = await Promise.all([
  read('src/page.html'), read('src/style.css'), read('src/story.html'), read('src/story.js'),
  media('assets/sorami-logo-transparent.png'),
  read('src/pitch.html'), read('src/pitch.css'), read('src/pitch.js'),
  read('src/film.html'), read('src/film.css'), read('src/film.js'),
  media('assets/sorami-opening.mp4'),
  media('assets/sorami-opening-poster.jpg'),
  media('assets/sorami-package-reference.png'),read('src/pitch-theme.css'),
  read('src/hook.html'),read('src/hook.css'),read('src/hook.js'),
  read('src/journey.html'),read('src/journey.css'),read('src/journey.js'),
  read('src/grain-benefits.css'),read('src/grain-benefits.js'),read('src/research.css')
]);
const artwork = story.replace('__SORAMI_LOGO__', () => logo)
  .replace('__PACKAGE_REFERENCE__', () => packageReference);
const impactFilm = film.replace('__FILM_VIDEO__', () => filmVideo)
  .replace('__FILM_POSTER__', () => filmPoster);
const shelf = await buildShelf(root, hook, hookScript,media);
const benefits=await buildGrainBenefits(root);
const research=await buildResearch(root,media);
const openingStats=await buildOpeningStats(root,media);
const launchStyle=await read('src/launch.css');
const navigationScript=await read('src/navigation.js');
const mediaScript=await read('src/media.js');
const fillFormulation=s=>s.replaceAll('__GRAIN_SHARE__',String(research.formulation.grainPercent)).replaceAll('__OTHER_SHARE__',String(research.formulation.otherPercent)).replaceAll('__GRAIN_GRAMS__',String(research.formulation.grainGrams)).replaceAll('__GRAIN_TONNES__',(research.formulation.grainGrams/10).toFixed(1));
const deck=fillFormulation(pitch.replace('<!--__RESEARCH_CHAPTER__-->',()=>research.html).replace('<!--__IMPACT_FILM__-->',()=>impactFilm));
const economicScript=fillFormulation(pitchScript.replace('/*__COST_MODEL__*/',()=>JSON.stringify(research.model)).replace('/*__FORMULATION__*/',()=>JSON.stringify(research.formulation)));
const joined=journey.replace('<!--__JOURNEY_SHELF__-->',()=>shelf.html).replace('<!--__JOURNEY_ASSEMBLY__-->',()=>artwork).replace('<!--__GRAIN_BENEFITS__-->',()=>benefits);
const html = page.replace('/*__STYLE__*/', () => style+'\n'+pitchStyle+'\n'+pitchTheme+'\n'+filmStyle+'\n'+hookStyle+'\n'+journeyStyle+'\n'+benefitStyle+'\n'+researchStyle+'\n'+launchStyle+'\n'+openingStats.css)
  .replace('<!--__STORY__-->', () => openingStats.html+'\n<script>'+openingStats.script+'</script>\n'+joined+'\n'+deck)
  .replace('/*__SCRIPT__*/', () => journeyScript+'\n'+mediaScript+'\n'+script+'\n'+research.script+'\n'+economicScript+'\n'+filmScript+'\n'+shelf.script+'\n'+benefitScript+'\n'+openingStats.transitionScript+'\n'+navigationScript);
const output=new URL(values.output,root);
await mkdir(new URL('.',output),{recursive:true});
await writeFile(output, html);
console.log(`Built Sorami ${values.offline?'offline':'web'} page (${(Buffer.byteLength(html)/1024).toFixed(0)} KB).`);
