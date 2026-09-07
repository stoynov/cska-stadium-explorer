# Geographic context

Terrain Tiles was accessed on 2026-09-06 from https://registry.opendata.aws/terrain-tiles/.
Tile: https://s3.amazonaws.com/elevation-tiles-prod/skadi/N42/N42E023.hgt.gz
Source attribution: TERRAIN-ATTRIBUTION.md. The extracted Vitosha grid is reproduced by scripts/prepare-vitosha.py. Heights are not exaggerated. The local stadium ground is blended into the coarse terrain.

OpenStreetMap data © OpenStreetMap contributors, available under the Open Database License (ODbL) 1.0: https://www.openstreetmap.org/copyright and https://opendatacommons.org/licenses/odbl/1-0/.
Adapted extract: sofia-context.json. Building heights without source heights use levels × 3.1 m or an approximate 9.3 m default. Tree crowns are illustrative planting inside mapped woodland outlines, not individually surveyed trees.
Request: https://api.openstreetmap.org/api/0.6/map?bbox=23.329,42.668,23.35,42.68
Stadium orientation: https://www.openstreetmap.org/way/1331127486

Tower shape was modelled from the user's photograph; no photographic texture was copied. Height and history: https://www.visitsofia.bg/en/cityinfrastructure/what-to-see/architectural-monuments/the-building-of-the-tv-tower
Coordinates: https://bg.wikipedia.org/wiki/Телевизионна_кула_София

Complete forest relations (outer rings and inner clearings) supplement the bounding-box response:
- https://api.openstreetmap.org/api/0.6/relation/13886234/full
- https://api.openstreetmap.org/api/0.6/relation/13871756/full

Pass those downloaded files after the map response to `scripts/prepare-sofia-context.py`. The resulting extract contains 644 building outlines and 45 woodland polygons. Missing open relation rings cause extraction to fail rather than inventing a closure. Holes remain free of generated trees.

## Wider city revision — 7 September 2026

`sofia-city.json` replaces the legacy narrow building strip in the renderer; woodland still uses `sofia-context.json`. The wider snapshot includes 18,000 selected buildings, 141 courtyard holes and 2,759 major-road ways within a maximum 4.3 km radius. A 520 m inner exclusion preserves the detailed stadium and park. This is a bounded, simplified context model rather than complete municipal coverage.

The dataset records its OpenStreetMap snapshot time, source-response SHA-256, query bounds, omitted-feature counts, coordinate schema and per-building height source. There are 36 explicit height tags, 6,516 heights derived from floor counts and 11,448 type estimates. Coordinates are quantized to 0.1 m in the stadium frame; this storage precision does not imply equivalent survey accuracy. Road widths are estimated and grade-separated junctions are simplified.

Reproduce the extraction using the download and preparation commands at the top of `scripts/prepare-sofia-city.py`, with `scripts/sofia-city.overpassql`. Run `python3 -m unittest discover -s scripts` for parser/height/ring checks. Re-querying a live map service can produce a different snapshot.

The elevation grid now extends north to 42.730333° using the same N42E023 source. Its original mountain samples and spacing are preserved. New roads and buildings sample the actual triangulated terrain surface. Both this adapted city extract and its attribution are served publicly with the site.
