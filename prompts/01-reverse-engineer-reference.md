# Prompt 1 — Reverse engineer the stadium experience

Copy the instructions below into your coding agent. Run this before the CSKA build prompt when a fresh audit is needed.

---

You are a senior creative developer, browser investigator, and real-time 3D engineer. Reverse engineer the public-facing experience at https://gpt-6-stadium.vercel.app/ and produce an evidence-based reconstruction specification that another developer can implement.

The intended follow-on project is an interactive model of CSKA Sofia's new Bulgarian Army Stadium. For this task, study the reference's interface, scene composition, camera behavior, and interactions. Deliver the audit and implementation blueprint; do not build the CSKA application yet.

## Investigation method

1. Inspect the current workspace and its instructions. Preserve existing files.
2. Open the reference in a real browser. Wait for the stadium to render. A text scrape alone cannot establish its visual or interactive behavior.
3. Inspect desktop at approximately 1440 × 900 and mobile at approximately 390 × 844. Capture the opening view and representative interaction states. Record the actual viewport dimensions.
4. Inspect the live DOM, computed styles where supported, publicly exposed assets, and visible responses to input. Separate direct observations from implementation hypotheses. Do not claim to recover private source code, exact camera coordinates, or the original framework without evidence.
5. For every control, record its initial state, action, resulting state, reversal, and behavior during an active camera transition. Mark anything untested explicitly.

## Known starting observations — revalidate these

The reference presents RAMS Park in a full-viewport interactive 3D scene. Its opening desktop composition includes a crest and serif venue title at upper left, a small architectural-study subtitle, location metadata, and a dark floating toolbar at upper right. A large story heading appears toward the lower left. A bottom progress rail and five chapter buttons accompany a tour control, chapter counter, and small footer text. A compass sits toward the lower right.

The exposed toolbar includes music, image capture, GLB download, cutaway, labels, daylight/night, camera reset, model information, and fullscreen. English and Turkish language controls, a drone-show selector, and a live visitor badge are also visible.

The five chapters cover overview, seating bowl, pitch, roof, and surrounding district. Selecting the bowl changes the chapter counter, story text, and camera view. Cutaway removes roof geometry to expose the bowl. Labels appear over scene features. The lighting control changes from Daylight to Night. The model-information dialog identifies the geometry as an approximate photographic reconstruction and its surroundings as illustrative.

These are observations from a prior inspection, not proof that every feature works end to end.

## What to measure and explain

### Interface and visual system

- Canvas coverage, stadium framing, horizon height, negative space, and opening camera orientation.
- Positions and dimensions of the identity block, toolbar, story text, compass, navigation, and footer.
- Typography families or closest supported equivalents, sizes, weights, line heights, letter spacing, and Cyrillic compatibility for adaptation.
- Colors, translucency, gradients used for text readability, borders, corner radii, icon sizing, active states, hover states, and focus states.
- How text and controls remain legible over the moving 3D scene.
- How layout changes on narrow screens, landscape phones, and shorter windows.

### Scene and architecture

- Stadium footprint, tier structure, seating rows, aisles, roof opening, trusses, façade, pitch, goals, signage, and exterior surroundings.
- Distinguish actual geometry from textures or billboards where evidence supports the distinction. Otherwise label the rendering approach as a hypothesis.
- Day/night differences in sky, ambient light, floodlights, emissive surfaces, shadows, and any drone animation.
- LOD opportunities and repeated geometry suitable for instancing.
- Which features are essential to recognizability versus optional decoration.

### Interaction matrix

Inspect orbit drag, wheel/trackpad behavior, touch input, chapter navigation, start/pause/resume tour, camera reset, cutaway, labels, lighting, language, fullscreen, music, capture, GLB export, and drone selection. Test safe read-only interactions and user-authorized downloads. Never assume a visible button proves a functioning feature.

Determine whether scrolling zooms the camera, changes chapters, or scrolls content; specify how gesture conflicts are avoided. Measure approximate transition durations from observation and label them estimates. Check whether manual orbit interrupts a tour. Inspect modal closing and keyboard focus behavior.

For capture and GLB export, record what is actually included if tested. For audio, record available tracks and consent/playback behavior without assuming reuse rights. For the visitor badge, describe the visible claim without assuming the backend implementation.

## Reconstruction blueprint

Propose a maintainable equivalent using React, TypeScript, Three.js, React Three Fiber, and Drei, unless the existing project has a suitable stack. This is a proposed implementation, not a claim about the reference's stack.

Specify:

- Scene graph and component boundaries.
- A shared state model for active chapter, camera transition, tour playback, cutaway, labels, lighting, language, and dialogs.
- Named camera presets containing position, target, field of view, and transition settings. Estimate initial values; tune through visual comparison.
- A single camera controller that prevents competing animation loops and cancels transitions on manual input.
- Procedural geometry versus a supplied GLB, including trade-offs and replacement strategy.
- Local asset organization and a source manifest.
- Loading, WebGL failure, missing asset, reduced-motion, and mobile quality behavior.
- Verification steps and a prioritized implementation sequence.

## Adaptation boundaries for CSKA

Preserve the reference's immersive viewer format and functional hierarchy. Rebuild the actual stadium geometry, façade, roof, seating pattern, club identity, language, and environment from https://stadium.cska.bg/. The Istanbul model is not a suitable CSKA model with different colors. Account for Bulgarian Cyrillic and the longer stadium name.

## Deliverables

Write:

1. `docs/reference-audit.md` — observations, viewport records, screenshots, interaction matrix, and explicit unknowns.
2. `docs/reference-reconstruction-spec.md` — component structure, state transitions, scene requirements, responsive layout, proposed stack, and implementation order.
3. `docs/reference-assets.json` — relevant observed asset URLs with type, purpose, source page, and reuse status when known.

Finish with a short account of what was verified, what remains inferred, and the essential requirements to carry into the CSKA build. If browser access fails, report that limitation and use the supplied prior observations without pretending to have tested the site.
