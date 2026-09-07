# RAMS Park reference audit

Inspected: 6 September 2026. Reference: https://gpt-6-stadium.vercel.app/. Purpose: document the public experience for an original CSKA Sofia stadium implementation. This audit does not implement the application.

## Findings that matter

The reference is a real-time 3D viewer with an HTML interface layered over a full-size canvas. Its strongest qualities are the stadium-first composition, readable editorial typography, five named camera views, and reversible model controls. Its downloaded GLB provides direct evidence of actual seat geometry and GPU instancing.

Several details should be improved for CSKA: manual orbit does not pause the active tour; labels are a fixed screen-space stack rather than projected architectural annotations; three mobile toolbar controls lose their accessible names; and the minimum scene height creates vertical overflow in a short landscape viewport.

The core interaction audit passed for chapter selection, progress-rail navigation, keyboard chapter activation, orbit, wheel zoom, tour start/pause/restart, cutaway, labels, day/night, language switching, About, screenshot capture/save, GLB download, and custom drone text. “Passed” here means the specific observed action worked, not exhaustive testing of every combination. Fullscreen was denied in the browser environment. Audible music playback, native touch gestures, reduced-motion camera behavior, and GLB visual re-import remain unverified.

## Method and evidence

Used the connected Chrome browser, live DOM snapshots, read-only computed-style measurements, browser screenshots, public asset inventory, the downloaded public stylesheet, and locally inspected user-facing exports. No private source, session stores, application memory, or internal camera objects were inspected.

| Viewport | Actual document size | Result |
| --- | --- | --- |
| Desktop 1440 × 900 | 1440 × 900 | Full canvas and complete controls; primary measurement baseline. |
| Phone portrait 390 × 844 | 390 × 844 | Toolbar wraps beneath identity; icon-only controls; model is heavily cropped horizontally. |
| Tablet portrait 768 × 1024 | 768 × 1024 | Screenshot recorded; no document overflow measured. Detailed touch behavior not tested. |
| Phone landscape 844 × 390 | 844 × 580 | Scene remains 580px tall. At page top, bottom navigation is below the viewport; scrolling exposes it and hides the header. |

Viewport overrides simulate layout dimensions, not a physical phone or touch-capable browser. The original browser sizing was restored after inspection.

Primary screenshots:

![Desktop opening view](reference-evidence/01-desktop-overview.jpg)

![Bowl with cutaway and labels](reference-evidence/02-bowl-cutaway-labels.jpg)

![Phone portrait](reference-evidence/14-mobile-day-overview.jpg)

![Short landscape at the top of the document](reference-evidence/19-landscape-top.jpg)

Additional captures in `reference-evidence/`: pitch, roof, district, zoomed-out scene, tour orbit, night effects, About, custom drones, capture panel, downloaded PNG, mobile pitch/dialog, tablet, and early/settled camera samples. Some captures intentionally show inherited toggle states. In particular, `13-mobile-overview.jpg` retains the custom-drone form; `14-mobile-day-overview.jpg` removes it. `17-landscape-844x390.jpg` is scrolled to the lower part of the 580px scene, while `19-landscape-top.jpg` is at scrollY 0.

Raw supporting files: `desktop-styles.json`, `mobile-styles.json`, `landscape-metrics.json`, `label-position-comparison.json`, `reference.css`, `observed-assets-final.json`, and `glb-inspection.json`.

## Desktop composition and measured styles

All coordinates below are CSS pixels in the 1440 × 900 opening view. They are observations, not a requirement to hard-code every dimension.

| Element | Measurement / styling |
| --- | --- |
| Scene | Canvas 1440 × 900 at (0, 0); main background `#889899`; `height:100dvh; min-height:580px`. |
| Header | CSS top 32, left/right 42; horizontal brand and toolbar layout. |
| Crest | Image box 52 × 65; preserve original proportions using contain. |
| Venue title | (111, 32.5), roughly 202 × 41; Georgia 36px, weight 400, letter spacing −1.5px. |
| Subtitle | Arial 10px / 15px, 3px tracking, muted `#c3cacc`. |
| Toolbar | (663.5, 35.75), roughly 734.5 × 57.5; `#17283075` background, 15px backdrop blur, 1px `#ffffff20` border, 6px radius, 6px padding. |
| Text toolbar buttons | Arial 13px / 19.5px, 12px padding, 8px icon/text gap; approximately 43.5px tall. |
| Icon buttons | About/reset/fullscreen approximately 41 × 41. |
| Hover / pressed | `#ffffff15` background and `#f0be71` foreground. Hover was measured on Cutaway. |
| Language switch | Upper right above toolbar; 11px type; active gold `#e8bb70` with dark text; roughly 21px height. |
| Location | Top 122, left 43; 10px text with 1.7px tracking; coordinate subtext 9px. |
| Visitor badge | Top 148, left 43; dark translucent rounded pill, green dot, small LIVE marker. |
| Drone selector | Label block top 200, left 43; selector at y223, 185 × 38, 12px radius. |
| Story | Left 53, bottom 177. Eyebrow at y599, heading at y633, supporting sentence at y702. |
| Chapter heading | Georgia `clamp(30px,3.5vw,56px)` → 50.4px here, weight 400, −1.3px tracking, warm white `#faf6ef`. |
| Story paragraph | Arial 14px / 21px, `#c3ccce`. |
| Compass | Right 55, bottom 185; arrow rendered at 45px with CSS rotation −25°. No camera-linked compass rotation was established. |
| Progress rail | Left/right 40, y777; five 268px hit areas separated by 5px. Visual line 2px; current segment 3px gold. |
| Transport | 66px high; Start tour left, chapters centered, chapter count right. Chapter buttons 12px type and approximately 42px height. |
| Footer | 42px high, 8px text, 1.5px tracking; subtle top separation. |

The readability overlay is a non-interactive full-canvas gradient: `linear-gradient(#0c1820c2 0%, #0000 25% 48%, #0a171fde 100%)`. It darkens the header and footer while leaving the stadium relatively clear. Toolbar/panels add their own translucency and blur. Text and control layers do not all intercept the canvas: the story and shading explicitly use `pointer-events:none`.

The font stack is Georgia for major headings and Arial/Helvetica/sans-serif for interface copy. No downloadable font was observed in the resource inventory. Cyrillic rendering should be checked on supported platforms in the CSKA build; use a bundled Cyrillic font if consistent typography across platforms is required.

## Responsive rules and issues

The downloaded stylesheet confirms distinct rules at 1150px, 800px, and 480px:

- At or below 1150px, toolbar text spans are hidden. At 844px this creates an icon toolbar beside the identity block.
- At or below 800px, title size becomes 28px, crest image becomes 34 × 43, header offsets become 20px, coordinate text is hidden, story support text becomes 12px, and bottom transport wraps to two rows.
- At or below 480px, the toolbar spans the second header row, location moves below it, and music/capture panels move down to fit the header.

At 390 × 844, the toolbar is (20, 93.5), 350 × 49. Its nine buttons measure 35 × 35. Language buttons are only 17.5px tall. The heading is 30px; bottom chapter buttons are 10px type and 31px tall. These are small interaction targets for touch.

The hidden text spans were the only accessible names for Cutaway, Labels, and Daylight/Night. Their mobile DOM snapshot contains unnamed buttons, whereas capture, music, export, reset, About, and fullscreen retain explicit labels. Add explicit accessible names in the adaptation.

The model is not adequately refitted to portrait width in the inspected state: sides of the stadium are outside the viewport. That is a screenshot observation, not a claim about the camera code. Prefer an aspect-aware camera fit for CSKA.

Landscape overflow is explained by the explicit 580px minimum height. The app remains reachable by page scrolling, but header and transport cannot both be visible at 390px height. Use a deliberately compact landscape layout rather than retaining this minimum.

## Scene observations

The stadium has a rounded rectangular outer perimeter, three visually distinct red seating bands separated by dark hospitality/concourse strips, pale aisles, access openings, yellow seat lettering, a striped green pitch, goals, a large continuous pale roof, solar-panel fields, triangular inner roof trusses, dark façades, and external support columns.

The surrounding scene includes simplified high-rise buildings, a tall rectangular tower, a highway with small vehicles, curved service roads, terrain, repeated stylized trees, and atmospheric distance fading. The overall rendering favors legible architectural geometry over photographic realism. Nearby seating visibly resolves into cushion/back shapes.

Night mode visibly changes the sky and scene illumination, lights the bowl, and adds warm red/orange exterior accents. It also changes the story text to a club-focused heading. Drone particles appear above the stadium. The downloaded PNG demonstrates a formed `CSKA` drone message, brighter stadium lighting, and the surrounding district.

The model-information dialog states that the scene is an approximate reconstruction from public photographs and uses a 105 × 68 m pitch. Treat that as the reference author's stated modeling basis; it is not survey evidence and does not establish CSKA's exact dimensions.

### Geometry evidence from GLB

The actual downloaded file is preserved as `reference-evidence/reference-export.glb` (19,230,668 bytes). Its header declares glTF 2.0 and its generator field reads `THREE.GLTFExporter r185`. This establishes the export path, not the original component framework or the whole rendering pipeline.

The file contains 1 scene, 2,625 nodes, 2,612 meshes, 20 materials, 5 textures/images, 0 animations, and 0 cameras. All five PNG images are embedded in buffer views; the inspected buffer-view ranges fit within the binary chunk. Named groups describe exterior match lighting, tiered seating, individual seat cushions, upright seat backs, and yellow stair nosings.

There are 3 nodes using `EXT_mesh_gpu_instancing`, with instance counts 42,808, 42,808, and 3,264 (88,880 total instances). The first two correspond to repeated seat parts based on the named groups; these are rendering-instance counts, not a certified stadium capacity. Other extensions include emissive strength, unlit materials, and punctual lights.

The GLB's JSON and binary structure were inspected; a visual re-import, full geometry validation, and an exhaustive inventory of whether every exterior object is exported were not performed. The file contains no camera or animation entries, so it does not itself preserve the interactive tour. Roof-hidden export behavior was not tested.

## Interaction matrix

“Transition check” states exactly what was exercised near an ongoing camera move. It does not imply every timing race was tested.

| Control | Initial/action/result | Reversal / retained state | Transition check / limits |
| --- | --- | --- | --- |
| Orbit | Drag in canvas changes orientation; screenshot shows a different view. | Reset restores overview. | Drag during an active tour leaves Pause tour pressed; tour later advances to the bowl. Manual input does not reliably cancel tour playback. |
| Wheel | Positive vertical wheel input over canvas pulls back to a wide district view. Chapter stays 01; document scroll stays 0 at desktop size. | Reset restores camera. | Exercised soon after reset. Native trackpad/pinch and a separate negative-wheel reversal were not tested. |
| Chapter buttons | All five chapters update heading, active button, counter, and framing. Pitch moves inside the bowl; roof gives elevated canopy framing; district widens context. | Overview or reset returns to chapter 01. | Selecting a chapter while tour runs stops playback. Exact repeated-click race behavior untested. |
| Progress rail | Go to The roof selects the roof chapter. | Reset returns to overview. | Other four rail segments not individually tested; named chapter buttons all tested. |
| Keyboard chapter | Enter on The pitch selects pitch at mobile dimensions. | Overview/reset tested separately. | Camera keyboard orbit not established. |
| Tour | Start changes to Pause with pressed state. Automatic advance from overview to bowl was seen between samples approximately 7 and 20 seconds after start. | Pause changes back to Start; clicking Start restarts playback from the current chapter in the immediate observed state. | Manual drag leaves tour active; direct chapter navigation stops it. Full five-chapter autoplay loop and dwell timing not exhaustively measured. |
| Reset | Restores chapter 01 and overview framing. | Labels remain enabled when reset is used with labels on. | Tested immediately after chapter selection. Active-tour reset was not isolated from a prior chapter action that had already paused the tour. |
| Cutaway | Off → pressed; removes canopy and exposes bowl. | Second click restores roof; state carries between chapters. | Enabled immediately after bowl navigation and disabled on roof chapter; UI remains responsive. |
| Labels | Off → pressed; three labels appear. | Second click removes them; reset does not clear them. | Enabled during bowl navigation. Roof label remains despite cutaway. Position unchanged after orbit. |
| Day/night | Daylight → Night pressed, night scene and club-focused copy. | Night → Daylight restores daytime copy/lighting. | Exact toggle-during-transition behavior untested. Some screenshots show ongoing lighting/particle interpolation. |
| Drone selector | Galatasaray, Champions League, and custom-name options available; changing selector updates selection. Selecting Galatasaray from the daytime custom state activated night mode. | Other formations can be selected; daylight hides the night presentation. No explicit Off option observed. | Exact formation-change/camera-transition conflict not tested. |
| Custom drones | Empty form has disabled launch. Entering CSKA enables launch; launch results in visible CSKA particles in exported PNG. UI states max 18 characters and ~8 seconds to form. | Switching formation removes the custom form; input survives language switching. | The 8-second duration is a UI statement, not a stopwatch measurement. Cyrillic input and length enforcement were not tested. |
| Language | English → Turkish translates controls, hints, chapters, drone form, presence wording, and crest alt text. | English restores; night mode and CSKA form value retained. | Camera-transition timing not tested; no evidence that language should reset scene state. |
| Music | Opens soundtrack panel. Selecting the anthem creates Spotify embed/link and Stop control. | Stop clears selection; minimize control dismisses the full panel after stopping. | Playback continuity while minimized and audible playback not verified. No account sign-in performed. |
| Capture | Opens photo preview with Save image, Share image, and external posting link. It does not immediately download. | Close photo removes panel. | Capture while camera is moving was not tested. Sharing and posting were not activated. |
| Save image | Save image downloads `my-stadium.png`, 2520 × 1575, nonblank. | File is an independent export. | Browser download event notification timed out, but file existence, dimensions, and visual content verified actual success. |
| GLB | Clicking export downloads the 19.23MB model. | File is independent; app recovered after a subsequent short interaction timeout. | Export under cutaway or during a camera transition untested. Visual re-import untested. |
| About | Opens model-notes dialog; focus starts on source link. | Tab moves to Close then wraps to link; Escape closes and returns focus to About. Close button also works, including mobile. | Opening during a camera move untested. Focus outline on Close measured at 2px gold. |
| Fullscreen | Clicking attempted fullscreen; browser logged `TypeError: not granted`. | Document remained outside fullscreen. | Environment-limited; do not label functionality successful or definitively broken. |
| Visitor badge | Count and LIVE badge visible; tooltip describes a 60-second window and browser-tab deduplication. Public `/api/presence` resource observed. | No control to reverse. | Backend accuracy, deduplication, and offline behavior were not tested. |

### Capture content

The saved PNG includes the rendered stadium, surroundings, lighting, custom drone formation, and an added branded bottom caption strip. It excludes the interactive toolbar, language switch, chapter navigation, and other normal HTML overlays. It is therefore a composed export, not a screenshot of the whole DOM.

![Actual exported PNG](reference-evidence/12-exported-capture.png)

The capture panel offers external sharing, but this audit did not send, post, or upload anything.

### Labels are screen-space content

The Solar canopy label measured (633.59, 360), size 162.74 × 34, before and after orbit. The public stylesheet confirms a `.labels` flex column positioned at `top:40%; left:44%`, with 30px gaps. At narrow widths, left becomes 35%. This is direct evidence that the inspected labels are fixed UI annotations, not geometry-projected anchors. A CSKA implementation should intentionally improve this behavior.

### Soundtrack options observed

- Canım da Sensin Cim Bom Bom
- Aşkın Olayım
- UEFA Champions League Anthem
- Cimbom Galatasaray · Şampiyon 2022–2023
- Şereftir Seni Sevmek

Only the anthem selection was tested. Its embed is recorded in the asset manifest. The UI says explicit playback may be needed and Spotify may require sign-in for a full track. Do not infer audio rights, working autoplay, or full-track access from the listed options.

## Timing and implementation certainty

Chapter changes animate visibly. An early screenshot was taken approximately 1.14 seconds after initiating a bowl selection; a later one at approximately 10.18 seconds shows settled framing. These sparse samples do not isolate the actual animation duration. Use a proposed 1.8-second transition in the reconstruction and tune it against side-by-side captures; do not label it recovered timing.

Direct implementation evidence is limited to the public stylesheet/DOM conventions and export metadata. Utility CSS, `data-base-ui-*` dialog attributes, and Lucide SVG class names are observable. The root React framework, use of React Three Fiber, exact controls library, scene construction method, bundler, and server deployment internals were not proven by this audit. The reconstruction stack is a recommendation.

## Untested boundaries

- Physical touch, multitouch pinch, trackpad-specific gestures, maximum/minimum orbit constraints, and prolonged performance.
- WebGL-disabled/loading-failure/context-loss screens and actual reduced-motion camera behavior. A reduced-motion CSS rule was observed for a generic shimmer utility; it does not prove camera support.
- Exhaustive panel combinations and all toolbar actions during camera transitions.
- Fullscreen in a browser that grants the request; audible music and playback after minimizing.
- GLB rendering after re-import, exporting hidden roof geometry, and complete exterior export scope.
- Drone name sanitization, Cyrillic rendering, input-limit enforcement, and presence backend semantics.
- Exact source code, camera values, frame rate, draw calls, polygon totals, and survey-level stadium measurements.

## Carry into the CSKA build

Preserve the immersive canvas, restrained overlays, five camera chapters, reversible view controls, and useful local exports. Rebuild the stadium from official CSKA references: gold horizontal louvers, matching pale roof/truss structure, red/white ЦСКА seating, and Borisova Gradina. Add proper mobile camera fitting, stable accessible names, readable touch targets, true scene labels, explicit tour interruption, robust failure states, and complete Bulgarian/English copy.

See [the reconstruction specification](reference-reconstruction-spec.md) for the proposed implementation and [the asset inventory](reference-assets.json) for source records.
