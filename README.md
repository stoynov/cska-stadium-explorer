# CSKA Stadium Explorer

An interactive architectural interpretation of CSKA Sofia’s Bulgarian Army Stadium, built with **React, TypeScript, and Three.js**. Explore the stadium, move through five camera chapters, and export the procedural model straight from the browser.

I created this project to practise **AI-assisted software engineering**: interpreting visual references, directing specialist agents, reviewing their output, and turning mistakes into repeatable checks. Read the [AI engineering case study](docs/ai-engineering-case-study.md) for the methods, concrete failures, corrections, and evidence.

**[Live demo](https://cska-stadium-explorer.vercel.app)** · **[Portfolio · Stanislav Stoynov](https://stoynov.dev)** · **[Source](https://github.com/stoynov/cska-stadium-explorer)**

![CSKA Stadium Explorer: procedural stadium and the landscape of Sofia](public/social-preview.jpg)

## Try it

Drag to orbit and scroll or pinch to zoom. Start the guided journey, open the roof cutaway, switch between daylight and evening, or explore the stands, pitch, façade, and surrounding park. The interface is available in English and Bulgarian.

Use **Capture** to save your current view as a PNG, **Download 3D model** to export the complete stadium as GLB, and **About the project** for the development story and sources.

## Engineering highlights

- **Procedural geometry.** The stadium is constructed in TypeScript: individual façade louvers, roof trusses, seating terraces, stairways, seat lettering, pitch, and park paths. It does not load a prebuilt stadium model.
- **Rendering efficiency.** Repeated seats, trees, and visitors use instancing. Static surfaces are merged by material. Touch and narrow devices receive lower tree density, shadow resolution, and pixel-ratio limits.
- **Camera choreography.** Five aspect-aware presets share a single camera controller. User input interrupts transitions; tours stop when the tab is hidden, a dialog opens, or reduced motion is enabled.
- **Geographic context.** Vitosha uses a sampled elevation grid. A bounded Sofia city model adds 18,000 mapped building footprints, courtyard holes and major roads, with terrain placement and a reduced mobile profile. Building heights retain their tagged, levels-derived or estimated provenance. Sofia’s television tower is interpreted separately.
- **Client-side exports.** PNG captures omit the interface. GLB export restores the complete roof, includes the stadium only, and validates the result through a Three.js re-import before download. Export modules load on demand.
- **Resilient interface.** Keyboard-accessible native dialogs, bilingual content, reduced-motion support, and an image fallback when WebGL is unavailable. Fonts and runtime assets are hosted locally.

## Run locally

Requires **Bun 1.3.12+** and **Node.js 22.12+**. Use a current browser with WebGL 2 support for the interactive model.

```sh
bun install --frozen-lockfile
bun run dev
```

Open the URL printed by Vite (normally `http://127.0.0.1:5173`). No environment variables, API keys, or backend services are needed.

```sh
bun run check      # Formatting, regression tests, TypeScript, production build
bun run preview    # Serve the production build locally
bun run format     # Format application code and project configuration
python3 -m unittest discover -s scripts  # Offline map-extractor checks (Python 3)
```

The regression suites cover viewer transitions, geometry, staircase and corner-entrance clearance, hospitality, façade layout, seat lettering, park connectivity, visitor placement, geographic transforms and city extraction. GitHub Actions runs both Bun and Python checks on pushes to `main` and pull requests.

## Architecture

| Location                       | Responsibility                                                     |
| ------------------------------ | ------------------------------------------------------------------ |
| `src/App.tsx`                  | Viewer lifecycle, dialogs, language, and exports                   |
| `src/state/`                   | Pure viewer reducer and state regression tests                     |
| `src/config/`                  | Approximate dimensions, camera presets, asset and project metadata |
| `src/scene/StadiumScene.tsx`   | Renderer, scene lifecycle, lighting, and quality profile           |
| `src/scene/CameraDirector.tsx` | Camera transitions and orbit controls                              |
| `src/scene/model/`             | Procedural stadium, park, visitors, and landscape                  |
| `src/scene/data/`              | Bundled elevation and OpenStreetMap data                           |
| `src/services/export.ts`       | PNG downloads and lazy GLB export/validation                       |
| `src/ui/`                      | Toolbar, accessible dialog, and sourced stadium guide              |
| `src/content*.ts`              | English and Bulgarian copy                                         |
| `scripts/`                     | Offline geographic data preparation                                |

## Deployment and releases

The live site is deployed in the **stoynov-proj** Vercel workspace, connected to this repository. Push to `main` to publish a production update; pull requests receive checks and Vercel previews.

Vercel Web Analytics is mounted once at the React entry point using `@vercel/analytics/react`, with explicit Vite development/production modes. Enable Web Analytics in the project's Vercel dashboard and deploy after enabling it, as described in the [Vercel setup guide](https://vercel.com/docs/analytics/quickstart). Local development uses the SDK's debug mode.

1. **CI** (`.github/workflows/ci.yml`) installs the frozen Bun lockfile, checks formatting, runs regression tests, validates TypeScript, and builds the site. Production builds are archived as workflow artifacts for 14 days.
2. **Vercel** automatically builds the same commit through its Git integration. `vercel.json` runs `bun run test && bun run build` before publishing `dist/`, so failed tests, TypeScript checks, or builds prevent deployment. Formatting is checked in GitHub CI against the committed files, because Vercel rewrites its build configuration. GitHub CI and Vercel validate independently.
3. **Verify deployment and release** (`.github/workflows/release.yml`) runs only after production CI succeeds. It waits up to 10 minutes for Vercel to report success for that exact commit, then creates a tag and publishes a [GitHub release](https://github.com/stoynov/cska-stadium-explorer/releases).

Tags use `build-<CI run number>` (for example, `build-3`). These identify production builds, independently of the package version. Each release includes generated change notes, the commit and deployment links, `cska-stadium-explorer.tar.gz`, `build-info.txt`, and `SHA256SUMS`. The archive is the verified **CI build**; Vercel builds its own copy from the same source commit.

Re-running a workflow keeps its existing tag and release. Published releases are not overwritten, and tags are never moved. A new manual run of **CI → Run workflow → main** creates a new build release. If Vercel fails or the deployment wait times out, fix/redeploy that commit and re-run the failed jobs. Pull requests, unsuccessful builds, and skipped deployments do not receive production releases. Outdated PR checks are cancelled; production runs are retained.

No API keys or extra repository secrets are required. The existing Vercel GitHub App handles deployment; the release job uses GitHub's temporary `GITHUB_TOKEN` with narrowly scoped permissions. Actions are pinned to commit SHAs. Deployment coordination uses [Vercel’s official wait action](https://github.com/vercel/wait-for-deployment-action).

For a rollback, use Vercel’s project dashboard to promote a previous successful production deployment, then revert the faulty source commit in GitHub so subsequent pushes preserve the fix. Previous builds remain downloadable from Releases.

## Design process and limitations

This is an **independent portfolio project**, not an official CSKA website or surveyed architectural model. Stadium geometry, planting, and missing building heights are approximations. The procedural seat count does not establish official capacity. The visitor guide records its source-verification date and does not provide live opening, ticketing, or attendance information.

The project was developed with AI assistance. The [reference audit](docs/reference-audit.md) and [reconstruction specification](docs/reference-reconstruction-spec.md) document the process. The experience at [gpt-6-stadium.vercel.app](https://gpt-6-stadium.vercel.app/) informed interaction and composition; its downloaded model is excluded from this repository and is not used at runtime.

The 3D scene is GPU intensive, so performance varies by device. GLB consumers need support for `EXT_mesh_gpu_instancing`. There is no server rendering or offline service worker.

Further reading: [model assumptions](docs/model-assumptions.md), [goals and Sector A research and validation](docs/goals-sector-a-research.md), [façade study](docs/facade-photo-analysis.md), [staircase study](docs/staircase-photo-analysis.md), [landscape reconstruction](docs/landscape-reconstruction.md), and [stadium fact sources](docs/stadium-facts-research.md). Historical verification notes describe their respective development snapshots; model exports can be regenerated in the app.

## Credits and asset rights

Official stadium photographs, renderings, and the crest come from [stadium.cska.bg / CSKA](https://stadium.cska.bg/). Their provenance is recorded in the [asset manifest](public/assets/cska/manifest.json). Rights remain with the respective owners; this repository does not grant a reuse license for club imagery or branding.

Geographic data: © OpenStreetMap contributors (ODbL) and Mapzen Terrain Tiles. See [third-party notices](THIRD_PARTY_NOTICES.md) for source details and bundled font licenses.
