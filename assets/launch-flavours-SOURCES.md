# Launch flavour photos

Two user-supplied package photos sit side by side in the right-hand heading column, above the Grocery stores step. The images remain outside the heading's text masks and use independent reveals. On narrow screens the pair stays beside the heading while the timeline becomes vertical.

- Spicy Garlic: unchanged copy of `/Users/ace/Downloads/Sorami-Spicy-Garlic/01-front.png`, stored as `assets/sorami-spicy-garlic-front.png`.
- Umami Chicken: reuses `assets/sorami-package-reference.png`, originally supplied as `/Users/ace/Downloads/01-front.png`.

The original photographs are preserved. The Launch scene now embeds `assets/sorami-spicy-garlic-cutout.png` and `assets/sorami-umami-chicken-cutout.png`, edited with the built-in image-generation tool in background-extraction mode. Both outputs are 1536 × 1024 RGBA PNGs with genuine transparent alpha outside the cups. CSS uses centered portrait viewports to trim surplus transparent padding and show each entire lid, body and base, with no rectangular frame.

Final shared prompt:

> Use case: background-extraction. Asset type: transparent product cutout for a pitch website. Input image: edit target. Remove only everything OUTSIDE the complete noodle cup: wall, tabletop, bowls, scattered grains and cast shadow. Output genuine transparent alpha. Preserve the entire cup including full foil lid, pull tab, body and base; keep exact original logos, lettering, typography, food print, colours, lighting, perspective and proportions. No redesign, no new packaging text, no opaque backdrop, no ground plane, no added shadow. Single centered cup with only 3–5% transparent padding around its complete silhouette.

Each call adds the flavour identification: “This edit target is the red Sorami Spicy Garlic cup.” or “This edit target is the cream Sorami Umami Chicken cup.” The edit references the respective original photo above. Alpha was checked directly, and the cup artwork was visually inspected. Generated edits may have small pixel differences from the source; no new product claims were requested. These are package concept images, not evidence of a validated product or confirmed retail launch.
