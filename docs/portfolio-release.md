# Portfolio release verification

Verified on 7 September 2026 using the production Vite build.

- `bun install --frozen-lockfile`: passed without dependency changes.
- `bun run check`: formatting, 23 tests (65,375 assertions), TypeScript, and production build passed.
- Chromium desktop at 1440 × 900 and touch emulation at 390 × 844: scene ready, no horizontal document overflow on mobile.
- About dialog: developer credits and outgoing links present; Escape closes it and restores focus to the opener.
- PNG capture: generated a decoded 390 × 844 image from the mobile scene.
- GLB export with cutaway enabled: completed its export and re-import validation, then initiated download successfully.
- Language switch and evening lighting: selected chapter and lighting state preserved when switching to Bulgarian.
- Desktop overview screenshot recorded in `public/social-preview.jpg` for README and share previews.
- No production JavaScript errors observed during these checks. React Three Fiber emits a Three.js Clock deprecation warning; the rendering integration still uses that upstream API.
- Repository secret-pattern scan found no matching credential or private-key signatures. Local environment files, deployment metadata, downloaded reference assets, and regenerable GLB exports are ignored.

These are browser smoke checks, not a claim of comprehensive device coverage, a security audit, or a measured performance benchmark. Historical verification documents apply to their original development snapshots.
