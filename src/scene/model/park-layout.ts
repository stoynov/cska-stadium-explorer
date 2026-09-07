import * as THREE from 'three'
import { perimeterPoint, seededRandom } from './geometry'

export type ParkPoint = { x: number; z: number }
export type ParkPath = {
  name: string
  width: number
  pale?: boolean
  points: ParkPoint[]
}
// Local +X is the main entrance. Photo reconstruction, not surveyed coordinates.
function route(
  name: string,
  width: number,
  points: number[][],
  pale = false,
): ParkPath {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    'centripetal',
  )
  return {
    name,
    width,
    pale,
    points: curve
      .getSpacedPoints(Math.ceil(curve.getLength() / 2))
      .map((p) => ({ x: p.x, z: p.z })),
  }
}
export const parkPaths: ParkPath[] = [
  {
    name: 'Perimeter promenade',
    width: 8,
    pale: true,
    points: Array.from({ length: 257 }, (_, i) =>
      perimeterPoint(i / 256, 78, 99, 34),
    ),
  },
  route(
    'Main entrance approach',
    13,
    [
      [78, 0],
      [126, 0],
      [183, -2],
      [270, -8],
      [430, -14],
    ],
    true,
  ),
  route(
    'Facade garden walk',
    5.5,
    [
      [55, 98],
      [91, 82],
      [99, 42],
      [99, -35],
      [88, -79],
      [55, -98],
    ],
    true,
  ),
  route(
    'Main park avenue',
    8,
    [
      [55, 98],
      [85, 150],
      [90, 250],
      [142, 162],
      [158, 88],
      [160, 0],
      [156, -95],
      [123, -179],
      [70, -150],
      [55, -98],
    ],
    true,
  ),
  route(
    'North garden crosswalk',
    5,
    [
      [98, 55],
      [127, 58],
      [160, 65],
      [210, 88],
      [263, 108],
    ],
    true,
  ),
  route(
    'South garden crosswalk',
    5,
    [
      [99, -46],
      [128, -50],
      [158, -64],
      [207, -91],
      [260, -121],
    ],
    true,
  ),
  route(
    'Outer curved walk',
    5,
    [
      [90, 250],
      [190, 223],
      [259, 150],
      [276, 55],
      [270, -8],
      [278, -95],
      [260, -121],
      [237, -173],
      [123, -179],
    ],
    true,
  ),
  route(
    'Garden diagonal',
    5,
    [
      [142, 162],
      [200, 145],
      [263, 108],
    ],
    true,
  ),
  route(
    'Garden return',
    4.5,
    [
      [160, 65],
      [205, 31],
      [270, -8],
    ],
    true,
  ),
  route(
    'Southern lawn link',
    4.5,
    [
      [158, -64],
      [210, -37],
      [270, -8],
    ],
    true,
  ),
  route('Woodland west walk', 5, [
    [-32, 98],
    [-104, 138],
    [-151, 89],
    [-157, -15],
    [-139, -99],
    [-34, -99],
  ]),
]
export function distanceToPath(p: ParkPoint, path: ParkPath) {
  let nearest = Infinity
  for (let i = 1; i < path.points.length; i++) {
    const a = path.points[i - 1],
      b = path.points[i],
      dx = b.x - a.x,
      dz = b.z - a.z
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz || 1),
      ),
    )
    nearest = Math.min(
      nearest,
      Math.hypot(p.x - a.x - t * dx, p.z - a.z - t * dz),
    )
  }
  return nearest
}
export function onParkPath(p: ParkPoint, clearance = 0) {
  return parkPaths.some(
    (path) => distanceToPath(p, path) < path.width / 2 + clearance,
  )
}
export function inForecourt(p: ParkPoint, margin = 0) {
  return p.x > 72 - margin && p.x < 113 + margin && Math.abs(p.z) < 49 + margin
}
export function inStadiumGrounds(p: ParkPoint, margin = 0) {
  return (
    Math.hypot(
      Math.max(Math.abs(p.x) - 44, 0),
      Math.max(Math.abs(p.z) - 65, 0),
    ) <
    40 + margin
  )
}
export function parkTrees(compact = false) {
  const random = seededRandom(194819),
    trees: (ParkPoint & {
      h: number
      w: number
      angle: number
      shade: number
      young: boolean
    })[] = []
  // Mature trees frame the entrance gardens; open lawn interiors stay sparse.
  for (const x of [121, 133, 190])
    for (const z of [-84, -31, 30, 86]) {
      const p = { x, z }
      if (inForecourt(p, 5) || inStadiumGrounds(p, 2) || onParkPath(p, 2.5))
        continue
      trees.push({
        ...p,
        h: 13 + (Math.abs(z) % 4),
        w: 4.6,
        young: false,
        angle: z * 0.2,
        shade: 0.47,
      })
    }
  for (let i = 0; i < 9000; i++) {
    const span = i < 4200 ? 620 : 1150
    const p = { x: (random() - 0.5) * span, z: (random() - 0.5) * span }
    const selection = random(),
      variation = random(),
      rotation = random(),
      shade = random()
    if (compact && i % 3 === 0) continue
    if (inStadiumGrounds(p, 2) || inForecourt(p, 5) || onParkPath(p, 2.5))
      continue
    const garden = p.x > 91 && p.x < 315 && Math.abs(p.z) < 165
    // The entry gardens are open lawns; mature forest is behind and beside the bowl.
    if (garden && selection > 0.075) continue
    if (p.x > 315 && Math.abs(p.z) < 190 && selection > 0.45) continue
    const young = garden && selection < 0.12
    const h = young ? 4.5 + variation * 3.5 : 10 + variation * 12
    const w = young ? 1.6 + shade * 1.3 : 4 + shade * 4.5
    if (
      trees.some(
        (t) =>
          Math.abs(t.x - p.x) < w * 0.72 &&
          Math.hypot(t.x - p.x, t.z - p.z) < (w + t.w) * 0.58,
      )
    )
      continue
    trees.push({ ...p, h, w, young, angle: rotation * Math.PI * 2, shade })
  }
  return trees
}
