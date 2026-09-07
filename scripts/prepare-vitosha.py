"""Resample Mapzen N42E023 HGT to a compact local DEM; no network at runtime.
Usage: python3 scripts/prepare-vitosha.py /tmp/N42E023.hgt.gz
"""
import gzip,struct,math,json,sys
from pathlib import Path
raw=gzip.open(sys.argv[1],'rb').read();n=math.isqrt(len(raw)//2)
def sample(lat,lon):
 y=(43-lat)*(n-1);x=(lon-23)*(n-1);ix=int(x);iy=int(y);fx=x-ix;fy=y-iy
 def at(i,j):return struct.unpack_from('>h',raw,(j*n+i)*2)[0]
 return (at(ix,iy)*(1-fx)+at(ix+1,iy)*fx)*(1-fy)+(at(ix,iy+1)*(1-fx)+at(ix+1,iy+1)*fx)*fy
# Include the whole Vitosha massif south of Sofia, with a little plain at its foot.
cols=181;rows=181;west=23.10;east=23.45;north=42.70;south=42.44
heights=[round(sample(north+(south-north)*r/(rows-1),west+(east-west)*c/(cols-1))) for r in range(rows) for c in range(cols)]
origin={'lat':42.684306,'lon':23.339806,'elevation':round(sample(42.684306,23.339806))}
output={'source':'Mapzen Terrain Tiles / N42E023','sourceUrl':'https://registry.opendata.aws/terrain-tiles/','bounds':{'west':west,'east':east,'north':north,'south':south},'cols':cols,'rows':rows,'origin':origin,'heights':heights}
Path('src/scene/data/vitosha-dem.json').write_text(json.dumps(output,separators=(',',':')))
print({'grid':n,'origin':origin,'range':[min(heights),max(heights)],'towerDEM':sample(42.676756,23.341764)})
