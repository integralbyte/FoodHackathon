# Sorami — From Grain to Campus

A self-contained interactive noodle aisle, continuous cup-to-grain animation, concept film, and interactive eleven-chapter pitch based on the supplied **SORAMI Pitch: Access & Innovation** deck. The Sorami logo and packaging anchor a textured visual system: burgundy, dark cocoa, toasted wheat, and olive chapters, with gold accents, fine paper grain, botanical engravings, and serif display type.

## Open it

Open `index.html` directly in a browser; the complete experience works offline. Or run `npm run dev` with Node.js 18+ and open the printed localhost URL. There are no runtime dependencies or external assets. Research links need an internet connection.

## The flow

The page opens with **21 cups and bowls on stocked shelves**: twenty selected U.S. and UK products from Nissin, Nongshim, Buldak, NOMI, immi and Miyoka, with Sorami in the middle. The opening is entirely scroll-driven: the shopper's headline, four centered title-only preference cards, the products, and the final Sorami reveal. There is no header slogan, comparison button or dialog, footer, numeric counter, playback bar, stage navigation, or bottom explanatory text. The shelves use the reclaimed space. Nutrition badges above the cups and numerical cross-out labels are removed; all crosses use red ink. Left/right arrow keys also advance stages; reduced-motion scrolling switches directly between completed stages.

The sequence is **protein ≥10g → sodium <900mg → fibre ≥6g → not deep-fried**, applied to each complete cup with seasoning. The four displayed cards contain only their plain-language titles. The illustrated progression remains **21 → 11 → 8 → 5 → 1**:

- Ten standard cups leave at protein, including Buldak Carbonara Cup.
- Shin Black Cup, Miyoka Chicken and Nissin Protein Rich & Savory Chicken leave at sodium.
- NOMI Umami Beef, Golden Chicken and Tokyo Curry leave at fibre (5g, 5g and 4g).
- Nissin Soba Protein Classic and Chilli (18g protein / 15g fibre), and immi Creamy Chicken and Roasted Pork Tonkotsu cups (18g protein / 10g fibre), survive the nutrition preferences. The presentation shows red cross-outs with no overlay labels or tooltips. Process provenance is retained in the source data and source notes.

The actual `nonfried` values for Soba and immi remain `null`; a separate `demoAssumedDeepFried` field controls the illustrative ending. Known non-fried products cannot be excluded by this assumption. The underlying evidence rules retain five cups when assumptions are disabled. No confirmed-data switch is exposed in the simplified presentation. Source URLs, numerical thresholds, verified versus assumed values, and the check date remain in `src/shelf-products.json`, `src/shelf-config.json`, and `assets/competitors/SOURCES.md`.

Sorami's 400mg sodium, 11g protein, 6.5g fibre and non-fried process are **unvalidated team targets**. “Healthiest noodles” is the shopper's quoted wish; the demo does not establish overall health superiority. The 900mg cutoff is an illustrative preference, not a low-sodium nutrient claim. UK Soba values use the complete prepared serving (210g Classic / 220g Chilli), with 2.2g / 1.9g salt converted to 880mg / 760mg sodium. Its labeled preparation drains water before adding sauce; no sodium is guessed or subtracted. NOMI Golden Chicken and Tokyo Curry are December 2026 pre-orders, recorded in the source data. NOMI cups use schematic SVG artwork with no overlay badges. Miyoka retains the manufacturer’s body photo and adds a fitted SVG lid over its open rim; the other cup pictures use unchanged manufacturer artwork.

The shelf and cup scene now share **one pinned viewport**. At the shelf's final zoom, a shared copy of the exact finished-cup artwork moves from the selected cup's measured rectangle into the assembly SVG's finished-cup rectangle. The burgundy aisle clears into the warm grain scene during the same scroll interval; there is no video or section slide between them. The geometry is measured again during the handoff so resizing and phone layouts use their current cup positions.

Continue scrolling down and the assembly runs **backward**: the sealed cup opens, toppings lift away, the sleeve and cup separate, and the thick noodle cake unwinds into sorghum and millet. The pouring/filling stage, kettle, splashes, broth animation and steam have been removed entirely. The two grain labels remain at the end, followed by an extended ingredient-benefit scene: fibre, magnesium and phosphorus, naturally gluten-free grains, and drought tolerance. Rules draw, icons trace, and the typography reveals in staggered horizontal clips alongside the grains. Desktop framing widens to make room; phone framing lifts the grains above two columns. Sorghum fibre and mineral amounts link to USDA. The foxtail-millet callouts use qualitative whole-grain fibre and mineral wording, linking to IJMR and Japan MEXT references without transferring the old proso figures to the new flour. Other grain traits link to FAO and UC Davis. Both mineral headings read “Rich in minerals.” Per-100g captions are omitted from the visible presentation; raw-grain context remains in source data and accessible labels. No protein statistic is shown in these callouts. Scroll upward to retract the benefits, rebuild the cup and return to the aisle. The joined scene has no extra control bar; left/right arrows move through stages, and reduced-motion mode changes between completed states. The deck's replay returns to the beginning of the shelf.

The supplied 8.5-second concept film now comes **after the reverse animation**, followed by the pitch deck. It retains the warm treatment, muted loop, poster and play/pause control. It pauses offscreen or when the page is hidden and respects reduced-motion opt-in. Its forward link now continues into the pitch.

The deck keeps eleven chapters, with an expanded Research opening in place of the original cover. Each chapter uses objects and interactions rather than slide screenshots:

1. **Research:** the outlined process flowchart leads into a reversible camera tour of the supplied Spicy Garlic product-kit image. The camera starts on a sharp, straight vector recreation of its Nutrition Facts label, without red packaging edges, with the seven printed noodle ingredients beside it, pulls back to show the entire kit, zooms into the seasoning beside the simultaneous ~30% / ≥40% bitterness results, returns to the kit, then zooms into the bottom-right noodle nest. A horizontal wipe hands the photograph into the existing thickness and pore diagrams before the next chapter. The clean label follows the camera and blends into the printed label during zoom-out. The two overview moments use the full pinned viewport rather than the smaller text workbench, making the desktop image about 47% larger. One unchanged embedded photo and continuous transforms connect the views; the photo is not replaced by separate crops. Five navigation stops skip directly to the substantive scenes, while both overview moments remain in the scroll flow. The recipe uses the printed ingredients without inventing percentages. The label's 5.8g fibre / 340mg sodium remain package-illustration figures, separate from the earlier 6.5g / 400mg targets in Details. The process boxes retain desktop stage headings and edge-anchored thin connectors. Green B, blue C and brown P badges identify the highlighted hazard categories, with a compact four-item key below. Steam, finish drying and assembly use burgundy fills, numbered proposed-control tags and short monitoring notes. Supplier checks and cooling notes stay concise, with fuller explanations in Details. Full manufacturing settings, sources, nutrition targets and controls remain in **Details**, including the 5-minute preparation target and 55g + 10g + 13g = 78g mass balance. [Research notes](assets/research-SOURCES.md) document the image and study context.

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

The pitch supports scrolling, chapter navigation, a progress scrubber, left/right arrows, and guided playback. Research receives 5.6 times a normal chapter’s scroll distance and playback duration so the process, label/recipe, two full-kit views and three innovations have room to develop; later chapters retain their previous physical scroll length. Wheel, touch, or interacting with a control pauses playback. Space toggles playback when no interactive control has focus. The chapter menu jumps directly to any part. The **Sources & assumptions** dialog explains the numbers and their limits.

Reduced motion presents each chapter in its completed state. Play is an explicit opt-in to animation. Inactive chapters are hidden and inert, inputs are labeled, and only the on-screen scene runs. Short screens can scroll a chapter internally.

## Edit and rebuild

- `src/hook.html`, `src/hook.css`, `src/hook.js`: responsive shelf, title-only filter cards, and scroll choreography.
- `src/shelf-config.json` sets the numerical preferences; `scripts/shelf-rules.mjs` determines the first failed filter.
- `src/shelf-products.json`: one source of truth for all 21 products, label values, image framing, and source URLs. `scripts/build-shelf.mjs` generates the shelf cards and runtime data from it.
- `assets/competitors/`: unchanged manufacturer artwork, with SVG viewBoxes and silhouette clips applied in the page; original image URLs are recorded in `SOURCES.md`. NOMI schematic cups and the fitted Miyoka lid are authored as SVG in the shelf builder, without overlay badges.
- `src/journey.html`, `src/journey.css`, `src/journey.js`: one pinned viewport, shared scroll timeline, measured cup handoff, reverse progression, and the transition between the aisle and grain scene.
- `src/grain-benefits.json`, `src/grain-benefits.css`, `src/grain-benefits.js`: sourced ingredient benefits and the concluding scroll choreography. `scripts/build-grain-benefits.mjs` builds the two columns; [grain benefit source notes](assets/grain-benefits-SOURCES.md) record the exact nutrient basis.
- `src/story.html`, `src/style.css`, `src/story.js`: procedural cup assembly, driven in reverse by the joined journey; standalone forward playback remains supported.
- `src/film.html`, `src/film.css`, `src/film.js`: full-screen opening, theme treatment, and motion-aware playback.
- `assets/sorami-opening.mp4`, `assets/sorami-opening-poster.jpg`: optimized silent H.264 copy of the supplied film and its first-scene poster. The opening uses the replacement clip supplied as `copy_C90F67D0-9C83-4B85-9295-8A3D744B1F67.MOV`, optimized to 1080p H.264 at 30 fps. A soft, feathered blur obscures the bottom-right watermark from 6.000 seconds through the end; all earlier frames bypass the blur. The logo stays outside the filtered region. The source video remains unchanged. Both assets are embedded by the build so direct-file viewing still works offline.
- `src/pitch.html`, `src/pitch.css`, `src/pitch.js`: deck scenes, weighted chapter timeline, visuals, interactions, sources, and choreography.
- `src/research.html`, `src/research.css`, `src/research.js`, `src/research-camera.mjs`, `src/research.json`: the process flowchart, product-kit camera tour and three innovations; `scripts/build-research.mjs` generates all settings, ingredients, mass balance and quality tables from the supplied process data. Exact ingredient percentages are left unspecified. Nutrition uses the existing whole-cup team targets rather than proso-grain values assigned to foxtail.
- `src/pitch-theme.css`: chapter palettes, paper grain, typography, material treatments, and responsive controls. Chapter `data-tone` attributes select the palette.
- `assets/sorami-package-reference.png`: the unchanged supplied `01-front.png` reference. SVG silhouettes separate its body and foil lid for animation, preserving the original print, cream color, burgundy-and-gold trim, and tall proportions. The supplied artwork is reused throughout the pitch; the research process flowchart uses short labelled boxes rather than adding another cup mockup.
- `src/page.html`: page metadata and wrapper.
- `scripts/build.mjs`: embeds the logo and all source files into `index.html`.

Run `npm run build` after editing. Commit the regenerated `index.html` alongside its sources; any static host can serve it at the site root.

## Evidence and assumptions

The animation illustrates a proposed product. It does not predict cooking time or prove manufacturability, nutrition, taste, or commercial performance. The reference packaging includes Umami Chicken, 78g net weight, 11g protein, 400mg sodium, and gluten-free wording as supplied visual concept art; the team additionally supplies a 6.5g fibre target; these label claims are not validated by the animation. The pitch calculations still use their original 47g grain assumption, independently of that mockup. The five-minute rehydration target, 85% combined-grain ambition and revised non-fried process remain proposed attributes. The process includes a 24-hour hold intended to encourage RS3 formation; neither its amount nor its retention is established. All manufacturing temperatures, times, moisture/aw limits and quality criteria are trial targets supplied by the team.

Published sources are linked in the page:

- [GAO-24-107074](https://www.gao.gov/products/gao-24-107074): 23% of U.S. college students experienced food insecurity in 2020.
- [2019 model chicken broth sensory study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6542971/): about 30% bitterness reduction with sodium chloride under the study conditions.
- [2024 yeast-extract receptor study](https://www.sciencedirect.com/science/article/pii/S0963996924006665): at least 40% inhibition of seven receptors with an AMP-rich extract, measured in a cell-based assay.
- [Related sorghum sensory study](https://researchhub.buan.ac.bw/handle/13049/502): cultivar-dependent sensory properties. The deck's exact 57% comparison has not been traced and is explicitly marked unverified.

The deck's 13.5 million tonnes / 38 African countries / 2024 millet statistic still needs a dataset citation. The $6.50 comparison is a deck benchmark, not a live market survey. These limitations are visible beside the claims, as well as in the evidence dialog.

Default economics are $3.99 price − $1.20 store share − $1.60 production cost = $1.19 remaining. The proposed 20+1 pantry allocation subtracts another $0.08, leaving $1.11, before overhead, distribution, taxes, waste, and program costs. These are scenario inputs, not quotes or profit forecasts. The grain-demand calculation uses the deck's rounded 47g/cup: 100,000 cups × 47g = 4.7 tonnes. Pantry distribution and farmer partnerships are proposals, not active commitments.

## Validation

Run `npm run test:research` for photo-region geometry, continuous camera boundaries, full-kit framing, the noodle-to-diagram handoff and reduced-motion camera stops. Run `npm run test:journey` for the shared cup handoff, phase order, restored progress and reduced-motion checks. Run `npm run test:scroll` for the standalone assembly regression checks covering first entry, restored scroll positions, and reverse scrolling. The observer test reproduces the zero-area boundary notification that previously left the first downward pass frozen.

The build and JavaScript syntax checks pass. Camera tests cover desktop, phone, narrow and intermediate-width layouts. Synthetic DOM checks at 1440×900 and 390×844 cover all eleven chapters, the seven research camera stages, unchanged embedded product-kit artwork, recipe ingredients, contextual Details, forward/reverse scrolling, direct restored entry, reduced motion and the existing interactive controls. The shared cup journey and standalone assembly regression checks also pass. Native SVG crops and the clean vector label were rendered and inspected for the label, complete kit, seasoning, noodle nest and intermediate camera travel. Browser preview remains disabled in Work settings, so there is no fresh browser layout screenshot.
