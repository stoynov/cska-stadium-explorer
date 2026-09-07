# CSKA Stadium Explorer Implementation Plan

> **For agentic workers:** Execute inline with superpowers:executing-plans. The user has authorized the supplied specification and implementation.

**Goal:** Build a functioning CSKA Sofia architectural stadium explorer with a recognizable procedural model and complete core controls.

**Architecture:** A React interface overlays a React Three Fiber canvas. A procedural model factory returns a named stadium group; a single camera director controls transitions. Pure state transitions coordinate chapters and tour interruption.

**Tech Stack:** Vite, React, TypeScript, Three.js, React Three Fiber, Drei, CSS, Bun tests.

**Spec:** `docs/reference-reconstruction-spec.md` and `prompts/02-cska-stadium-master-prompt.md`.

## Global constraints

- Bulgarian default, complete English translation.
- Official CSKA assets only in the runtime; reference assets remain research evidence.
- Full geometry, five cameras, reversible cutaway and labels, day/night, capture, GLB export, accessible About, fullscreen fallback.
- Model dimensions are documented interpretations, not surveyed measurements.
- Tour pauses on manual input; no invented live counter or unlicensed audio.
- Keep local unless publication is requested.

## Task 1 — Model foundation and viewer state

Files: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/state/viewer.ts`, `src/state/viewer.test.ts`, `src/scene/model/geometry.ts`, `src/scene/model/geometry.test.ts`.

Interfaces: `viewerReducer(state, action)` handles chapter, manual input, tour, reset, display, and locale changes. `perimeterPoint(t, width, length, radius)` returns position and outward normal for continuous rounded rectangles. `makeRing(...)` generates a mesh surface between matching loops.

- [x] Set up Vite/React/TypeScript dependencies and build/test commands.
- [x] Add tests that manual input pauses tour, reset preserves display state, rounded perimeter points close continuously, and mesh coordinates remain finite.
- [x] Run tests before implementation, implement primitives, and rerun.

## Task 2 — Stadium and park

Files: `src/scene/model/{stadium,seating,roof,facade,pitch,park}.ts`, `src/config/stadium.ts`.

Interface: `buildStadium(): { root: Group; roof: Group; anchors: ... }`; each construction module adds named geometry to the root with shared materials and instancing. Park remains separate from stadium export.

- [x] Build terraces, red/white seat instances, access openings, pitch markings/goals.
- [x] Build gold louvered outer envelope, dark entrance glazing, white roof/trusses.
- [x] Add deterministic park landscaping and paths with a strong stadium silhouette.
- [x] Render all five views and compare to official aerial/rendering before polishing.

## Task 3 — Scene, cameras, and interface

Files: `src/scene/StadiumScene.tsx`, `src/scene/CameraDirector.tsx`, `src/config/cameras.ts`, `src/App.tsx`, `src/content.ts`, `src/styles.css`, `src/ui/{Icon,Dialog,Toolbar}.tsx`.

Interfaces: scene exposes `capture(): Promise<Blob>` and `exportModel(): Promise<ArrayBuffer>` through an imperative ref. Camera director consumes chapter/request ID and calls settled/manual callbacks. All text derives from the selected locale.

- [x] Implement one camera owner, aspect-aware presets, bounded orbit, zoom, tour timer, and interruption.
- [x] Build editorial identity/toolbar/story/navigation and anchored scene labels.
- [x] Add lighting, accessible dialogs, capture preview, complete GLB export and fullscreen handling.
- [x] Add phone, tablet, short-landscape, reduced-motion and WebGL fallback behavior.

## Task 4 — Verification and handoff

Files: `README.md`, `docs/model-assumptions.md`, `docs/implementation-verification.md`, screenshots under `docs/implementation-evidence/`.

- [x] Run `bun test` and `bun run build`.
- [x] Browser-test chapter/tour/toggle/localization/dialog/resize interactions and inspect console errors.
- [x] Save/inspect PNG and export/re-import GLB; verify complete roof despite cutaway.
- [x] Check desktop, phone, tablet, landscape and failure/reduced-motion paths.
- [x] Record actual results and limitations; leave local preview available.

## Completion notes

Implemented and validated locally on 6 September 2026. Named model groups and scene API were refined during implementation; icon components use lucide-react directly. Desktop/mobile/landscape, PNG download, independent GLB re-import, simulated reduced motion and WebGL fallback were checked. Physical-device, context-loss and other test limits are documented in `docs/implementation-verification.md`.
