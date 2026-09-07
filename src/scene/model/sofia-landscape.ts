import * as THREE from 'three'
import dem from '../data/vitosha-dem.json'
import context from '../data/sofia-context.json'
import { box, beam, standard, seededRandom } from './geometry'
import { mergeStatic } from './stadium'

import { geographicPoint, landscapeHeight } from './geographic'
import { buildSofiaCity } from './sofia-city'
export { geographicPoint, landscapeHeight } from './geographic'

export const towerLocation = geographicPoint(42.676756, 23.341764, 608.6)
export function buildVitosha() {
  const positions: number[] = [],
    indices: number[] = [],
    colors: number[] = []
  const { cols, rows, bounds, heights } = dem
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      const lat = THREE.MathUtils.lerp(
          bounds.north,
          bounds.south,
          row / (rows - 1),
        ),
        lon = THREE.MathUtils.lerp(bounds.west, bounds.east, col / (cols - 1))
      const p = geographicPoint(lat, lon, heights[row * cols + col]),
        distance = Math.hypot(p.x, p.z)
      // Blend the coarse DEM into the locally modelled park only near the origin.
      p.y = THREE.MathUtils.lerp(
        -0.3,
        p.y,
        THREE.MathUtils.smoothstep(distance, 350, 1050),
      )
      positions.push(p.x, p.y, p.z)
      if (row < rows - 1 && col < cols - 1 && distance > 300) {
        const a = row * cols + col
        indices.push(a, a + cols, a + 1, a + 1, a + cols, a + cols + 1)
      }
    }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const normals = geometry.getAttribute('normal'),
    light = new THREE.Vector3(0.4, 0.7, -0.5).normalize(),
    color = new THREE.Color(),
    haze = new THREE.Color('#b3c5d1')
  for (let i = 0; i < heights.length; i++) {
    const distance = Math.hypot(positions[i * 3], positions[i * 3 + 2])
    const altitude = THREE.MathUtils.smoothstep(heights[i], 1600, 2200)
    color.set('#345c73').lerp(new THREE.Color('#7b8d99'), altitude * 0.7)
    const normal = new THREE.Vector3().fromBufferAttribute(normals, i)
    color.multiplyScalar(0.65 + Math.max(0, normal.dot(light)) * 0.5)
    color.lerp(haze, Math.min(0.76, 1 - Math.exp(-distance / 21500)))
    color.lerp(
      new THREE.Color('#839071'),
      1 - THREE.MathUtils.smoothstep(distance, 700, 3200),
    )
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const mountain = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      fog: false,
    }),
  )
  mountain.name = 'Vitosha — Mapzen elevation mesh, unexaggerated metres'
  mountain.userData = {
    source: dem.sourceUrl,
    verticalExaggeration: 1,
    origin: dem.origin,
  }
  return mountain
}
export function buildTelevisionTower() {
  const tower = new THREE.Group()
  tower.name = 'Sofia old television tower — 106 m photographic reconstruction'
  const concrete = standard('#d1cbbc', 0.9),
    brick = standard('#947665'),
    window = standard('#4e6068', 0.4, 0.2),
    steel = standard('#707875', 0.5, 0.5),
    red = standard('#ad3e3b'),
    white = standard('#d6d6ce')
  // Ribbed fourteen-storey shaft, slightly narrowing toward the platforms.
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(5.4, 7, 65, 4, 1),
    brick,
  )
  shaft.rotation.y = Math.PI / 4
  shaft.position.y = 32.5
  tower.add(shaft)
  box(tower, [16, 3, 15], [0, 1.5, 0], concrete, 'Entrance plinth')
  for (let side = 0; side < 4; side++) {
    const face = new THREE.Group()
    face.rotation.y = (side * Math.PI) / 2
    tower.add(face)
    for (const x of [-4.7, -2.7, 0, 2.7, 4.7])
      box(
        face,
        [0.52, 65, 0.65],
        [x, 32.5, 5.1],
        concrete,
        'Vertical concrete ribs',
      )
    for (let floor = 0; floor < 14; floor++) {
      const y = 5 + floor * 4.15
      for (const x of [-1.5, 1.5]) {
        box(face, [1.25, 2.15, 0.18], [x, y, 5.47], window, 'Recessed window')
        box(face, [1.4, 0.15, 0.25], [x, y - 1.15, 5.55], concrete)
      }
    }
  }
  for (const [y, r] of [
    [65, 7.3],
    [70, 6.7],
    [75, 6],
  ] as const) {
    const deck = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, 0.4, 24),
      concrete,
    )
    deck.position.y = y
    tower.add(deck)
    const rail = new THREE.Mesh(new THREE.TorusGeometry(r, 0.075, 5, 32), steel)
    rail.rotation.x = Math.PI / 2
    rail.position.y = y + 1.15
    tower.add(rail)
    for (let i = 0; i < 20; i++) {
      const a = (i * Math.PI) / 10
      beam(
        tower,
        new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
        new THREE.Vector3(Math.cos(a) * r, y + 1.15, Math.sin(a) * r),
        0.045,
        steel,
      )
    }
  }
  const head = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 5, 12, 20), steel)
  head.position.y = 69
  tower.add(head)
  for (let i = 0; i < 17; i++) {
    const a = i * 2.39996,
      r = 5.6,
      y = 58 + (i % 5) * 4.1
    const dishGeometry = new THREE.SphereGeometry(
      1.6 + (i % 4) * 0.32,
      18,
      10,
      0,
      Math.PI * 2,
      0,
      1.2,
    )
    dishGeometry.scale(1, 0.24, 1)
    const dish = new THREE.Mesh(dishGeometry, white)
    dish.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(Math.cos(a), 0.12, Math.sin(a)).normalize(),
    )
    dish.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
    tower.add(dish)
  }
  for (let level = 0; level < 7; level++) {
    const y = 76 + level * 3.2,
      r = 1.4 - level * 0.12
    for (let side = 0; side < 4; side++) {
      const a = (side * Math.PI) / 2,
        b = a + Math.PI / 2
      const bottom = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
        top = new THREE.Vector3(
          Math.cos(a) * (r - 0.12),
          y + 3.2,
          Math.sin(a) * (r - 0.12),
        )
      beam(tower, bottom, top, 0.09, steel)
      beam(
        tower,
        bottom,
        new THREE.Vector3(
          Math.cos(b) * (r - 0.12),
          y + 3.2,
          Math.sin(b) * (r - 0.12),
        ),
        0.045,
        steel,
      )
    }
  }
  for (let i = 0; i < 8; i++) {
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.29, 0.95, 8),
      i % 2 ? white : red,
    )
    antenna.position.y = 98.4 + i * 0.95
    tower.add(antenna)
  }
  mergeStatic(tower)
  tower.position.copy(towerLocation)
  tower.position.y = landscapeHeight(towerLocation.x, towerLocation.z)
  // Fog is handled by material colour so the landmark remains readable across the park.
  tower.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = false
      const m = o.material as THREE.MeshStandardMaterial
      m.fog = false
      m.color.lerp(new THREE.Color('#afc0cb'), 0.12)
    }
  })
  return tower
}
function insidePolygon(x: number, z: number, points: THREE.Vector3[]) {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j]
    if (
      a.z > z !== b.z > z &&
      x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x
    )
      inside = !inside
  }
  return inside
}
function addMappedSurroundings(parent: THREE.Group) {
  const random = seededRandom(1959),
    trees: { x: number; z: number; h: number; w: number }[] = []
  for (const feature of context.features.filter((f) => f.kind === 'wood')) {
    const polygon = feature.points.map(([lat, lon]) =>
      geographicPoint(lat, lon),
    )
    const bounds = new THREE.Box3().setFromPoints(polygon)
    const holes = feature.holes.map((ring) =>
      ring.map(([lat, lon]) => geographicPoint(lat, lon)),
    )
    for (
      let x = Math.max(-2300, bounds.min.x);
      x < Math.min(2300, bounds.max.x);
      x += 13
    )
      for (
        let z = Math.max(-2300, bounds.min.z);
        z < Math.min(2300, bounds.max.z);
        z += 13
      ) {
        const px = x + random() * 10,
          pz = z + random() * 10,
          distance = Math.hypot(px, pz)
        if (
          distance < 520 ||
          distance > 2300 ||
          !insidePolygon(px, pz, polygon) ||
          holes.some((hole) => insidePolygon(px, pz, hole)) ||
          Math.hypot(px - towerLocation.x, pz - towerLocation.z) < 20
        )
          continue
        trees.push({ x: px, z: pz, h: 12 + random() * 10, w: 5 + random() * 4 })
      }
  }
  const crown = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    standard('#ffffff'),
    trees.length,
  )
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.2, 0.35, 1, 4),
    standard('#716b5a'),
    trees.length,
  )
  const dummy = new THREE.Object3D(),
    tint = new THREE.Color()
  trees.forEach((t, i) => {
    const y = landscapeHeight(t.x, t.z)
    dummy.position.set(t.x, y + t.h * 0.72, t.z)
    dummy.scale.set(t.w, t.h * 0.36, t.w * 0.86)
    dummy.rotation.y = i * 2.4
    dummy.updateMatrix()
    crown.setMatrixAt(i, dummy.matrix)
    tint.setHSL(
      0.23 + random() * 0.035,
      0.22 + random() * 0.15,
      0.28 + random() * 0.1,
      THREE.SRGBColorSpace,
    )
    crown.setColorAt(i, tint)
    dummy.position.y = y + t.h * 0.3
    dummy.scale.set(1, t.h * 0.6, 1)
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)
  })
  crown.name = 'Mapped woodland around the television tower'
  parent.add(crown, trunks)
}
export function buildSofiaLandscape(options: { compact?: boolean } = {}) {
  const group = new THREE.Group()
  group.name = 'Sofia geographic context'
  group.add(buildVitosha(), buildTelevisionTower())
  addMappedSurroundings(group)
  group.add(buildSofiaCity(options))
  return group
}
