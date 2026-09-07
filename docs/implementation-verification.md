# Implementation verification

**The results below describe the initial build.** For the subsequent staircase geometry and realism revision, see [staircase verification](staircase-verification.md).

Date: 6 September 2026. Local Chrome on macOS through the connected browser. Responsive sizes are viewport emulation, not physical phone testing.

## Build and focused regression tests

- `bun test`: **7 passed, 0 failed**, 4,048 assertions. Covers tour interruption, pause cancellation, reset preserving independent state, chapter changes, tour wrapping, language changes without camera requests, rounded perimeter continuity and finite roof-ring geometry.
- `bun run build`: **passed** TypeScript and Vite production build. Production preview started at http://127.0.0.1:4174/ because port 4173 was already occupied; the production scene, assets and controls were smoke-tested.
- Source is formatted with Prettier. Exporter and loader are separate lazy chunks. Approximate gzip sizes: UI entry 70 kB, Three core 100 kB, scene 151 kB, exporter 11 kB, loader 13 kB.
- A read-only code review found camera polar-limit, resize ownership, scene disposal and mobile focus issues; these were corrected and re-reviewed with no remaining serious findings in those areas.

## Browser checks

| Check | Actual result |
| --- | --- |
| Initial scene | Working 3D geometry, not a background image; local crest and Cyrillic typography load |
| Five chapters | Overview, stands, pitch, architecture and park visited and saved as screenshots |
| Architecture comparison | Gold horizontal envelope, pale open canopy, single red bowl, white ЦСКА letters, entrance panel strip and park setting compared with official local images |
| Tour | Timed check advanced from chapter 01 to 03 in about 20.7 seconds; drag changed the tour to paused/Continue |
| Manual control | Drag orbits the scene, cancels camera interpolation and pauses tour; wheel zoom visually checked in the production build; Enter activated the overview chapter |
| Camera correction | Pitch-level camera remains at low height after transition; manual mode prevents a resize from starting a new preset motion |
| Reset and language | EN switched labels and copy while cutaway, details and evening remained selected; reset returned to 01 while preserving those settings |
| Cutaway | Entire roof/truss group disappears and returns; bowl and façade remain |
| Labels | Anchored to model features, occlusion removes hidden labels, roof label omitted in cutaway; fixed screen text sizing preserves readability at distance |
| Evening | Environment darkens, pitch lights brighten, fixtures become emissive |
| Capture | Real PNG downloaded, copied into evidence, inspected visually: 1440 × 900, nonblank, clean scene with no UI/HTML labels |
| GLB | Downloaded 13,586,808-byte glTF 2.0 binary; 47 nodes, 42 meshes, 31 materials, 3 embedded images; no park nodes |
| Complete roof export | Exported while cutaway was enabled; independent GLTFLoader viewer showed the complete roof and trusses visible |
| Instanced geometry | Independent viewer loaded 48,024 instances (seat cushions and backs combined, not capacity) |
| Phone | 390 × 844: compact named controls, usable overflow, full stadium framing, scrollable chapter rail, no page overflow |
| Tablet | 768 × 1024: all five chapter buttons visible, toolbar and text fit, no page overflow |
| Landscape | 844 × 390: scene, identity, controls and footer fit; document bounds exactly match viewport |
| Desktop | 1440 × 900: full toolbar and editorial composition verified |
| Fullscreen | Native click in the connected browser rejected fullscreen; localized unavailable notice appeared, and the viewer stayed usable. Successful browser fullscreen entry/exit could not be established in this environment. |
| Dialog | Tab cycles through dialog controls; Escape closes; mobile About returns focus to the visible More controls trigger |
| Reduced motion | QA fixture simulated reduced-motion media response before loading the app; tour disabled with explanation and pitch chapter changed immediately |
| No WebGL | QA fixture returned null for WebGL contexts; official image, explanation, retry and source link appeared; retry under continuing failure remained usable |
| Missing crest | QA fixture pointed only the crest at a missing local URL; scene and chapter navigation remained usable; expected missing-asset requests occurred |

## Export artifacts

- [Scene PNG](implementation-evidence/cska-capture.png)
- [Complete stadium GLB](implementation-evidence/cska-export.glb)
- [GLB metadata](implementation-evidence/export-inspection.json)
- [Independent GLB rendering](implementation-evidence/11-glb-reimport.jpg)
- [Desktop overview](implementation-evidence/01-desktop-overview.jpg)
- [Phone overview](implementation-evidence/07-mobile-overview.jpg)
- [Tablet](implementation-evidence/09-tablet.jpg)
- [Short landscape](implementation-evidence/10-landscape.jpg)
- [WebGL fallback](implementation-evidence/13-webgl-fallback.jpg)

Run the dev server to revisit `docs/implementation-evidence/export-preview.html` or `runtime-check.html?mode=reduced`, `?mode=no-webgl`, `?mode=missing-crest`, and `?mode=performance`. These are explicit local QA fixtures and are not Vite production entry points. The simulated tests do not alter normal app behavior.

## Performance and remaining verification limits

A 10.01-second animation-frame sample in Chrome at 1728 × 865 observed 703 callbacks, about 70.3 per second. This measures browser scheduling cadence while rendering, not GPU timing, and is not a sustained FPS guarantee. See [sample metadata](implementation-evidence/performance-sample.json). Hardware model was not available. Physical mid-range-phone GPU performance and multitouch gestures remain unverified.

Normal scene operation produced no application errors in inspected logs. React Three Fiber still emits Three.js's `Clock` deprecation warning. GLTFExporter emits two material advisories for the two line-based goal nets; the exported geometry and embedded textures successfully re-import. Chrome-extension errors from the automation integration were also present and are separate from application exceptions. Simulated missing WebGL/assets intentionally produce failure-path diagnostics.

Actual GPU context loss and restoration were not forced; the context-loss event handler, unmount disposal and retry paths are implemented, with unavailable-WebGL tested separately. OS-level reduced-motion changes, mobile safe-area hardware, screen-reader use and cross-browser behavior are not certified. No full WCAG audit or CAD/BIM compatibility claim is made.

The representation is approximate; see [model assumptions](model-assumptions.md). Optional audio, drone effects and presence counts were not included.
