# Sector A corner entries and Sofia context

Research and validation: 7 September 2026. This follows the [goals and hospitality revision](goals-sector-a-research.md).

## Reference interpretation

The user supplied a clearer, nearly frontal photograph of Sector A. It shows a large open passage at either end of the lower stand, below connecting galleries beside the hospitality block. The screenshot was supplied on 7 September; the underlying photograph's capture date is unknown. The [official August photograph](https://stadium.cska.bg/wp-content/uploads/2026/08/DJI_20260809161028_0097_D-2048x1152.jpg) and [club hospitality description](https://stadium.cska.bg/в-сърцето-на-българска-армия-секто-2/) provide complementary context.

The previous generic corner bowl and continuous exterior glazing blocked these routes. Both openings now cut through concrete, chair placement and the lower facade. Upper gallery surfaces, supports and guardrails remain. The implemented slots are 7 m wide, at local Z ±47–54 m, with exterior clearance to 7.2 m. Those dimensions, gallery elevations and the return-stair route are proportional interpretations. The photograph does not establish their measured sizes, intended access rules or hidden circulation.

## Geographic grounding

The expanded context uses an offline [OpenStreetMap](https://www.openstreetmap.org/copyright) extract timestamped `2026-09-07T06:07:06Z`. The [query](../scripts/sofia-city.overpassql), [extractor](../scripts/prepare-sofia-city.py) and [redistributable dataset](../public/assets/geodata/sofia-city.json) make the selection and provenance inspectable. See the [data notes](../public/assets/geodata/README.md) for regeneration and terrain sources.

- Desktop: 18,000 building footprints and 2,759 major-road ways within 4.3 km of the stadium, with a 520 m inner exclusion for the modelled park. This is a bounded context selection, not every building in Sofia.
- Compact profile: 10,000 buildings, retaining the same road dataset. Spatial and material batches support frustum culling.
- 141 courtyard holes are retained. Roofs are simplified; facade detail and landmark-specific roof forms are not reconstructed.
- Heights: 36 explicit height tags, 6,516 estimates from building levels, and 11,448 estimates from building type. The extractor records that distinction; tagged heights are not independently surveyed. Relevant OSM conventions are [height](https://wiki.openstreetmap.org/wiki/Key:height) and [building levels](https://wiki.openstreetmap.org/wiki/Key:building:levels).
- Terrain was extended northward using the original elevation source. Buildings and road sections share the renderer's triangle-based elevation sampling. Road widths and junction surfaces remain approximate.

The city data adds about 636 KB gzip before bundling. The complete lazy scene chunk is about 923 KB gzip in this revision; Vite reports a large-chunk warning. Offline reproducibility and bounded geometry are the chosen tradeoff. No physical-device frame-rate benchmark is claimed. The city has no runtime API requests or AI-provider dependency.

## Parallel implementation and independent review

Three agents handled corner geometry, geographic context, and independent review/AI case-study guidance, with the primary agent integrating the scene and presentation. The independent reviewer found that bilinear terrain lookup disagreed with the mesh's triangles and could bury road surfaces by several metres. Switching to the actual triangle interpolation and extending the terrain resolved the finding. A subsequent inspection of 54,000 road triangle centroids found none below the terrain.

This is an example of the project's [AI-assisted engineering process](ai-engineering-case-study.md): references establish constraints, agents implement bounded tasks, and independent checks can reject their output.

## Validation record

Validated locally on macOS before publication:

- `bun run check`: 40 tests passed with 169,511 assertions; formatting, TypeScript and the production build passed.
- `python3 -m unittest discover -s scripts`: six extractor tests passed. These also run in GitHub CI.
- `actionlint` and `git diff --check`: passed.
- Regression tests inspect the actual merged stadium geometry, clear corner routes, excluded seats and concrete, gallery support, mapped geometry budgets, finite vertices and deterministic coordinate transforms.
- Browser review at 1440 × 900 inspected the main-stand front, each corner route from inside/outside, and the wider city. The compact city retained both entrances and the skyline. Mobile emulation at 390 × 844 checked Bulgarian presentation, About links, cutaway and evening mode; English About was checked on desktop.
- The application exporter produced a 40,702,796-byte GLB. Three.js GLTFLoader re-imported it with both named corner passage groups and the complete roof. Eighteen sample rays across the two re-imported passages were unobstructed; accessor bounds were finite. The re-imported passage was rendered for visual inspection. Export remains stadium-only.

Browser inspection and export re-import are recorded manual review steps, not automated CI gates. Mobile emulation does not establish physical-device performance. Three.js retains its existing Clock deprecation and exporter line-material warnings. This remains an architectural visualization with explicit approximations, not a survey or construction model.
