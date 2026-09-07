import * as THREE from 'three'
import dem from '../data/vitosha-dem.json'
import context from '../data/sofia-context.json'
import { box, beam, standard, seededRandom } from './geometry'
import { mergeStatic } from './stadium'

// Long-axis orientation measured from OSM way 1331127486; +X points to the NW entrance.
const axis = THREE.MathUtils.degToRad(41.31335)
export function geographicPoint(
  lat: number,
  lon: number,
  elevation = dem.origin.elevation,
) {
  const north = (lat - dem.origin.lat) * 111132,
    east =
      (lon - dem.origin.lon) *
      111320 *
      Math.cos(THREE.MathUtils.degToRad(dem.origin.lat))
  return new THREE.Vector3(
    -Math.sin(axis) * east + Math.cos(axis) * north,
    elevation - dem.origin.elevation,
    Math.cos(axis) * east + Math.sin(axis) * north,
  )
}
export function landscapeHeight(x: number, z: number) {
  const east = -Math.sin(axis) * x + Math.cos(axis) * z,
    north = Math.cos(axis) * x + Math.sin(axis) * z
  const lat = dem.origin.lat + north / 111132,
    lon =
      dem.origin.lon +
      east / (111320 * Math.cos(THREE.MathUtils.degToRad(dem.origin.lat)))
  const gx = THREE.MathUtils.clamp(
    ((lon - dem.bounds.west) / (dem.bounds.east - dem.bounds.west)) *
      (dem.cols - 1),
    0,
    dem.cols - 1.001,
  )
  const gy = THREE.MathUtils.clamp(
    ((dem.bounds.north - lat) / (dem.bounds.north - dem.bounds.south)) *
      (dem.rows - 1),
    0,
    dem.rows - 1.001,
  )
  const ix = Math.floor(gx),
    iy = Math.floor(gy),
    fx = gx - ix,
    fy = gy - iy
  const at = (a: number, b: number) => dem.heights[b * dem.cols + a]
  const elevation = THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(at(ix, iy), at(ix + 1, iy), fx),
    THREE.MathUtils.lerp(at(ix, iy + 1), at(ix + 1, iy + 1), fx),
    fy,
  )
  return THREE.MathUtils.lerp(
    -0.3,
    elevation - dem.origin.elevation,
    THREE.MathUtils.smoothstep(Math.hypot(x, z), 350, 1050),
  )
}
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
  const buildings = new THREE.Group()
  buildings.name = 'Distant buildings — OpenStreetMap footprints'
  const wall = standard('#b5b4aa', 0.95),
    roof = standard('#89928f', 0.95)
  for (const feature of context.features.filter((f) => f.kind === 'building')) {
    const points = feature.points.map(([lat, lon]) => geographicPoint(lat, lon))
    const center = points
      .reduce((a, p) => a.add(p), new THREE.Vector3())
      .multiplyScalar(1 / points.length)
    const shape = new THREE.Shape(
      points.map((p) => new THREE.Vector2(p.x - center.x, -p.z + center.z)),
    )
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: feature.height,
      bevelEnabled: false,
      steps: 1,
    })
    geometry.rotateX(-Math.PI / 2)
    const mesh = new THREE.Mesh(geometry, [roof, wall])
    mesh.position.set(center.x, landscapeHeight(center.x, center.z), center.z)
    buildings.add(mesh)
  }
  // Merge separately by material; normalize the cap/side groups before batching.
  const batches = [new THREE.Group(), new THREE.Group()]
  buildings.children.forEach((child) => {
    const m = child as THREE.Mesh
    for (const g of m.geometry.groups) {
      const part = m.geometry.clone()
      part.clearGroups()
      part.setDrawRange(g.start, g.count)
      // Extract only the group's vertices; ExtrudeGeometry is non-indexed.
      const extracted = new THREE.BufferGeometry()
      for (const key of ['position', 'normal', 'uv']) {
        const attr = part.getAttribute(key)
        extracted.setAttribute(
          key,
          new THREE.Float32BufferAttribute(
            Array.from(attr.array).slice(
              g.start * attr.itemSize,
              (g.start + g.count) * attr.itemSize,
            ),
            attr.itemSize,
          ),
        )
      }
      const piece = new THREE.Mesh(
        extracted,
        g.materialIndex === 0 ? roof : wall,
      )
      piece.position.copy(m.position)
      batches[g.materialIndex ?? 0].add(piece)
      part.dispose()
    }
    m.geometry.dispose()
  })
  for (const batch of batches) {
    mergeStatic(batch)
    parent.add(batch)
  }
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
export function buildSofiaLandscape() {
  const group = new THREE.Group()
  group.name = 'Sofia geographic context'
  group.add(buildVitosha(), buildTelevisionTower())
  addMappedSurroundings(group)
  return group
}
