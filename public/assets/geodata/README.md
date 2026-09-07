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
