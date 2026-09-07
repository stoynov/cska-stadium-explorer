# Goals and Sector A reconstruction

Research and revision: 7 September 2026.

## Evidence and scope

The user supplied two screenshots of disconnected goal nets and a photograph of the main stand. These were compared with the actual procedural geometry, the club's published hospitality description, and August construction photographs.

- [IFAB Law 1, goals](https://www.theifab.com/laws/latest/the-field-of-play/): the clear opening is 7.32 m wide and 2.44 m high; posts and crossbar must be no wider/deeper than 12 cm. Nets attach to the goal and ground behind it without obstructing the goalkeeper.
- [CSKA's Sector A hospitality description, 29 January 2026](https://stadium.cska.bg/в-сърцето-на-българска-армия-секто-2/): Bronze seating occupies the flanks, while Silver has central seating and a lounge. Gold has 20 skyboxes with private outdoor seating terraces; Platinum has eight, with camera positions also described at that level.
- [Official August Sector A photograph](https://stadium.cska.bg/wp-content/uploads/2026/08/DJI_20260809161028_0097_D-2048x1152.jpg): lower red seating, recessed glazing, terrace fronts, pale horizontal floor edges, and a hospitality block below the canopy. Related local images and their provenance are recorded in `public/assets/cska/manifest.json`.

The main hospitality stand is associated with the entrance side. This is **+X / bowl side 0** in the model; the opposite −X stand carries the ЦСКА lettering. Local coordinates do not establish true north.

## Root causes

The old goal model had only a rear lattice, without side or top netting. Its vertical strands sloped in depth while horizontal strands used a constant depth, so they did not form one consistent rear surface. Frame placement also used separate constants from the pitch markings and grass elevation.

The seating generator applied the same 31-row profile and full-height stair flights to all eight bowl segments. It had no representation of the lower main-stand tier, premium terraces, or stacked skyboxes. Adding a glass facade over those rows would have concealed the problem while retaining intersecting geometry.

## Modelling limits

The correction reconstructs exterior architectural features that can be supported by the evidence. Floor elevations, lower-row count, facade bay widths, terrace depths, interior furniture, and the junctions with adjacent stands are approximate. This is not a surveyed model or a seating-capacity, accessibility, structural, or evacuation assessment. Private room layouts and back-of-house circulation are simplified.

The goal mouth follows IFAB dimensions; net depth, mesh spacing, supports, and turf treatment remain visualization choices. The overall 105 × 68 m pitch remains the project's stated size assumption.

## Implementation and validation

`goals.ts` builds each goal from shared panel corners, so rear, side and top strands meet. `pitch.ts` aligns the frame and boundary markings and adds an unmarked turf apron that supports the rear net. `hospitality-layout.ts` owns the approximate levels, room divisions and terrace-seat positions; `hospitality.ts` builds the surfaces. The seating generator omits Sector A's upper ordinary rows, stairs and public concourse before adding hospitality geometry.

Three parallel agents handled goals, Sector A, and independent reference/code review. Review found and resolved a ground-height mismatch behind the goals, small corner junction gaps, and railings crossing the five lower stair exits.

Validation performed on the final geometry:

- `bun run check`: **31 tests passed**, 75,584 assertions; formatting, TypeScript and Vite production build passed.
- New regression checks cover connected goal-net graphs, mirrored open goal mouths, clear frame dimensions, and ray intersections with actual supporting ground. Failures were observed against the old geometry before correction.
- Sector A checks inspect actual ordinary seat instances and concrete exclusion, supported premium chairs before and after mesh merging, skybox counts, headroom, rear terrace clearance, canopy clearance, corner junctions, and stair-exit openings.
- Browser close-ups inspected both goals and Sector A with the roof visible and hidden. The opposite lettering stand remains intact. Desktop 1440 × 900 and mobile-emulated 390 × 844 app views were checked, including cutaway and evening controls; no application errors were logged.
- The application export function produced a **40,910,676-byte GLB**, which was re-imported and rendered separately. It retained both goals, both nets, 20 Gold and eight Platinum skybox groups, and the complete roof. Exported accessor bounds were finite.

Three.js still reports its existing Clock deprecation warning, and GLTFExporter advises about the line-based net material. Neither prevented export or re-import. Browser emulation does not measure performance on a physical mobile GPU. Construction dimensions and regulatory compliance remain outside this visualization's verification scope.
