# CSKA stadium modelling assumptions

Prepared 6 September 2026; updated 7 September 2026. This is an interpretation of the intended completed Bulgarian Army Stadium, not a statement that the venue has opened.

## Evidence used

- [Official stadium website](https://stadium.cska.bg/) and the local source manifest.
- `22142-CAM-002-scaled.jpg`: completed architectural rendering; overall silhouette, horizontal envelope and park setting.
- `DJI_20260809160800_0092_D-2048x1152.jpg`: August 2026 construction aerial; red bowl, white ЦСКА lettering, roof opening, gold façade and entrance-side photovoltaic panels.
- Other August 2026 aerials, particularly `DJI_20260809161355_0104_D-845x684.jpg`: seating rows, aisles and access openings. Cropped source photographs are unsuitable for precise perspective measurements.
- `docs/reference-audit.md`, `docs/reference-reconstruction-spec.md`, and `docs/reference-assets.json`: experience behavior, controls and reconstruction guidance. Reference RAMS Park geometry is not reused.

## Architecture and scale

| Element | Implemented interpretation | Confidence / limitation |
| --- | --- | --- |
| Footprint | Rounded rectangle, approximately 146 × 187 m at the outer façade | Visual proportion estimate; no survey drawings |
| Pitch | 105 × 68 m, long axis along local Z; centre at local origin | Explicit standard-size modelling assumption, not a verified CSKA dimension |
| Coordinates | Local X across pitch, local Z along pitch, Y up; Sector A hospitality and entrance on +X, lettering on −X | Geographic context is rotated to the OSM-derived pitch axis; this is not surveyed alignment |
| Bowl | 31 procedural rows on the general stands; Sector A has a shorter lower tier and a dedicated hospitality block with lounge and skybox terraces; radial aisles and approximate recessed portals, separate stair flights and landings | Counts and profiles selected for visual coherence, not official seating documentation; see the [Sector A research](goals-sector-a-research.md) |
| Goals | Connected rear, side and top nets with open fronts; grounded frames with clear 7.32 × 2.44 m openings aligned with the painted goal lines | Opening and frame thickness follow IFAB Law 1; net depths, subdivision and supports are visualization assumptions |
| Seats | Instanced cushions/backs, primarily red, white mosaic ЦСКА on far long stand | Letter placement supported by aerial; exact typography, glyph proportions approximated; unsupported scattered white seats and end stripes removed in the staircase correction |
| Capacity | Not displayed | Generated chair count is a rendering implementation detail, not stadium capacity |
| Façade | Champagne/gold horizontal louvers, 54 modelled courses over a dark backing, curved corners and raised lower edges around entrances | Material tone and lower-edge rhythm follow photographs; exact construction spacing and entrance profile are not measured |
| Roof | Pale continuous canopy with large central opening; approximately 145.4 × 186 m outer extent, opening 87 × 125 m, roof around 21–22 m high | Primary proportions estimated from multiple images |
| Steel | 64 simplified radial truss stations, external upper line at about 26.2 m | Structural rhythm interpreted; not a load-bearing design or fabrication model |
| Solar panels | Limited to entrance-side canopy strip | Visible location supported by recent aerial; exact panel count/layout not verified |
| Signage | Official local crest and generated Bulgarian stadium-name texture | Small presentation placement interpreted, not signage construction drawings |
| Lighting | Warm daylight; reduced ambient illumination, central pitch fill and emissive fixtures for evening | Artistic lighting, not a photometric simulation |
| Park | Deterministically scattered trees, paths, promenade, plaza, benches and scale figures | Illustrative Borisova Gradina setting; paths and vegetation are not mapped or surveyed |
| Main-stand corner entries | Two open passages below connecting galleries at the ends of Sector A; terrace exits and an interpreted return stair connect to the upper concourse | Supported by the user's clearer main-stand photograph; 7 m widths, elevations and stair routes are estimates, not construction documentation |
| Sofia context | OSM building footprints, major roads and woodland around the stadium; 18,000 buildings on desktop, 10,000 in the compact profile | Bounded selection within 4.3 km; most heights are derived from levels or estimated by building type. Simplified roofs and road widths; see [city validation](corner-city-validation.md) |

## Differences between evidence sources

The older rendering depicts a finished, landscaped environment and a slightly different presentation of the envelope. Recent photographs show construction progress, exposed roof supports, seat lettering and installed panel strips. The model uses the recent photographs for those details and the older rendering for the completed setting. Construction equipment and unfinished works are omitted intentionally.

The bowl is compact and has no running track. It does not import the Istanbul reference’s tiers, towers, highway, Galatasaray colors, roof proportions or branding. Thin steel members, simplified entrances and repeated landscape geometry are deliberate real-time rendering approximations.

## Export and performance choices

- Stadium geometry, local embedded textures and named groups export in metres. The landscape stays outside the exported group.
- GLB export includes invisible roof geometry through `onlyVisible: false`; cutaway is a viewer state rather than a destructive model edit.
- Exported seat geometry uses `EXT_mesh_gpu_instancing`, retaining individual color variation without expanding every repeated mesh.
- Re-import is verified using Three.js GLTFLoader, including a separate visible rendering of the downloaded file. Compatibility with CAD/BIM tools is not established.
- Desktop pixel ratio is capped at 1.5. Narrow/touch-device profile caps it at 1.25, reduces tree candidates from 4,500 to 2,600 and uses 1024 rather than 3072 shadow maps. The profile is selected on scene creation and stays stable while resizing.
- Optional music, drone shows and live visitor counts are omitted. No appropriate audio asset or real presence service was supplied.

Colors, dimensions, copy, counts and landscaping in this implementation are not official brand or architectural specifications. The About dialog communicates the photographic and approximate nature of the model.

## Staircase revision

See [detailed photo analysis](staircase-photo-analysis.md). Straight stair axes now use fixed physical stations; corners use fixed radial angles. Treads subdivide the 0.535 m seating-row rise into three approximately 0.178 m steps. Walking width is approximately 1.55 m; portals approximately 3 m. These are modelling assumptions, not measurements or compliance claims. Concrete row meshes are actually cut around circulation spaces. Seat shells have an additional 0.28 m centre clearance beyond the circulation mask to prevent overlap with cheek walls and rails. Outdoor reflection lighting is generated locally from a procedural sky.

## Landscape refinement — 2026-09-06

The park now follows the visible entrance approach and curved lawn/path topology in the official completed render and August aerial photographs. See [park photo analysis](park-photo-analysis.md). Route dimensions and planting coordinates remain approximate. The +X entrance direction is a local modelling convention; the geographic context uses a separate OSM-derived transform. Procedural trees exclude circulation surfaces; polygon depth offsets keep close ground layers distinct from aerial viewpoints.

## Corner entries and city revision — 2026-09-07

See [research, implementation and validation](corner-city-validation.md). The adjacent bowl concrete and exterior glazing now have actual openings at both Sector A corners. The city uses an offline OSM extract, shared geographic coordinates and triangle-based terrain sampling. The local landscaped park remains an architectural interpretation; the wider footprints, road centrelines and woodland outlines are mapped context.
