# Third-party notices

## CSKA imagery and crest

Files under `public/assets/cska/` are official photographs, architectural renderings, and branding downloaded from https://stadium.cska.bg/. The adjacent `manifest.json` records original URLs and retrieval dates. Copyright and trademark rights remain with their respective owners. No reuse license was established by the source; no license for these assets is granted by this project.

The project is an independent architectural interpretation and is not affiliated with or endorsed by CSKA.

## OpenStreetMap

Building and woodland data in `src/scene/data/sofia-context.json` and `public/assets/geodata/sofia-context.json` are derived from © OpenStreetMap contributors, available under the Open Database License (ODbL) 1.0. Attribution and license information: https://www.openstreetmap.org/copyright.

The source data is distributed with this repository. `scripts/prepare-sofia-context.py` documents extraction and transformations.

## Terrain

`src/scene/data/vitosha-dem.json` is resampled from Mapzen Terrain Tiles. Europe terrain data was produced using Copernicus data and information funded by the European Union (EU-DEM layers); SRTM and GMTED2010 data are courtesy of the U.S. Geological Survey.

The full provider notice is retained in [TERRAIN-ATTRIBUTION.md](public/assets/geodata/TERRAIN-ATTRIBUTION.md). Source: https://registry.opendata.aws/terrain-tiles/.

## Fonts

Manrope and Cormorant Garamond are bundled locally via Fontsource under the SIL Open Font License. Their complete license notices are included in the deployed site:

- [Manrope](public/licenses/manrope.txt)
- [Cormorant Garamond](public/licenses/cormorant-garamond.txt)

## Dependencies and reference material

Application dependencies retain their respective package licenses, distributed by their packages. Versions are recorded in `bun.lock`.

https://gpt-6-stadium.vercel.app/ informed the interaction and composition research. Its downloaded assets and 3D model are not part of the published application or repository.
