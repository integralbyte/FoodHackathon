# Sorami — From Grain to Campus

A self-contained opening film, scroll-driven product animation, and interactive eleven-chapter pitch based on the supplied **SORAMI Pitch: Access & Innovation** deck. The Sorami logo and packaging anchor a textured visual system: burgundy, dark cocoa, toasted wheat, and olive chapters, with gold accents, fine paper grain, botanical engravings, and serif display type.

## Open it

Open `index.html` directly in a browser; the complete experience works offline. Or run `npm run dev` with Node.js 18+ and open the printed localhost URL. There are no runtime dependencies or external assets. Research links need an internet connection.

## The flow

The page opens with the supplied 8.5-second Sorami concept film as a full-screen background. Warm color treatment, a translucent logo badge, and a cream gradient connect the footage to the rest of the site. The film loops silently, pauses outside the viewport or when the page is hidden, and includes a play/pause control. Reduced-motion preferences show the poster until the visitor explicitly chooses to play. The **From grain to cup** link enters the assembly; **Explore the pitch** jumps straight to the deck.

The next stage keeps the cup centered and matches the supplied Umami Chicken packaging reference: sorghum and millet grains spiral into a thick, three-sided noodle cake, the cup assembles, vegetables fall, water fills the interior, steam rises, and the lid closes. Scroll to build or reverse it, use the dots to jump, or choose **Play** for a 26-second guided sequence. **The story** appears beside the controls at the final stage.

The deck follows in its original order, rebuilt as objects and interactions rather than slide screenshots:

1. **The idea:** a cup assembles from alternating vertical strips while grains settle into an orbit.
2. **The student:** a laptop unfolds, the desk assembles, and a time slider explores the late-night deadline.
3. **The product:** 100 grains pack into an 85% formulation diagram, then rearrange for the steam and hot-water concepts.
4. **The structure:** noodle cross-sections grow, channels draw through the porous strand, and a scrubber or replay traces water paths.
5. **The flavor:** a branching diagram connects and research selections flip the numeric readout with context and source links.
6. **The opening:** three products unfold onto a shelf; selecting one explains its market position.
7. **The business:** coins stack into the cup economics; price, cost, and pantry allocation update the remaining amount, including negative scenarios.
8. **The access:** a 100-person grid highlights the 23% statistic; clicking the pantry control demonstrates the proposed 20+1 model.
9. **The habit:** a sales slider fills a grain silo and recalculates tonnes of grain demand; distribution buttons explore campus channels.
10. **The growers:** stems draw, leaves unfurl, seed heads assemble, and partnership choices explain the ambition.
11. **The easy choice:** a grain sun assembles around the cup; replay returns to the opening grains.

The chapter palette follows the story: burgundy for the product reveal and close, cocoa for the late-night student and business scenes, toasted wheat for the product and market, and olive for access and growers. Controls, source panels, diagrams, and labels share the current palette. The background texture is a local SVG noise tile, so the theme adds no network dependency.

The pitch supports scrolling, chapter navigation, a progress scrubber, left/right arrows, and guided playback. Wheel, touch, or interacting with a control pauses playback. Space toggles playback when no interactive control has focus. The chapter menu jumps directly to any part. The **Sources & assumptions** dialog explains the numbers and their limits.

Reduced motion presents each chapter in its completed state. Play is an explicit opt-in to animation. Inactive chapters are hidden and inert, inputs are labeled, and only the on-screen scene runs. Short screens can scroll a chapter internally.

## Edit and rebuild

- `src/story.html`, `src/style.css`, `src/story.js`: original cup assembly.
- `src/film.html`, `src/film.css`, `src/film.js`: full-screen opening, theme treatment, and motion-aware playback.
- `assets/sorami-opening.mp4`, `assets/sorami-opening-poster.jpg`: optimized silent H.264 copy of the supplied film and its first-scene poster. The opening uses the replacement clip supplied as `copy_C90F67D0-9C83-4B85-9295-8A3D744B1F67.MOV`, optimized to 1080p H.264 at 30 fps. A soft, feathered blur obscures the bottom-right watermark from 6.000 seconds through the end; all earlier frames bypass the blur. The logo stays outside the filtered region. The source video remains unchanged. Both assets are embedded by the build so direct-file viewing still works offline.
- `src/pitch.html`, `src/pitch.css`, `src/pitch.js`: deck scenes, visuals, interactions, sources, and choreography.
- `src/pitch-theme.css`: chapter palettes, paper grain, typography, material treatments, and responsive controls. Chapter `data-tone` attributes select the palette.
- `assets/sorami-package-reference.png`: the unchanged supplied `01-front.png` reference. SVG silhouettes separate its body and foil lid for animation, preserving the original print, cream color, burgundy-and-gold trim, and tall proportions. The same cup artwork is reused throughout the pitch.
- `src/page.html`: page metadata and wrapper.
- `scripts/build.mjs`: embeds the logo and all source files into `index.html`.

Run `npm run build` after editing. Commit the regenerated `index.html` alongside its sources; any static host can serve it at the site root.

## Evidence and assumptions

The animation illustrates a proposed product. It does not predict cooking time or prove manufacturability, nutrition, taste, or commercial performance. The reference packaging includes Umami Chicken, 78g net weight, 11g protein, 400mg sodium, and gluten-free wording as supplied visual concept art; these label claims are not validated by the animation. The pitch calculations still use their original 47g grain assumption, independently of that mockup. The five-minute ritual, 85% formulation, and non-fried process remain development targets.

Published sources are linked in the page:

- [GAO-24-107074](https://www.gao.gov/products/gao-24-107074): 23% of U.S. college students experienced food insecurity in 2020.
- [2019 model chicken broth sensory study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6542971/): about 30% bitterness reduction with sodium chloride under the study conditions.
- [2024 yeast-extract receptor study](https://www.sciencedirect.com/science/article/pii/S0963996924006665): at least 40% inhibition of seven receptors with an AMP-rich extract, measured in a cell-based assay.
- [Related sorghum sensory study](https://researchhub.buan.ac.bw/handle/13049/502): cultivar-dependent sensory properties. The deck's exact 57% comparison has not been traced and is explicitly marked unverified.

The deck's 13.5 million tonnes / 38 African countries / 2024 millet statistic still needs a dataset citation. The $6.50 comparison is a deck benchmark, not a live market survey. These limitations are visible beside the claims, as well as in the evidence dialog.

Default economics are $3.99 price − $1.20 store share − $1.60 production cost = $1.19 remaining. The proposed 20+1 pantry allocation subtracts another $0.08, leaving $1.11, before overhead, distribution, taxes, waste, and program costs. These are scenario inputs, not quotes or profit forecasts. The grain-demand calculation uses the deck's rounded 47g/cup: 100,000 cups × 47g = 4.7 tonnes. Pantry distribution and farmer partnerships are proposals, not active commitments.

## Validation

Run `npm run test:scroll` for the regression checks covering first entry from the video, restored scroll positions, and reverse scrolling. The observer test reproduces the zero-area boundary notification that previously left the first downward pass frozen.

The build and JavaScript syntax checks pass. The optimized video decodes successfully; media-state checks cover muted playback, manual pause persistence, offscreen/page-hidden pause, reduced-motion opt-in, the progress indicator, and the handoff to the cup animation. Synthetic DOM checks exercise all eleven chapters, SVG and label references, progress navigation, playback, controls, source selection, modal behavior, negative margins, and grain-demand calculations. SVG artwork was separately rendered for geometry inspection. Those checks do not replace browser layout and touch testing; local browser access was disabled in Work settings during implementation.
