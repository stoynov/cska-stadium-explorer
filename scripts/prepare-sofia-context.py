"""Extract buildings and complete woodland polygons from OSM API responses.
Usage: python3 scripts/prepare-sofia-context.py map.osm [relation-full.osm ...]
"""
import xml.etree.ElementTree as E
import json, math, sys
from pathlib import Path

items = {}
for filename in sys.argv[1:]:
    for element in E.parse(filename).getroot():
        items[element.tag, element.attrib.get('id')] = element
nodes = {key[1]: [float(e.attrib['lat']), float(e.attrib['lon'])]
         for key, e in items.items() if key[0] == 'node'}
ways = {key[1]: e for key, e in items.items() if key[0] == 'way'}
def tags(e):
    return {t.attrib['k']: t.attrib['v'] for t in e.findall('tag')}
def refs(e):
    return [n.attrib['ref'] for n in e.findall('nd')]
def is_wood(t):
    return t.get('natural') == 'wood' or t.get('landuse') == 'forest'
def points(ring):
    return [nodes[n] for n in ring]
def rings(segments):
    result = []
    while segments:
        ring = segments.pop()[:]
        while ring[0] != ring[-1]:
            for i, segment in enumerate(segments):
                if ring[-1] == segment[0]:
                    ring += segment[1:]; segments.pop(i); break
                if ring[-1] == segment[-1]:
                    ring += segment[-2::-1]; segments.pop(i); break
            else:
                raise ValueError('Incomplete woodland ring; download the full relation')
        result.append(points(ring))
    return result
features = []
for way in ways.values():
    t, r = tags(way), refs(way)
    if not r or r[0] != r[-1]: continue
    kind = 'building' if 'building' in t else 'wood' if is_wood(t) else None
    if not kind: continue
    p = points(r)
    lat, lon = (sum(v[i] for v in p) / len(p) for i in range(2))
    if kind == 'building':
        if math.hypot((lat-42.684306)*111132, (lon-23.339806)*81800) < 650: continue
        if math.hypot((lat-42.676756)*111132, (lon-23.341764)*81800) < 35: continue
    try: height = float(t.get('height', str(float(t.get('building:levels', '3'))*3.1)).replace(' m', ''))
    except ValueError: height = 9.3
    features.append(dict(kind=kind, points=p, holes=[], height=height, estimatedHeight='height' not in t))
for (kind, _), relation in items.items():
    if kind != 'relation' or not is_wood(tags(relation)): continue
    members = relation.findall('member')
    outer = rings([refs(ways[m.attrib['ref']]) for m in members if m.attrib['role'] == 'outer'])
    inner = rings([refs(ways[m.attrib['ref']]) for m in members if m.attrib['role'] == 'inner'])
    for polygon in outer:
        features.append(dict(kind='wood', points=polygon, holes=inner, height=0, estimatedHeight=False))
data = dict(source='© OpenStreetMap contributors', license='ODbL 1.0', sourceUrl='https://www.openstreetmap.org/copyright', bounds=[23.329,42.668,23.35,42.68], features=features)
for output in ['src/scene/data/sofia-context.json', 'public/assets/geodata/sofia-context.json']:
    Path(output).write_text(json.dumps(data, separators=(',', ':')))
print({k: sum(f['kind'] == k for f in features) for k in ['building', 'wood']})
