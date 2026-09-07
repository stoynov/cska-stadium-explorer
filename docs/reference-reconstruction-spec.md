# Stadium viewer reconstruction specification

Status: implementation blueprint produced by Prompt 1 on 6 September 2026. This document proposes a maintainable equivalent of the inspected reference and identifies CSKA-specific substitutions. It does not claim to reproduce the reference's private code. No application implementation is included in this audit.

Evidence: [reference audit](reference-audit.md), [asset inventory](reference-assets.json), and [official CSKA research](research-notes.md). Build brief: [CSKA master prompt](../prompts/02-cska-stadium-master-prompt.md).

## Product shape

One full-screen architectural explorer centered on a freely orbitable stadium. The default view shows the exterior façade, roof opening, bowl, and immediate setting. HTML identity, controls, story, and chapter navigation remain readable above the canvas. Five curated camera views guide the visitor without taking away manual control.

For CSKA, Bulgarian is the default language and English is available. The venue is „Българска армия“ in Borisova Gradina. Use official images to rebuild the architecture; preserve the reference's interaction hierarchy while adapting the geometry, copy, and environment.

## Proposed technology

The workspace currently contains prompts, research, and assets, with no existing app stack to preserve. Use Vite, React, TypeScript, Three.js, React Three Fiber, and Drei. Use React state/reducer for durable viewer state and a single imperative camera director inside the render loop for camera motion. Keep the implementation compatible with the versions installed at build time.

Use a headless accessible dialog/select implementation already available in the chosen project, or a small accessible implementation with tested focus management. Icons can use a consistent SVG set. Plain CSS with documented tokens is sufficient; utility CSS is optional. No backend is needed for the core experience.

The GLB metadata proves that the reference export uses Three.js, but React, R3F, Drei, and Vite here are proposed choices. Avoid treating the 2,612 meshes in the reference export as a performance target.

## Component and scene boundaries

```text
StadiumExperience
├── ViewerStateProvider
├── SceneErrorBoundary
│   └── StadiumCanvas
│       ├── SceneLighting
│       ├── CameraDirector
│       ├── SceneControls
│       ├── StadiumModel [replaceable model adapter]
│       │   ├── FoundationAndConcourse
│       │   ├── Facade
│       │   ├── SeatingBowl
│       │   │   ├── TerracesAndAisles
│       │   │   ├── SeatInstances
│       │   │   └── SeatLettering
│       │   ├── Roof [cutaway group]
│       │   │   ├── Canopy
│       │   │   └── Trusses
│       │   ├── PitchAndGoals
│       │   └── ArchitecturalAnchors
│       ├── ParkEnvironment
│       └── DroneFormation [optional]
├── ReadabilityShade
├── VenueIdentity
├── ViewerToolbar
├── LanguageSwitch
├── ChapterStory
├── SceneLabels
├── ViewOrientationIndicator
├── ChapterNavigation
├── AboutDialog
├── CapturePanel
├── MusicPanel [optional]
└── LoadingOrFallback
```

Geometry components own mesh creation and disposal. UI components dispatch intent; they do not directly manipulate cameras or meshes. `StadiumModel` exposes a common contract: root object, roof group, bounds, named feature anchors, and an exportable stadium root. A procedural model and an imported GLB must implement the same contract.

`ParkEnvironment` is a sibling of the exportable stadium root, allowing the default GLB to exclude decorative surroundings. Labels are derived from architectural anchors, not copied from the reference's fixed column.

## Configuration and files

Suggested implementation layout:

```text
src/
  app/StadiumExperience.tsx
  scene/model/             geometry, model adapter, seat lettering
  scene/CameraDirector.tsx
  scene/SceneControls.tsx
  scene/SceneLighting.tsx
  scene/ParkEnvironment.tsx
  ui/                     toolbar, chapters, dialogs, labels
  state/viewer.ts         reducer and event types
  config/stadium.ts       dimensions and documented assumptions
  config/cameras.ts       chapter camera presets
  content/bg.ts
  content/en.ts
  services/capture.ts
  services/exportGlb.ts
  styles/viewer.css
public/assets/cska/        official source images and manifest
public/assets/optimized/   app-ready local derivatives
docs/model-assumptions.md
```

Keep downloaded reference evidence in `docs/reference-evidence/`; do not ship the RAMS Park GLB, stylesheet, imagery, or reference screenshots as CSKA runtime assets. The existing official CSKA manifest remains the source of truth for those images. Add dimensions, derivative relationships, and credits during build preparation.

## State and interaction contract

Durable state:

| State | Values / purpose |
| --- | --- |
| `activeChapter` | overview, stands, pitch, architecture, park |
| `cameraMode` | idle, transitioning, manual |
| `tourStatus` | stopped, playing, paused |
| `cutaway` / `labelsVisible` | independent booleans |
| `lighting` | day, night |
| `language` | bg, en |
| `panel` | none, about, capture, music |
| `loadStatus` | loading, ready, failed |
| `quality` | low, medium, high; selected from capability and user preference |
| `exportStatus` | idle, preparing, succeeded, failed |

Optional drone and music state stays separate from the core viewer. Do not introduce a simulated presence counter.

Transitions:

| Event | Required result |
| --- | --- |
| `SELECT_CHAPTER(id)` | Pause automatic tour, cancel existing camera interpolation, set target chapter/text/rail, transition from the current camera pose. Preserve display/language settings. |
| `ORBIT_START` / zoom input | Cancel interpolation and pause tour immediately. Keep current chapter as context; camera now belongs to manual controls. |
| `TOUR_START` | Begin or resume current chapter; complete its camera move, then schedule the next chapter after a configured dwell. |
| `TOUR_PAUSE` | Stop dwell timer and freeze at current camera pose; leave a resumable chapter context. |
| `TOUR_ADVANCE` | Transition to next chapter through the same camera director; never create an independent camera animation loop. |
| `RESET_VIEW` | Pause tour and transition to overview. Preserve cutaway, labels, language, lighting, and audio preference. |
| `TOGGLE_CUTAWAY` | Change roof group's visibility; no camera reset. Hide roof anchors when the roof is hidden. |
| `TOGGLE_LABELS` | Enable/disable projected feature labels without changing view. |
| `SET_LIGHTING` | Interpolate environment/material/light settings without replacing the chapter story. |
| `SET_LANGUAGE` | Update all interface and accessibility copy, leaving scene and camera state untouched. |
| `OPEN_PANEL` | Open one primary panel; About traps focus. Pause automated camera motion while a modal requires attention. |
| `VIEWPORT_CHANGE` | Recompute safe camera framing. Preserve orientation when manual; refit chapter target when following a preset. |
| `WEBGL_FAILURE` | Stop rendering work; replace with the local fallback image and semantic content. |

These intentionally improve on observed reference behavior: orbit pauses the tour, labels follow geometry, and switching lighting does not replace chapter text with unrelated club copy.

## Camera model and presets

Choose a coordinate convention and document it: Y up; pitch length along Z; pitch center at (0,0,0). Align geographic north only after verifying the site orientation. Until then, use a model-orientation indicator without claiming geospatial accuracy.

Let `R` be the maximum horizontal half-extent of the stadium bounding box, and `H` its roof height. These values come from the constructed model, not from guessed geographic dimensions. The following are proposed starting presets, not recovered reference coordinates:

| Preset | Position (x,y,z) | Target (x,y,z) | FOV | Story purpose |
| --- | --- | --- | --- | --- |
| overview | (1.35R, 1.00R, 1.55R) | (0, 0.3H, 0) | 45° | Façade, roof opening, and park approaches |
| stands | (0.75R, 0.75R, 0.9R) | (0, 0.3H, −0.15R) | 45° | Red/white bowl and ЦСКА lettering |
| pitch | (0, 2, 40) metres | (0, 12, −45) metres | 60° | Interior scale and terraces from near field level |
| architecture | (0.35R, 1.55R, 0.65R) | (0, 0.7H, 0) | 42° | Roof opening, trusses, façade rhythm |
| park | (2.25R, 1.65R, 2.4R) | (0, 0.15H, 0) | 45° | Landscape context |

Tune positions after the actual geometry is built; validate that near-pitch positions are clear of walls, pitch edges, and seating. If the bowl chapter cannot show the intended detail with the roof present, find a better camera first or explicitly explain a chapter-specific reveal. Do not silently overwrite the user's cutaway preference.

Initial transition settings: 1.8 seconds, smooth ease-in/out; tour dwell 9 seconds after camera settles. These are design defaults. The reference's actual duration was not measured precisely. Store them in configuration and tune visually.

Maintain exactly one camera owner per frame. Controls write only in manual mode. A new target captures the current pose and invalidates the previous transition token. At transition completion, update the controls target and internal spherical state so the next drag does not jump.

For aspect-aware framing, reserve the header/footer overlay area and fit the stadium bounds within the remaining rectangle. Account for both horizontal and vertical field of view; add a margin. Apply a smaller contextual fit to interior chapters. Cap near/far planes using model bounds. Set zoom and polar limits to avoid entering the ground or disappearing into the model.

Wheel and pinch are zoom inputs; chapter changes use visible buttons and keyboard. Do not bind the same wheel gesture to both zoom and chapter stepping. Apply canvas-specific gesture handling while keeping overflowing panels normally scrollable.

## Geometry strategy

Preferred initial implementation: procedural geometry informed by official CSKA photographs and renderings. It supports rapid changes to rounded-corner dimensions, seating blocks, façade louvers, cutaway groups, and export. Prioritize accurate silhouette and relationships over a large object count.

Model straight perimeter sections and rounded corners with continuous paths; use the same underlying perimeter definition for façade, concourse, and roof edges. Build tiers/terraces independently from the seat instances. Place seats in coherent rows with aisles and access openings; assign seat colors for Cyrillic lettering in the correct stand. The lettering should be legible in geometry from the intended viewing angle.

Use separate stable buffers for repeated seats, louvers, and trusses. Merge suitable static surfaces and reuse materials. Avoid creating one React element per seat. Model CSKA's actual tier relationships instead of inheriting RAMS Park's three-band arrangement. Use the existing official imagery to choose façade tone and roof/truss proportions.

An authorized artist-made GLB is an alternative when available. It may improve geometric fidelity and reduce procedural development, but must have separable roof/stands/façade groups, correct scale and orientation, efficient materials, and named anchors. Keep its adapter contract identical so it can replace the procedural model without rewriting UI or camera logic.

The reference's export is valuable evidence, not a CSKA model. A color/crest swap would preserve the wrong architecture and setting.

## Lighting and labels

Day: soft neutral environmental light, one coherent directional sun, readable façade and seating, controlled distance fading. Night: subdued blue environment, lit pitch and roof structure, restrained warm/red architectural accents. Avoid relying on emissive materials alone to imply actual illumination.

Group settings into named day/night presets. Interpolate colors/intensities independently of camera state. Respect low-quality and reduced-motion settings. Do not add unsupported architectural lighting to a factual model without documenting the interpretation.

Project named feature anchors into screen space for labels. Hide anchors behind the camera, offscreen, covered by the active modal, or hidden by cutaway. Use occlusion checks or a conservative per-view visibility map. Prevent overlap and avoid covering chapter text. Roof labels must disappear with the roof. The reference's static label stack is not the target implementation.

## Visual system and responsive behavior

Start with the measured reference hierarchy: warm white serif title/story, small sans-serif supporting text, a dark translucent toolbar, thin progress rail, minimal footer, and clear selected states. Use CSKA red for primary selected states and reserve warm metallic accents for architectural continuity.

Desktop: 32–42px top/side frame, identity upper left, toolbar upper right, large lower-left story, navigation near the bottom. Keep the heading scale fluid and make room for `Българска армия` without squeezing controls.

Tablet: consolidate toolbar labels where necessary while preserving accessible names. Allow identity/toolbar wrapping based on available width rather than one fragile breakpoint.

Portrait phone: compact identity, essential controls plus an accessible overflow menu, short story copy, and scrollable chapter navigation. Target at least 44 × 44 CSS pixels for main touch controls. Use an aspect-aware camera fit so the opening stadium is comprehensible.

Short landscape: use a compact header, smaller story, and one compact bottom strip. Avoid a 580px minimum-height scene. Use `100dvh` and safe-area insets, with bounded panels that scroll internally. Keep essential controls reachable without scrolling the entire 3D viewport.

Explicit accessible names are required even when text is visually hidden. Prefer screen-reader-only text or `aria-label`, not `display:none` as the only source of a button's name. Keep pressed/expanded/current states correct. Every popover or dialog has a close path, Escape behavior, and sensible focus restoration. Test Bulgarian and English at all breakpoints.

## Capture and GLB export

Capture should create a local PNG of the current rendered scene. Provide a preview and Save image, matching the verified reference flow. A small original CSKA caption/credit strip may be composed into the export. Exclude HTML navigation overlays. Capture only after a coherent rendered frame; do not rely on a cleared WebGL buffer. Use local textures and revoke object URLs when no longer needed.

External posting is outside the core build. If sharing is added, leave the final sharing action to explicit user interaction and provide a download fallback.

GLB export should use a complete exportable stadium root, independent of presentation toggles. Export a complete roof even if cutaway is on; avoid mutating the visible scene by cloning or building an export representation. Exclude UI, cameras, optional particles, and park by default; document the scope. Include local/embedded textures, scale metadata, descriptive names, and necessary supported material extensions.

During export, show progress/busy state, prevent duplicate exports, and handle errors. Inspect the downloaded file and re-import it using an extension-compatible loader. Confirm that geometry, materials, roof, lettering, and dimensions survive. Exported instancing support varies by downstream consumer; document required extensions and provide a flattened option only if needed.

## Assets and content

Use `public/assets/cska/manifest.json` for the existing 22 official downloads. View images before using them. Separate architectural renderings, current construction photographs, archive material, and crest assets. Keep source URL, date retrieved, file dimensions, source category, intended use, and known credit/license status.

Do not enlarge the 300 × 169 rendering thumbnail into a hero. Prefer the 2048 × 1152 architectural view and aerial for modeling/fallback. Most gallery images are cropped variants; do not derive exact aspect ratios from them alone.

Any capacities, opening dates, sector labels, pitch dimensions, or coordinates must have a dated source. Use modeling assumptions in developer documentation when authoritative dimensions are unavailable. Keep current project claims out of the UI until verified. About should explain the photographic interpretation and link to official material.

## Failure handling and quality

- Initial load: useful static background, visible loading indication, semantic venue description.
- Missing image/texture: local fallback and recoverable error; no blank permanent canvas.
- WebGL unavailable/context lost: official fallback image, chapter summaries and source links, optional retry. Do not keep showing dead controls.
- Reduced motion: no automatic tour; immediate or brief camera changes; disable particle choreography and unnecessary lighting interpolation.
- Low-capability devices: capped DPR, fewer trees/seat details, reduced shadows and optional effects; preserve stadium silhouette and controls.
- Hidden tab: pause tour scheduling and unnecessary animation; avoid a large jump on return.
- Slow/failed export: visible status, duplicate prevention, graceful error message.

Measure frame time and responsiveness on actual available hardware. Do not claim an FPS target was achieved from a screenshot. Avoid unnecessary per-frame React state writes. Dispose created geometry, materials, render targets, and object URLs when appropriate.

## Implementation order and review points

1. **Evidence and assets:** inspect images; record geometry assumptions and dated content; prepare local derivatives and fonts.
2. **Model blockout:** rounded rectangular footprint, pitch, roof opening, correct bowl proportions, façade and park context. Compare overview and interior silhouette before detail work.
3. **Architectural detail:** louvers, trusses, seating, aisles, access openings, ЦСКА lettering, materials. Compare with multiple official views.
4. **Camera/state:** all five presets, manual orbit/zoom, interruption, reset, timed tour, responsive fit.
5. **Interface:** desktop composition, Bulgarian/English copy, mobile/landscape layout, accessible controls/dialogs.
6. **Core actions:** cutaway, projected labels, lighting, capture preview/save, GLB export/re-import, About, fullscreen fallback.
7. **Resilience and optimization:** quality tiers, reduced motion, WebGL fallback, asset errors, cleanup, load/build verification.
8. **Optional enhancements:** authorized audio and lightweight drone effects only after architectural fidelity and core behavior are satisfactory. Presence requires a real implementation and is not necessary for completion.

## Acceptance checks

| Area | Evidence required |
| --- | --- |
| Architecture | Overview, bowl, façade, and roof screenshots compared with official CSKA views; document remaining approximations. |
| Camera | Every chapter reaches useful framing; rapid chapter changes and manual input do not fight the camera; wheel only zooms. |
| Tour | Start/pause/resume; interruption by drag/zoom/chapter/reset; no hidden timer advances after pause. |
| Controls | Toggle combinations and operations during transitions; reset preserves agreed settings; no stale labels. |
| Mobile | 390 × 844, 768 × 1024, 1440 × 900, and 844 × 390; long Bulgarian title and dialogs remain usable. Physical touch testing reported separately. |
| Accessibility | Keyboard chapter activation, named icon controls, focus visibility, dialog trap/restore, Escape, reduced-motion path, semantic fallback. |
| Capture | Saved PNG exists, is nonblank, has expected dimensions and scene content, and contains no unwanted interface overlays. |
| GLB | Correct header and embedded resources; visually re-imported roof, bowl, materials, and lettering; export from cutaway remains complete. |
| Resilience | Missing asset, WebGL failure/context loss where testable, download failure, unsupported fullscreen, resize during transition. |
| Engineering | Production build/type checks, relevant behavior tests, no unresolved serious app console errors; measured performance limits documented. |

These checks are implementation acceptance criteria. Only the narrower reference checks listed in `reference-audit.md` have been executed so far.
