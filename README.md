# rAAmen — From Grain to Cup

A standalone scroll-driven animation of a proposed sorghum–millet noodle cup. Grains gather into a noodle block, the cup rises around it, toppings settle, water pours, and the lid closes. This page contains only the product story; there are no simulation or research sections below it.

## Open it

Open `index.html` in a browser. It is self-contained and works offline, with no external assets or dependencies.

For a local server, using Node.js 18 or newer:

```sh
npm run dev
```

Open the printed localhost URL. No dependency installation is needed.

## Controls

- Scroll down to assemble the cup and up to reverse it.
- Click **Play story** for the guided sequence; click again to pause.
- Use the chapter dots or left/right arrow keys to jump between stages.
- Click **Replay story** or **Watch it again** to return to the grains.
- Wheel, touch, and Escape stop guided playback.

The page respects reduced motion by showing the finished cup initially. **Play story** opts into motion for this page.

## Edit and rebuild

Edit `src/story.html` for the artwork, `src/style.css` for styling, and `src/story.js` for choreography and copy. `src/page.html` is the document wrapper.

```sh
npm run build
```

This regenerates the committed `index.html`. Any static host can serve that file as the site root.

## Scope

The original SVG artwork illustrates a product concept. Its timing and geometry are not a manufacturing or cooking simulation. The formulation and five-minute preparation target remain untested.
