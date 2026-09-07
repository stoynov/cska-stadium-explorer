"""Build the offline, attributed Sofia extract; no third-party Python dependencies.

Download once:
  curl -L --fail --get https://overpass-api.de/api/interpreter \
    --data-urlencode data@scripts/sofia-city.overpassql -o /tmp/sofia-city-overpass.json
Then:
  python3 scripts/prepare-sofia-city.py /tmp/sofia-city-overpass.json

Coordinates are decimetres in the stadium frame. Ring coordinates are relative
to each building anchor, unclosed, and retain courtyards. Very small structures
are omitted with increasing distance, never replaced by invented footprints.
"""
import collections
import hashlib
import json
import math
from pathlib import Path
import re
import sys

ORIGIN = (42.684306, 23.339806)
AXIS = math.radians(41.31335)
BOUNDS = [23.294, 42.650, 23.386, 42.716]


def project(point):
    north = (point['lat'] - ORIGIN[0]) * 111132
    east = (point['lon'] - ORIGIN[1]) * 111320 * math.cos(math.radians(ORIGIN[0]))
    return [round((-math.sin(AXIS) * east + math.cos(AXIS) * north) * 10),
            round((math.cos(AXIS) * east + math.sin(AXIS) * north) * 10)]


def metres(value):
    match = re.fullmatch(r"(\d+(?:\.\d+)?)\s*(m|ft)?", value.strip())
    if match:
        return float(match[1]) * (0.3048 if match[2] == 'ft' else 1)
    match = re.fullmatch(r"(\d+)'(\d+(?:\.\d+)?)\"?", value.strip())
    return (float(match[1]) * 12 + float(match[2])) * 0.0254 if match else None


def building_height(tags):
    height = metres(tags.get('height', ''))
    if height is not None and 1 <= height <= 250:
        return round(height, 1), 0
    try:
        levels = float(tags.get('building:levels', ''))
        if 0 < levels <= 60:
            return round(levels * 3.1 + 1.5, 1), 1
    except ValueError:
        pass
    kind = tags.get('building', 'yes')
    fallback = (3.5 if kind in ('garage', 'garages', 'shed', 'roof') else
                7 if kind in ('house', 'detached', 'semidetached_house', 'bungalow') else
                17 if kind in ('apartments', 'residential', 'hotel') else
                20 if kind in ('office', 'commercial') else 11)
    return fallback, 2


def join_rings(segments):
    segments = [s[:] for s in segments]
    output = []
    while segments:
        ring = segments.pop(0)
        while ring[-1] != ring[0]:
            for i, segment in enumerate(segments):
                if ring[-1] == segment[0]:
                    ring += segment[1:]
                    segments.pop(i)
                    break
                if ring[-1] == segment[-1]:
                    ring += segment[-2::-1]
                    segments.pop(i)
                    break
            else:
                raise ValueError('Incomplete building ring; refusing to invent geometry')
        output.append(ring)
    return output


def inside(point, ring):
    x, z = point
    result = False
    for a, b in zip(ring, ring[1:] + ring[:1]):
        if (a[1] > z) != (b[1] > z) and x < (b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]:
            result = not result
    return result


def clean_ring(ring):
    result = []
    for p in ring:
        if not result or p != result[-1]:
            result.append(p)
    if result and result[0] == result[-1]:
        result.pop()
    # Remove only near-collinear vertices; retain footprint corners and holes.
    changed = True
    while changed and len(result) > 3:
        changed = False
        for i, b in enumerate(result):
            a, c = result[i-1], result[(i+1) % len(result)]
            length = math.dist(a, c)
            if length and abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])) / length < 2:
                result.pop(i)
                changed = True
                break
    return result


def area(ring):
    return abs(sum(a[0]*b[1]-b[0]*a[1] for a, b in zip(ring, ring[1:]+ring[:1]))) / 200


def select_buildings(buildings, budget=18000):
    def priority(building):
        distance = math.hypot(building[4], building[5]) / 10
        if distance < 1800:
            return 1e9 - distance
        ring = building[6][0]
        footprint = area([ring[i:i+2] for i in range(0, len(ring), 2)])
        return footprint * building[1] / (distance / 1800)**1.5
    selected = sorted(buildings, key=lambda b: (-priority(b), b[0]))[:budget]
    return sorted(selected, key=lambda b: (math.hypot(b[4], b[5]), b[0]))


def prepare(raw):
    buildings, roads = [], []
    excluded = collections.Counter()
    members = {m['ref'] for e in raw['elements'] if e['type'] == 'relation'
               for m in e['members'] if m['type'] == 'way'}
    tower = project({'lat': 42.676756, 'lon': 23.341764})
    for element in raw['elements']:
        tags = element.get('tags', {})
        if 'highway' in tags:
            if tags.get('tunnel') == 'yes' or tags.get('area') == 'yes':
                continue
            points = [project(p) for p in element.get('geometry', [])]
            widths = {'motorway': 14, 'trunk': 13, 'primary': 11, 'secondary': 9, 'tertiary': 7}
            if len(points) >= 2:
                roads.append([element['id'], widths[tags['highway']], [v for p in points for v in p]])
            continue
        if 'building' not in tags or tags['building'] in ('no', 'construction', 'ruins') or tags.get('location') == 'underground':
            continue
        if element['type'] == 'way':
            if element['id'] in members:
                continue
            geometry = element.get('geometry', [])
            if len(geometry) < 4 or geometry[0] != geometry[-1]:
                excluded['incomplete'] += 1
                continue
            outers, holes = [[project(p) for p in geometry]], []
        else:
            try:
                outers = join_rings([[project(p) for p in m['geometry']] for m in element['members']
                                    if m['type'] == 'way' and m.get('role', '') in ('outer', '')])
                holes = join_rings([[project(p) for p in m['geometry']] for m in element['members']
                                   if m['type'] == 'way' and m.get('role') == 'inner'])
            except (KeyError, ValueError):
                excluded['incomplete'] += 1
                continue
        for outer in outers:
            outer = clean_ring(outer)
            if len(outer) < 3:
                continue
            x, z = [round(sum(p[i] for p in outer) / len(outer)) for i in range(2)]
            distance = math.hypot(x, z) / 10
            if distance < 520 or math.dist([x, z], tower) < 350 or distance > 4300:
                excluded['outsideContext'] += 1
                continue
            minimum_area = 22 if distance < 1800 else 70 if distance < 3000 else 130
            if area(outer) < minimum_area:
                excluded['smallFootprint'] += 1
                continue
            rings = [outer] + [clean_ring(h) for h in holes if inside(h[0], outer)]
            rings = [[v for p in ring for v in (p[0]-x, p[1]-z)] for ring in rings if len(ring) >= 3]
            height, source = building_height(tags)
            kind = tags['building']
            palette = (0 if kind in ('apartments', 'residential', 'hotel') else
                       1 if kind in ('house', 'detached', 'semidetached_house') else
                       2 if kind in ('office', 'commercial') else 3)
            osm_id = element['id'] * (-1 if element['type'] == 'relation' else 1)
            buildings.append([osm_id, height, source, palette, x, z, rings])
    buildings.sort(key=lambda b: (math.hypot(b[4], b[5]), b[0]))
    # A bounded amount of geometry and JSON even after future map growth.
    excluded['budget'] = max(0, len(buildings) - 18000)
    buildings = select_buildings(buildings)
    roads.sort(key=lambda r: r[0])
    data = dict(source='© OpenStreetMap contributors', license='ODbL 1.0',
                sourceUrl='https://www.openstreetmap.org/copyright',
                endpoint='https://overpass-api.de/api/interpreter',
                osmTimestamp=raw['osm3s']['timestamp_osm_base'], bounds=BOUNDS,
                coordinateSystem=dict(origin=list(ORIGIN), axisDegrees=41.31335, units='decimetres',
                                      rings='unclosed x,z offsets from building anchor'),
                buildingSchema=['osmId (negative=relation)', 'heightMetres', 'heightSource', 'palette', 'x', 'z', 'rings'],
                heightSources=['OSM height tag', 'OSM levels × 3.1 m + 1.5 m roof allowance', 'building-type estimate'],
                fallbackHeights=dict(garage=3.5, house=7, apartments=17, office=20, other=11),
                roadSchema=['osmWayId', 'estimatedWidthMetres', 'absolute x,z coordinate pairs'],
                processing=dict(radiusMetres=4300, exclusionRadiusMetres=520, coordinatePrecisionMetres=0.1,
                                collinearToleranceMetres=0.2, omitted=dict(excluded),
                                budgetSelection='nearby buildings then footprint area × height / distance^1.5',
                                minimumAreaByDistance='22 m² < 1.8 km; 70 m² < 3 km; 130 m² beyond'),
                buildings=buildings, roads=roads)
    return data


if __name__ == '__main__':
    source = Path(sys.argv[1]).read_bytes()
    data = prepare(json.loads(source))
    data['rawResponseSha256'] = hashlib.sha256(source).hexdigest()
    result = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
    for path in ('src/scene/data/sofia-city.json', 'public/assets/geodata/sofia-city.json'):
        Path(path).write_text(result)
    print(json.dumps(dict(bytes=len(result.encode()), buildings=len(data['buildings']), roads=len(data['roads']),
                          heightSources=dict(collections.Counter(b[2] for b in data['buildings'])),
                          courtyards=sum(len(b[6])-1 for b in data['buildings']), omitted=data['processing']['omitted']), indent=2))
