# Transparent Sorami logo

Source: `assets/sorami-logo-original.png`, supplied by the user. The original file is preserved. Its white background was embedded in the raster, so blending the SVG wrapper still left a rectangle against dark video scenes.

Output: `assets/sorami-logo-transparent.png`, generated with the built-in image tool in background-extraction edit mode. It is a 1254 × 1254 RGBA PNG with transparent pixels outside the artwork. The header and opening overlay embed the same asset through SVG cropping; the header's former cream oval and tagline are removed. The rendered logo was checked over the cream theme, and alpha transparency was checked directly. Generated extraction may introduce small pixel differences from the original.

Final prompt:

> Use case: background-extraction. Edit target: the supplied Sorami logo image. Remove all white background, including white counters and gaps around and within the orange/yellow lettering, noodle curves and grain shapes. Output a genuine transparent-alpha PNG. Preserve the exact original orange Sorami lettering, yellow noodle curves and grains, dark grey i, proportions, irregular handmade outlines and arrangement. Do not redraw, restyle, recolour, add shapes, shadows, an oval badge or any background. Keep the full original 1600x1600 canvas placement so existing SVG viewBox crops remain aligned. Only the white background becomes transparent.
