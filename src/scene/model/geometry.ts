import * as THREE from 'three'

export type Ring = [
  halfWidth: number,
  halfLength: number,
  radius: number,
  height: number,
]
export function perimeterPoint(t: number, w: number, l: number, r: number) {
  const lengths = [
    2 * (l - r),
    (Math.PI * r) / 2,
    2 * (w - r),
    (Math.PI * r) / 2,
    2 * (l - r),
    (Math.PI * r) / 2,
    2 * (w - r),
    (Math.PI * r) / 2,
  ]
  let d = (((t % 1) + 1) % 1) * lengths.reduce((a, b) => a + b, 0)
  let i = 0
  while (i < 7 && d > lengths[i]) {
    d -= lengths[i]
    i++
  }
  if (i === 0) return { x: w, z: -l + r + d, nx: 1, nz: 0 }
  if (i === 2) return { x: w - r - d, z: l, nx: 0, nz: 1 }
  if (i === 4) return { x: -w, z: l - r - d, nx: -1, nz: 0 }
  if (i === 6) return { x: -w + r + d, z: -l, nx: 0, nz: -1 }
  const corner = (i - 1) / 2
  const angle = (corner * Math.PI) / 2 + d / r
  const cx = corner === 0 || corner === 3 ? w - r : -w + r
  const cz = corner < 2 ? l - r : -l + r
  return {
    x: cx + Math.cos(angle) * r,
    z: cz + Math.sin(angle) * r,
    nx: Math.cos(angle),
    nz: Math.sin(angle),
  }
}
export function makeRing(outer: Ring, inner: Ring, segments = 256) {
  const positions: number[] = [],
    indices: number[] = []
  for (let i = 0; i <= segments; i++) {
    for (const p of [outer, inner]) {
      const point = perimeterPoint(i / segments, p[0], p[1], p[2])
      positions.push(point.x, p[3], point.z)
    }
    if (i < segments) {
      const k = i * 2
      indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setIndex(indices)
  g.computeVertexNormals()
  return g
}
export function ringMesh(
  outer: Ring,
  inner: Ring,
  material: THREE.Material,
  name = '',
) {
  const mesh = new THREE.Mesh(makeRing(outer, inner), material)
  mesh.name = name
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}
export function box(
  parent: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  name = '',
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  mesh.name = name
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}
export function beam(
  parent: THREE.Group,
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 5),
    material,
  )
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.clone().sub(a).normalize(),
  )
  mesh.castShadow = true
  parent.add(mesh)
  return mesh
}
export function seededRandom(seed = 1948) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}
export function standard(color: string, roughness = 0.8, metalness = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    side: THREE.DoubleSide,
  })
}
export function disposeGroup(group: THREE.Group) {
  const materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>()
  group.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh ||
      obj instanceof THREE.Line ||
      obj instanceof THREE.Points
    ) {
      obj.geometry.dispose()
      if (obj instanceof THREE.InstancedMesh) obj.dispose()
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((mat) => materials.add(mat))
    }
  })
  materials.forEach((mat) => {
    for (const value of Object.values(mat))
      if (value instanceof THREE.Texture) textures.add(value)
    mat.dispose()
  })
  textures.forEach((tex) => tex.dispose())
}
