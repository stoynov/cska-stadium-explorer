# Prompt 2 — Build the CSKA Sofia stadium explorer

Copy the instructions below into your coding agent in this project. This prompt also works independently; the audit from Prompt 1 adds detail when available.

---

You are a senior creative developer and architectural visualization engineer. Build a polished, working interactive 3D experience for CSKA Sofia's new stadium, „Българска армия“, in Borisova Gradina, Sofia.

Experience reference: https://gpt-6-stadium.vercel.app/

Architectural and content source: https://stadium.cska.bg/

The result should have the reference's immersive full-screen stadium viewer, cinematic camera chapters, restrained editorial interface, and useful model controls. The architecture and identity must be recognizably CSKA Sofia. A functioning, freely orbitable 3D stadium is the central deliverable.

## 1. Start with the evidence

Inspect the workspace, repository instructions, and existing stack before editing. Read `docs/reference-audit.md` and `docs/reference-reconstruction-spec.md` if present. Read `docs/research-notes.md` and `public/assets/cska/manifest.json` when available. Open the local reference images before designing the geometry.

The asset folder contains 22 downloaded images from the official stadium site. Useful starting files:

- `public/assets/cska/22142-CAM-002-scaled.jpg` — architectural visualization of the completed stadium in its park setting.
- `public/assets/cska/DJI_20260809160800_0092_D-2048x1152.jpg` — August 2026 aerial showing façade, roof structure, pitch, and white ЦСКА seat lettering.
- Other `DJI_202608...` files — additional construction views; most are cropped 845 × 684 images, so use care when estimating proportions.
- `public/assets/cska/cska_logo-229x300.png` — official crest image.
- `public/assets/cska/22142-CAM-004-300x169.jpg` — small render thumbnail; do not enlarge it for a hero image.

If these files are missing, acquire the images exposed by the official page and create the same source manifest. Preserve original files and credit information. Use local optimized derivatives in the app. Public availability does not establish a reuse license; record known attribution or licensing information in the manifest without inventing it.

Treat newer construction photos as evidence of built details and the older architectural rendering as evidence of the intended completed appearance. Record conflicts and modeling assumptions in `docs/model-assumptions.md`. Build an interpretation of the completed stadium; the imagery alone does not establish that it is open to the public.

## 2. Architectural identity — highest priority

Model the actual characteristics visible in the CSKA images:

- A compact rounded rectangular stadium with long straight sides and curved corners. Derive the proportions from multiple views.
- A warm champagne/gold-toned façade composed of closely spaced horizontal louvers, with dark glazing and entrances beneath it. Reproduce the visible changes in the lower façade edge where supported by photographs.
- A continuous roof canopy surrounding a large open rectangular center, with pale roof surfaces and exposed white/gray steel supports and trusses. Match the depth, rhythm, and opening from the references.
- Red seating with white accents and large white Cyrillic `ЦСКА` lettering in the appropriate stand. Construct seating blocks, aisles, access openings, and tier relationships from the photographs. Do not import RAMS Park's multi-tier arrangement by default.
- A football pitch, markings, goals, perimeter circulation, and proportionate stand-to-pitch distances. Use a 105 × 68 m pitch as an explicit modeling assumption unless a reliable CSKA source confirms it.
- Dense park trees, landscaped approaches, paths, and entrance plazas appropriate to Borisova Gradina. Surrounding detail may be simplified, but the setting must read as a stadium in a park.

Do not transplant the reference's Istanbul towers, highway scene, yellow Galatasaray lettering, crest, stars, or stadium proportions. Do not add old running-track geometry to the new football bowl. Match solar panels or other roof equipment only where CSKA evidence supports their placement.

If no suitable authorized 3D model is available, implement a coherent procedural stadium in Three.js. Use parameterized straight sections and rounded corners; separate roof, supports, façade, bowl, pitch, signage, and landscape into named groups. Use instancing or merged geometry for seats, louvers, trusses, and trees. A downloaded photograph is architectural reference and fallback content, not a replacement for the navigable model.

The model must look convincing from all five camera chapters and from free orbit. Prioritize silhouette, roof opening, bowl proportions, façade rhythm, and seat lettering before tiny objects or effects.

## 3. Interface composition

Use a full-viewport 3D canvas as the main experience. Keep the opening stadium visible and unobstructed, with an oblique aerial view showing both the gold façade and seating bowl.

Desktop layout:

- Upper left: official crest, `Българска армия`, small subtitle `ДОМЪТ НА ЦСКА`, and location `Борисова градина · София`.
- Upper right: compact floating dark toolbar, with BG/EN language control nearby.
- Lower left: chapter number, expressive serif heading, and one short sentence of supporting copy.
- Lower right: compact compass/view indicator, aligned with the model's documented orientation. Omit geographic claims that have not been verified.
- Bottom: thin chapter progress rail, tour control, five chapter buttons, chapter counter, and understated source/model note.

Use a Cyrillic-capable editorial serif for titles and a legible sans serif for controls. Use warm white text, charcoal panels, CSKA red for selected states, and subtle warm metallic accents inspired by the façade. Starting color values may be tuned to the imagery; do not present estimated values as official brand tokens. Use restrained dark edge gradients only as needed for legibility over the scene.

Adapt the long Bulgarian title to the available width with deliberate line breaks. Keep controls secondary to the model. Avoid unnecessary cards, oversized header navigation, or unrelated marketing sections in the primary viewer.

## 4. Five camera chapters

Create a named camera preset, target, short Bulgarian/English copy, and appropriate framing for each chapter:

1. `Общ изглед` / `Overview`: exterior aerial. Proposed heading: `Новият дом на ЦСКА.`
2. `Трибуните` / `The stands`: bowl and seat lettering. Proposed heading: `Червено сърце. Един глас.`
3. `Теренът` / `The pitch`: near-pitch perspective with surrounding stands. Proposed heading: `Тук започва следващата история.`
4. `Архитектура` / `Architecture`: roof structure and gold façade. Proposed heading: `Архитектура с характер.`
5. `Борисова градина` / `The park`: wider setting and approaches. Proposed heading: `В сърцето на София.`

These headings are proposed original copy, not official quotations. Provide natural English translations.

Smoothly interpolate camera position and target, with an initial transition duration around 1.5–2.5 seconds, then tune by feel. Update chapter text, active button, and progress together. Add an automatic tour with visible start/pause/resume controls. Manual camera input cancels the current transition and pauses the tour without snapping. Reset returns to the overview camera and pauses playback; preserve independent user display settings.

## 5. Working controls

Implement the following as real, testable actions:

- Orbit: mouse or single-finger drag, bounded zoom, sensible polar limits, and prevention of underground views. Make wheel/pinch zoom behavior consistent and explain it briefly.
- Chapters: direct camera navigation using the five buttons. Keyboard activation must work.
- Cutaway: hide or fade the roof group so the bowl is visible, with a reversible pressed state. Do not require shader clipping when roof visibility satisfies the behavior.
- Labels: toggle anchored, readable labels for supported architectural features. Suppress labels occluded by geometry or hidden by the selected view where appropriate.
- Day/night: change environment and lighting, with convincing pitch illumination and controlled emissive accents at night.
- Capture: download a PNG of the current rendered stadium view. Define whether overlays are included; prefer a clean scene capture and verify the file is nonblank.
- GLB export: download the generated stadium geometry with materials and embedded textures where supported. Exclude UI and optional landscape by default. Export the complete stadium even when cutaway is active. Verify that the file can be imported again.
- About: accessible dialog with model limitations, source links, and image credits. State that the model is an approximate visual interpretation.
- Fullscreen: enter/exit where supported, with a usable layout on unsupported devices.
- BG/EN: translate interface, chapter copy, labels, dialogs, accessibility text, and help. Bulgarian is the default. Preserve scene state when switching.

The reference also exposes audio, drone shows, and a live visitor badge. Treat these as optional enhancements after the model and core controls pass review. Include audio only if an appropriate reusable asset is available, and start it only on explicit user input. A drone show may use lightweight particles forming ЦСКА or a red star; it must have an off state. Show a live count only with a real presence implementation; omit it otherwise.

## 6. Engineering and performance

Use the existing compatible stack. If the workspace is empty, use Vite, React, TypeScript, Three.js, React Three Fiber, and Drei. Use one camera animation approach, such as a frame-based controller or GSAP, to avoid conflicting ownership. Verify APIs against the installed versions.

Suggested modules: `StadiumExperience`, `StadiumModel`, `SeatingBowl`, `RoofStructure`, `Facade`, `Pitch`, `ParkEnvironment`, `CameraDirector`, `SceneLighting`, `ViewerToolbar`, `ChapterNavigation`, `SceneLabels`, and `AboutDialog`. Keep model dimensions, camera presets, content translations, and asset paths in separate configuration files.

Keep expensive geometry stable across React renders. Instance repetitive parts, share materials, bound device pixel ratio, and use mobile quality settings for shadows, trees, and seats. Pause unnecessary work when the page is hidden. Lazy-load optional heavy export utilities where practical. Preserve shadow/material coherence without excessive postprocessing.

Target smooth interaction on an ordinary laptop and usable interaction on a mid-range phone. Measure performance when hardware is available and report the device, viewport, and observed limits instead of claiming unmeasured FPS.

## 7. Mobile, accessibility, and failure handling

- Test around 390 × 844, 768 × 1024, and 1440 × 900, plus a short landscape viewport.
- Reframe the stadium for narrow screens. Use a compact toolbar or overflow menu and horizontally scrollable chapter navigation where needed.
- Use safe-area insets and comfortable touch targets. Keep the identity block, story, and controls from overlapping.
- Make dialogs and menus keyboard accessible, with visible focus, accessible names, state announcements, Escape dismissal, focus trapping, and restored focus.
- Respect reduced motion: remove automatic camera movement and use immediate or brief chapter changes.
- Provide semantic HTML for venue information and chapter summaries outside the canvas.
- Show a useful loading state. On unavailable WebGL, context loss, or unrecoverable model failure, present a local official image with accessible information and a retry option. Keep the fallback intentional and complete.
- Load assets locally so image capture and export are not broken by cross-origin textures. Handle download and fullscreen failures gracefully.

## 8. Content accuracy

Use verified official sources for capacity, sector naming and placement, opening dates, dimensions, history, sustainability claims, and coordinates. Date the source notes and distinguish planned features from completed ones. Do not treat animated zero-valued counters or an undated construction estimate as current facts. Omit unsupported statistics from the UI and document modeling assumptions instead.

## 9. Build sequence and completion criteria

Work through research/assets, model blockout, architectural refinement, camera system, interface, working controls, mobile behavior, and verification. Make reasonable reversible implementation choices and continue until the app runs; ask only when a missing decision materially blocks the result.

Before finishing:

- Run the project and its relevant build/type checks.
- Visually compare the overview, bowl, façade, and roof against the downloaded official references. Correct major architectural mismatches.
- Test all five chapters, tour interruption, cutaway, labels, lighting, language, reset, modal focus, and supported fullscreen behavior.
- Download and inspect the PNG; export and re-import the GLB.
- Check desktop/mobile layouts, reduced motion, missing assets, and WebGL fallback. Fix serious console errors.
- Save representative screenshots and document actual verification results, including any checks that could not run.

Deliver the working source, local assets and manifest, clear run/build instructions, model assumptions, source credits, and a concise report of completed features and remaining limitations. Keep the app local unless publication is requested.

The final experience should make a CSKA supporter immediately recognize the new stadium through its gold horizontal façade, roof structure, red-and-white bowl, ЦСКА lettering, and setting in Borisova Gradina.
