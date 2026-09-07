import { buildPedestrians } from './people'
import { landscapeHeight } from './sofia-landscape'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import * as THREE from 'three'
import { seededRandom, standard, box, beam } from './geometry'
import { parkPaths, parkTrees, type ParkPath } from './park-layout'
import { mergeStatic } from './stadium'

function treeCrown(clumps = 72) {
  const random = seededRandom(687),
    pieces: THREE.BufferGeometry[] = []
  // Many small, irregular leaf masses create a broken canopy silhouette.
  // One shared crown is instanced for the whole park; no alpha overdraw.
  for (let i = 0; i < clumps; i++) {
    const azimuth = i * 2.399963,
      y = 1 - (2 * (i + 0.5)) / clumps
    const radius = Math.sqrt(1 - y * y) * (0.6 + random() * 0.38)
    const geometry = new THREE.IcosahedronGeometry(
      (clumps < 40 ? 0.28 : 0.17) + random() * 0.13,
      0,
    )
    const points = geometry.getAttribute('position'),
      normals = geometry.getAttribute('normal')
    const normal = new THREE.Vector3()
    for (let j = 0; j < points.count; j++) {
      normal.fromBufferAttribute(points, j).normalize()
      normals.setXYZ(j, normal.x, normal.y, normal.z)
    }
    geometry.scale(1, 0.85 + random() * 0.45, 1)
    geometry.rotateY(random() * Math.PI)
    geometry.translate(
      Math.cos(azimuth) * radius,
      y * 0.72,
      Math.sin(azimuth) * radius,
    )
    const shade = 0.64 + (y + 1) * 0.12 + random() * 0.12
    const colors = new Float32Array(
      geometry.getAttribute('position').count * 3,
    ).fill(shade)
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pieces.push(geometry)
  }
  const merged = mergeGeometries(pieces)!
  pieces.forEach((p) => p.dispose())
  return merged
}
function ribbon(
  path: ParkPath,
  width: number,
  y: number,
  material: THREE.Material,
) {
  const positions: number[] = [],
    indices: number[] = []
  path.points.forEach((p, i) => {
    const a = path.points[Math.max(0, i - 1)],
      b = path.points[Math.min(path.points.length - 1, i + 1)]
    const length = Math.hypot(b.x - a.x, b.z - a.z),
      nx = -(b.z - a.z) / length,
      nz = (b.x - a.x) / length
    positions.push(
      p.x + (nx * width) / 2,
      y,
      p.z + (nz * width) / 2,
      p.x - (nx * width) / 2,
      y,
      p.z - (nz * width) / 2,
    )
    if (i < path.points.length - 1) {
      const k = i * 2
      indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3)
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setIndex(indices)
  g.computeVertexNormals()
  const mesh = new THREE.Mesh(g, material)
  mesh.name = path.name
  mesh.receiveShadow = true
  return mesh
}
function roundedSurface(
  parent: THREE.Group,
  points: number[][],
  y: number,
  material: THREE.Material,
  name: string,
) {
  const shape = new THREE.Shape()
  // Small corner fillets preserve the rectangular/trapezoidal garden geometry.
  points.forEach((p, i) => {
    const prev = points[(i + points.length - 1) % points.length],
      next = points[(i + 1) % points.length]
    const before = Math.hypot(prev[0] - p[0], prev[1] - p[1]),
      after = Math.hypot(next[0] - p[0], next[1] - p[1])
    const r = Math.min(2, before * 0.22, after * 0.22)
    const a = [
      p[0] + ((prev[0] - p[0]) * r) / before,
      p[1] + ((prev[1] - p[1]) * r) / before,
    ]
    const b = [
      p[0] + ((next[0] - p[0]) * r) / after,
      p[1] + ((next[1] - p[1]) * r) / after,
    ]
    if (i === 0) shape.moveTo(a[0], a[1])
    else shape.lineTo(a[0], a[1])
    shape.quadraticCurveTo(p[0], p[1], b[0], b[1])
  })
  shape.closePath()
  const geometry = new THREE.ShapeGeometry(shape, 12)
  geometry.rotateX(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = y
  mesh.receiveShadow = true
  mesh.name = name
  parent.add(mesh)
  return mesh
}
function groundMaterial() {
  const size = 256,
    data = new Uint8Array(size * size * 4),
    random = seededRandom(961)
  for (let z = 0; z < size; z++)
    for (let x = 0; x < size; x++) {
      const mottling =
        Math.sin(x * 0.047 + Math.cos(z * 0.029) * 2) * 7 +
        Math.sin(z * 0.081 + x * 0.023) * 5 +
        (random() - 0.5) * 13
      const i = (z * size + x) * 4
      data[i] = 111 + mottling
      data[i + 1] = 127 + mottling
      data[i + 2] = 77 + mottling * 0.7
      data[i + 3] = 255
    }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(16, 16)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 1 })
}
export function buildPark(compact = false) {
  const park = new THREE.Group()
  park.name = 'Borisova Gradina — photo-derived paths and planting'
  const paving = standard('#c2c0b8'),
    asphalt = standard('#777c78'),
    curb = standard('#d2d0c6'),
    mulch = standard('#625644'),
    wood = standard('#83725b'),
    metal = standard('#444e4b', 0.65, 0.3)
  // Resolve nearly coplanar ground layers without a per-fragment logarithmic depth write.
  for (const [material, order] of [
    [curb, 1],
    [paving, 2],
    [asphalt, 2],
    [mulch, 3],
  ] as const) {
    material.polygonOffset = true
    material.polygonOffsetFactor = -order
    material.polygonOffsetUnits = -order
  }
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2400, 2400),
    groundMaterial(),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.15
  ground.receiveShadow = true
  park.add(ground)
  for (const path of parkPaths) {
    park.add(
      ribbon(path, path.width + 0.45, -0.07, curb),
      ribbon(path, path.width, -0.035, path.pale ? paving : asphalt),
    )
  }
  roundedSurface(
    park,
    [
      [73, -51],
      [104, -51],
      [111, -30],
      [111, 30],
      [104, 51],
      [73, 51],
    ],
    0.005,
    paving,
    'Entrance forecourt',
  )
  // Narrow planted islands flank the central doors, as visible in the August aerials.
  for (const z of [-34, -17, 17, 34]) {
    roundedSurface(
      park,
      [
        [78, z - 5],
        [84, z - 6],
        [87, z + 5],
        [78, z + 6],
      ],
      0.03,
      curb,
      'Planting bed curb',
    )
    roundedSurface(
      park,
      [
        [78.3, z - 4.7],
        [83.6, z - 5.5],
        [86.5, z + 4.7],
        [78.3, z + 5.5],
      ],
      0.055,
      mulch,
      'Forecourt planted bed',
    )
  }
  const trees = parkTrees(compact)
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.96,
    vertexColors: true,
  })
  const closeTree = (t: (typeof trees)[number]) =>
    Math.hypot(t.x - 45, t.z) < 220
  const nearCount = trees.filter(closeTree).length
  const canopy = new THREE.InstancedMesh(
    treeCrown(compact ? 42 : 72),
    leafMaterial,
    nearCount,
  )
  const distantCanopy = new THREE.InstancedMesh(
    treeCrown(24),
    leafMaterial,
    trees.length - nearCount,
  )
  let nearIndex = 0,
    farIndex = 0
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.19, 0.36, 1, 6),
    standard('#6d6453'),
    trees.length,
  )
  const branches = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.055, 0.16, 1, 5),
    trunks.material,
    trees.length * 3,
  )
  const dummy = new THREE.Object3D(),
    color = new THREE.Color()
  trees.forEach((t, i) => {
    const groundY = landscapeHeight(t.x, t.z)
    dummy.position.set(t.x, t.h * 0.27 + groundY, t.z)
    dummy.rotation.set(0, t.angle, 0)
    dummy.scale.set(t.young ? 0.45 : 1, t.h * 0.54, t.young ? 0.45 : 1)
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)
    dummy.position.set(t.x, t.h * 0.7 + groundY, t.z)
    dummy.scale.set(t.w, t.h * 0.34, t.w * (0.8 + (i % 5) * 0.06))
    dummy.rotation.set(0.04 * (i % 3), t.angle, 0.03 * (i % 4))
    dummy.updateMatrix()
    const crown = closeTree(t) ? canopy : distantCanopy
    const crownIndex = closeTree(t) ? nearIndex++ : farIndex++
    crown.setMatrixAt(crownIndex, dummy.matrix)
    color.setHSL(
      0.225 + t.shade * 0.055,
      0.31 + t.shade * 0.16,
      0.25 + t.shade * 0.13,
      THREE.SRGBColorSpace,
    )
    crown.setColorAt(crownIndex, color)
    for (let j = 0; j < 3; j++) {
      const a = t.angle + j * 2.094
      const bottom = new THREE.Vector3(t.x, t.h * 0.35 + groundY, t.z),
        top = new THREE.Vector3(
          t.x + Math.cos(a) * t.w * 0.55,
          t.h * 0.67 + groundY,
          t.z + Math.sin(a) * t.w * 0.55,
        )
      dummy.position.copy(bottom).add(top).multiplyScalar(0.5)
      dummy.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        top.clone().sub(bottom).normalize(),
      )
      dummy.scale.set(
        t.young ? 0.4 : 1,
        bottom.distanceTo(top),
        t.young ? 0.4 : 1,
      )
      dummy.updateMatrix()
      branches.setMatrixAt(i * 3 + j, dummy.matrix)
    }
  })
  canopy.name = 'Mature woodland and young garden trees'
  canopy.castShadow = true
  canopy.receiveShadow = true
  trunks.castShadow = true
  distantCanopy.name = 'Distant woodland — simplified crowns'
  park.add(canopy, distantCanopy, trunks, branches)
  // Low planting inside entry beds; avoids blocking the glazed entrance.
  const shrubs = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    standard('#62734c'),
    56,
  )
  for (let i = 0; i < 56; i++) {
    const band = [-34, -17, 17, 34][Math.floor(i / 14)]
    dummy.position.set(80.2 + (i % 2) * 2.5, 0.4, band - 4 + (i % 14) * 0.62)
    dummy.rotation.set(0, i * 2.4, 0)
    dummy.scale.set(0.85, 0.5, 0.7)
    dummy.updateMatrix()
    shrubs.setMatrixAt(i, dummy.matrix)
  }
  shrubs.castShadow = true
  park.add(shrubs)
  const lightMat = standard('#e8e3ce')
  lightMat.emissive.set('#bdb79a')
  lightMat.emissiveIntensity = 0.2
  parkPaths.forEach((path, pathIndex) => {
    if (pathIndex > 5) return
    for (let i = 12; i < path.points.length - 8; i += 18) {
      const p = path.points[i],
        a = path.points[i - 1],
        b = path.points[i + 1],
        length = Math.hypot(b.x - a.x, b.z - a.z)
      const nx = -(b.z - a.z) / length,
        nz = (b.x - a.x) / length,
        offset = path.width / 2 + 1
      const x = p.x + nx * offset,
        z = p.z + nz * offset
      beam(
        park,
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(x, 5, z),
        0.065,
        metal,
      )
      const lamp = box(park, [0.3, 0.12, 0.8], [x, 5, z], metal, 'Path light')
      lamp.rotation.y = Math.atan2(nx, nz)
      box(park, [0.24, 0.04, 0.6], [x, 4.92, z], lightMat)
      if (i % 36 !== 12 || pathIndex === 0) continue
      const bench = new THREE.Group()
      bench.position.set(x + nx * 1.4, 0, z + nz * 1.4)
      bench.rotation.y = Math.atan2(nx, nz)
      park.add(bench)
      for (let slat = 0; slat < 4; slat++)
        box(
          bench,
          [2, 0.055, 0.105],
          [0, 0.48, (slat - 1.5) * 0.13],
          wood,
          'Bench slat',
        )
      box(bench, [2, 0.33, 0.06], [0, 0.8, -0.25], wood, 'Bench back')
      for (const side of [-0.75, 0.75])
        box(bench, [0.07, 0.48, 0.48], [side, 0.24, 0], metal)
    }
  })
  park.add(buildPedestrians())
  mergeStatic(park)
  // Flat paving receives tree shadows but must not cast acne onto itself.
  park.traverse((object) => {
    if (
      object instanceof THREE.Mesh &&
      [paving, asphalt, curb, mulch].includes(
        object.material as THREE.MeshStandardMaterial,
      )
    )
      object.castShadow = false
  })
  return park
}
