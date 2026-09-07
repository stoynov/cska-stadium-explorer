import { expect, test } from 'bun:test'
import * as THREE from 'three'
import data from '../data/sofia-city.json'
import {
  buildSofiaCity,
  cityBuildingGeometry,
  selectCityBuildings,
  type CityBuilding,
} from './sofia-city'
import { disposeGroup } from './geometry'

// A 20 × 20 m block with a genuine 10 × 10 m courtyard, on sloping ground.
const courtyard: CityBuilding = [
  1,
  12,
  0,
  0,
  10000,
  0,
  [
    [-100, -100, 100, -100, 100, 100, -100, 100],
    [-50, -50, -50, 50, 50, 50, 50, -50],
  ],
]

test('city roof triangulation leaves courtyards open and foundations meet sloping terrain', () => {
  const geometry = cityBuildingGeometry(courtyard, (x, z) => x / 10 + z / 20)
  const positions = geometry.getAttribute('position')
  const normals = geometry.getAttribute('normal')
  const index = geometry.index!
  let roofArea = 0
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3()
  for (let i = 0; i < index.count; i += 3) {
    a.fromBufferAttribute(positions, index.getX(i))
    b.fromBufferAttribute(positions, index.getX(i + 1))
    c.fromBufferAttribute(positions, index.getX(i + 2))
    if (normals.getY(index.getX(i)) < 0.99) continue
    const center = a.clone().add(b).add(c).divideScalar(3)
    expect(Math.abs(center.x - 1000) >= 5 || Math.abs(center.z) >= 5).toBe(true)
    roofArea += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2
  }
  expect(roofArea).toBeCloseTo(300)
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i)
    // Flat roof at the highest corner's elevation + actual building height.
    if (Math.abs(y - 113.5) < 0.001) continue
    expect(y).toBeCloseTo(x / 10 + z / 20 - 0.3, 3)
  }
  geometry.dispose()
})

test('compact selection preserves nearby footprints and tall distant landmarks deterministically', () => {
  const near = [2, 8, 2, 1, 8000, 0, courtyard[6]] as CityBuilding
  const tower = [3, 100, 0, 2, 40000, 0, courtyard[6]] as CityBuilding
  const smallFar = [
    4,
    4,
    2,
    3,
    40000,
    2000,
    [[0, 0, 40, 0, 40, 40, 0, 40]],
  ] as CityBuilding
  const result = selectCityBuildings([near, tower, smallFar], true)
  expect(result.map((b) => b[0])).toEqual([2, 3])
  expect(selectCityBuildings([near, tower, smallFar], true)).toEqual(result)
})

test('bundled map coverage is bounded, attributed and geographically surrounds the stadium', () => {
  const buildings = data.buildings as CityBuilding[]
  expect(buildings.length).toBeGreaterThan(10000)
  expect(buildings.length).toBeLessThanOrEqual(18000)
  expect(data.source).toContain('OpenStreetMap')
  expect(data.license).toBe('ODbL 1.0')
  expect(
    new TextEncoder().encode(JSON.stringify(data)).byteLength,
  ).toBeLessThan(2_000_000)
  const sectors = new Set<number>()
  for (const building of buildings) {
    const [, height, source, , x, z, rings] = building
    expect(height).toBeGreaterThan(0)
    expect([0, 1, 2]).toContain(source)
    expect(Math.hypot(x, z)).toBeGreaterThanOrEqual(5200)
    expect(Math.hypot(x, z)).toBeLessThanOrEqual(43001)
    expect(rings.every((r) => r.length >= 6 && r.length % 2 === 0)).toBe(true)
    if (Math.hypot(x, z) > 30000)
      sectors.add(Math.floor((Math.atan2(z, x) + Math.PI) / (Math.PI / 4)))
  }
  expect(sectors.size).toBe(8)
  expect(buildings.some((b) => b[6].length > 1)).toBe(true)
})

test('city batches stay finite, frustum-cullable and within geometry budgets in both modes', () => {
  const full = buildSofiaCity(),
    compact = buildSofiaCity({ compact: true })
  for (const city of [full, compact]) {
    let meshes = 0,
      vertices = 0
    city.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      meshes++
      expect(object.frustumCulled).toBe(true)
      expect(object.castShadow).toBe(false)
      const g = object.geometry,
        p = g.getAttribute('position')
      expect(g.boundingSphere).not.toBeNull()
      expect(g.boundingSphere!.radius).toBeLessThan(1700)
      vertices += p.count
      expect(Array.from(p.array).every(Number.isFinite)).toBe(true)
    })
    expect(meshes).toBeLessThan(240)
    expect(vertices).toBeLessThan(1_800_000)
  }
  expect(compact.userData.buildingCount).toBeLessThan(
    full.userData.buildingCount,
  )
  expect(compact.userData.buildingCount).toBeLessThanOrEqual(10000)
  disposeGroup(full)
  disposeGroup(compact)
})
