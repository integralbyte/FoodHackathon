# Sorami — From Grain to Cup

A standalone scroll-driven animation of a proposed sorghum–millet noodle cup. Two clouds of shaded grains spiral into individually drawn noodle strands. The thick noodle cake uses one shared projection for its textured top, front, and left faces, with irregular strand spacing and distinct face shading. A textured paper cup, botanical sleeve, base, and embossed foil lid assemble in separate layers. Vegetables tumble in, a kettle spout pours into a visibly rising broth surface that submerges the flat-bottomed noodle brick, toppings float with the liquid, splashes and ripples follow the water level, steam drifts upward, and the lid closes with a sealing pulse and moving highlights. The animation is centered in a full-screen stage. Only the opening Sorghum and Millet labels, package artwork, and compact playback controls are visible. The camera draws closer to the completed cup; there are no side paragraphs, header, callouts, or additional sections.

## Open it

Open `index.html` in a browser. It is self-contained and works offline, with no external assets or dependencies.

For a local server, using Node.js 18 or newer:

```sh
npm run dev
```

Open the printed localhost URL. No dependency installation is needed.

## Controls

- Scroll down to assemble the cup and up to reverse it.
- Click **Play** for a 26-second guided sequence; click again to pause the scroll. Steam, water, and subtle floating motion continue while a scene is on screen.
- Move the pointer for a small depth/parallax effect. Background animation pauses when the page is hidden.
- Use the chapter dots or left/right arrow keys to jump between stages.
- Click the **Replay** icon to return to the grains.
- Wheel, touch, and Escape stop guided playback.

The page respects reduced motion by showing the finished cup initially. **Play** opts into motion for this page.

## Edit and rebuild

Edit `src/story.html` for the artwork, `src/style.css` for styling, and `src/story.js` for choreography and copy. `src/page.html` is the document wrapper.

```sh
npm run build
```

This regenerates the committed `index.html`. Any static host can serve that file as the site root.

## Branding

The supplied Sorami logo lives in `assets/sorami-logo-original.png`. The build embeds it once and reuses it on the cup sleeve and lid. SVG framing removes the empty margins; multiply blending integrates its white backdrop with the warm ivory surfaces while preserving the original pixels. Orange `#ff6c14`, yellow `#fbc644`, and charcoal `#383837` define the theme.

## Scope

The original SVG artwork illustrates a product concept. Its timing and geometry are not a manufacturing or cooking simulation. The formulation and five-minute preparation target remain untested.
