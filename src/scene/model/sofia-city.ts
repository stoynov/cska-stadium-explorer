import * as THREE from 'three'
import data from '../data/sofia-city.json'
import { terrainHeight } from './geographic'

/** Coordinates and ring offsets are decimetres in the stadium's rotated frame. */
export type CityBuilding = [
  osmId: number,
  height: number,
  heightSource: number,
  palette: number,
  x: number,
  z: number,
  rings: number[][],
]
type GroundHeight = (x: number, z: number) => number
type Batch = { positions: number[]; colors: number[]; indices: number[] }
const tileSize = 1000
const facades = ['#d1c7b4', '#d4c3ad', '#aab6b9', '#c5c3b7']
const roofs = ['#969d99', '#a87b66', '#7f959b', '#929c98']
const makeBatch = (): Batch => ({ positions: [], colors: [], indices: [] })

function footprintArea(building: CityBuilding) {
  const ring = building[6][0]
  let area = 0
  for (let i = 0; i < ring.length; i += 2) {
    const next = (i + 2) % ring.length
    area += ring[i] * ring[next + 1] - ring[next] * ring[i + 1]
  }
  return Math.abs(area) / 200
}

export function selectCityBuildings(
  buildings: CityBuilding[],
  compact = false,
) {
  if (!compact) return buildings
  // Keep the immediate neighbourhood and skyline; omit small distant structures.
  return buildings
    .filter((b) => {
      const distance = Math.hypot(b[4], b[5]) / 10
      return distance < 1600 || b[1] >= 30 || footprintArea(b) >= 240
    })
    .sort((a, b) => {
      const priority = (v: CityBuilding) =>
        Math.hypot(v[4], v[5]) < 16000
          ? 1e9 - Math.hypot(v[4], v[5])
          : footprintArea(v) * v[1]
      return priority(b) - priority(a) || a[0] - b[0]
    })
    .slice(0, 10000)
}

function vertex(
  batch: Batch,
  x: number,
  y: number,
  z: number,
  color: THREE.Color,
) {
  const index = batch.positions.length / 3
  batch.positions.push(x, y, z)
  batch.colors.push(color.r, color.g, color.b)
  return index
}

function addBuilding(
  batch: Batch,
  building: CityBuilding,
  ground: GroundHeight,
) {
  const [id, height, , palette, anchorX, anchorZ, encoded] = building
  const rings = encoded.map((ring) => {
    const points: THREE.Vector2[] = []
    for (let i = 0; i < ring.length; i += 2)
      points.push(
        new THREE.Vector2(
          (anchorX + ring[i]) / 10,
          (anchorZ + ring[i + 1]) / 10,
        ),
      )
    return points
  })
  // Independent roof/wall vertices keep edges crisp; no invisible bottom caps.
  const all = rings.flat()
  const roofY = Math.max(...all.map((p) => ground(p.x, p.y))) + height
  const variation = 0.92 + ((Math.abs(id) % 29) / 28) * 0.16
  const wallColor = new THREE.Color(facades[palette]).multiplyScalar(variation)
  const roofColor = new THREE.Color(roofs[palette]).multiplyScalar(variation)
  const offset = batch.positions.length / 3
  for (const p of all) vertex(batch, p.x, roofY, p.y, roofColor)
  for (const triangle of THREE.ShapeUtils.triangulateShape(
    rings[0],
    rings.slice(1),
  )) {
    const [a, b, c] = triangle
    const cross =
      (all[b].x - all[a].x) * (all[c].y - all[a].y) -
      (all[b].y - all[a].y) * (all[c].x - all[a].x)
    // The X/Z plane reverses the usual 2D winding for an upward normal.
    batch.indices.push(
      offset + a,
      offset + (cross > 0 ? c : b),
      offset + (cross > 0 ? b : c),
    )
  }
  for (const ring of rings)
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i],
        b = ring[(i + 1) % ring.length]
      const start = vertex(batch, a.x, ground(a.x, a.y) - 0.3, a.y, wallColor)
      vertex(batch, b.x, ground(b.x, b.y) - 0.3, b.y, wallColor)
      vertex(batch, b.x, roofY, b.y, wallColor)
      vertex(batch, a.x, roofY, a.y, wallColor)
      batch.indices.push(
        start,
        start + 2,
        start + 1,
        start,
        start + 3,
        start + 2,
      )
    }
}

function geometryFor(batch: Batch) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(batch.positions, 3),
  )
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(batch.colors, 3),
  )
  geometry.setIndex(batch.indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  geometry.computeBoundingBox()
  return geometry
}

/** Exposed for geometric verification of holes, heights and terrain foundations. */
export function cityBuildingGeometry(
  building: CityBuilding,
  ground = terrainHeight,
) {
  const batch = makeBatch()
  addBuilding(batch, building, ground)
  return geometryFor(batch)
}

export function buildSofiaCity(options: { compact?: boolean } = {}) {
  const city = new THREE.Group()
  city.name = 'Sofia — mapped city buildings and boulevards'
  const buildings = selectCityBuildings(
    data.buildings as CityBuilding[],
    options.compact,
  )
  const batches = new Map<string, Batch>()
  const getBatch = (x: number, z: number, kind: string) => {
    const key = `${kind}:${Math.floor(x / tileSize)}:${Math.floor(z / tileSize)}`
    let batch = batches.get(key)
    if (!batch) {
      batch = makeBatch()
      batches.set(key, batch)
    }
    return batch
  }
  for (const building of buildings)
    addBuilding(
      getBatch(building[4] / 10, building[5] / 10, 'buildings'),
      building,
      terrainHeight,
    )

  const roadColor = new THREE.Color('#89928c')
  for (const [, width, encoded] of data.roads as [number, number, number[]][]) {
    for (let i = 0; i < encoded.length - 2; i += 2) {
      const x1 = encoded[i] / 10,
        z1 = encoded[i + 1] / 10
      const x2 = encoded[i + 2] / 10,
        z2 = encoded[i + 3] / 10
      const length = Math.hypot(x2 - x1, z2 - z1)
      if (length < 0.1) continue
      const nx = ((-(z2 - z1) / length) * width) / 2,
        nz = (((x2 - x1) / length) * width) / 2
      // Short terrain-following ribbon sections avoid bridges across hills.
      const steps = Math.ceil(length / 10)
      for (let step = 0; step < steps; step++) {
        const ax = THREE.MathUtils.lerp(x1, x2, step / steps),
          az = THREE.MathUtils.lerp(z1, z2, step / steps)
        const bx = THREE.MathUtils.lerp(x1, x2, (step + 1) / steps),
          bz = THREE.MathUtils.lerp(z1, z2, (step + 1) / steps)
        const x = (ax + bx) / 2,
          z = (az + bz) / 2,
          distance = Math.hypot(x, z)
        if (distance < 520 || distance > 4300) continue
        const batch = getBatch(x, z, 'roads'),
          start = batch.positions.length / 3
        for (const [px, pz] of [
          [ax + nx, az + nz],
          [ax - nx, az - nz],
          [bx - nx, bz - nz],
          [bx + nx, bz + nz],
        ])
          vertex(batch, px, terrainHeight(px, pz) + 0.5, pz, roadColor)
        batch.indices.push(
          start,
          start + 2,
          start + 1,
          start,
          start + 3,
          start + 2,
        )
      }
    }
  }
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.94,
    side: THREE.DoubleSide,
  })
  for (const [key, batch] of batches) {
    const mesh = new THREE.Mesh(geometryFor(batch), material)
    mesh.name = `Sofia ${key}`
    mesh.castShadow = false
    mesh.receiveShadow = false
    city.add(mesh)
  }
  city.userData = {
    source: data.sourceUrl,
    license: data.license,
    buildingCount: buildings.length,
    roadCount: data.roads.length,
    compact: options.compact ?? false,
    extentMetres: data.processing.radiusMetres,
    heightSources: data.heightSources,
  }
  return city
}
