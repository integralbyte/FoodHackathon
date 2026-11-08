# Opening market and demand panels

The background is the unchanged user-supplied `ChatGPT Image Nov 7, 2026, 05_27_39 PM.png`, copied to `assets/sorami-opening-shelf.png` (1672 × 941). It is illustrative product-shelf artwork. Dark overlays and translucent panels are applied in CSS, using the supplied statistics-layout reference for the visual direction.

## Figures

- **72% would like to eat more whole grains:** [Oldways Whole Grains Council, 2025 Whole Grain Consumer Insights Survey](https://wholegrainscouncil.org/sites/default/files/atoms/files/WGC-Survey-2025_0825.pdf), executive summary and Q8a. The online survey covered 1,500 U.S. adults, May 29–June 6, 2025.
- **61% want less sodium; 52% want more protein; 4% nutrition-focused U.S. cups:** figures supplied in the user’s pitch brief and used as requested. The source dialog attributes them to the brief.
- **$3.9B U.S. instant-noodle market; +40% estimated growth by 2030:** figures supplied in the pitch brief and used as requested. The increase is a total growth estimate, not an annual rate.

## Sodium sample

The displayed **1,044mg per cup** is the unweighted mean of eight conventional U.S. cups already in `src/shelf-products.json`, including each product’s seasoning. The exact mean is 8,350 ÷ 8 = 1,043.75mg, rounded to the nearest milligram. It is a selected product benchmark, not a sales-weighted or nationally representative market average. The visible card states “8 selected U.S. products,” and the source dialog lists each label.

| Cup | Sodium per whole cup | Source |
| --- | ---: | --- |
| Nissin Cup Noodles Chicken | 1,160mg | [Manufacturer label](https://www.nissinfoods.com/product/cup-noodles/cup-noodles-chicken/) |
| Nissin Cup Noodles Shrimp | 1,050mg | [Manufacturer label](https://www.nissinfoods.com/product/cup-noodles/cup-noodles-shrimp/) |
| Nissin Spicy Jalapeño Chicken | 1,200mg | [Manufacturer label](https://www.nissinfoods.com/product/cup-noodles/cup-noodles-spicy-jalapeno-chicken/) |
| Nongshim Shin Original Cup | 1,200mg | [Manufacturer label](https://nongshimusa.com/product-detail?pid=45) |
| Nongshim Shin Black Cup | 1,480mg | [Manufacturer label](https://nongshimusa.com/product-detail?pid=46) |
| Buldak Carbonara Cup | 880mg | [Manufacturer label](https://samyangamerica.com/buldak/carbonara-cup) |
| Buldak Original Cup | 630mg | [Manufacturer label](https://samyangamerica.com/buldak/original-cup) |
| Buldak Cheese Cup | 750mg | [Manufacturer label](https://samyangamerica.com/buldak/cheese-cup) |

## Animation and layout

All seven numerical values count upward once when the opening first enters view; the units and percent signs remain orange. The market trend draws in parallel. The counter script is placed directly after the opening markup so it can start before the remainder of the embedded film and artwork has parsed. Reduced-motion mode uses final values immediately. Leaving the viewport or hiding the tab suspends animation frames. The sources dialog preserves focus on close, and the continuation link measures the current journey position rather than assuming it starts at scroll zero.

The opening precedes the existing shelf; the shelf, cup handoff, reverse assembly, research tour and remaining chapters keep their relative scroll timings. The deck replay still returns to the shelf.
