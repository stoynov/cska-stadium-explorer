import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { addSeating } from './seating'
import { addRoof } from './roof'
import { addFacade } from './facade'
import { addPitch } from './pitch'
import { ringMesh, standard } from './geometry'

export function mergeStatic(group: THREE.Group) {
  group.updateMatrixWorld(true)
  const batches = new Map<
    THREE.Material,
    { meshes: THREE.Mesh[]; geometries: THREE.BufferGeometry[] }
  >()
  group.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh &&
      !(obj instanceof THREE.InstancedMesh) &&
      !Array.isArray(obj.material)
    ) {
      const batch = batches.get(obj.material) || { meshes: [], geometries: [] }
      const geom = obj.geometry.clone().applyMatrix4(obj.matrixWorld)
      // Normalize attributes before batching; generated rings have no UVs.
      if (!geom.getAttribute('uv'))
        geom.setAttribute(
          'uv',
          new THREE.Float32BufferAttribute(
            new Float32Array(geom.getAttribute('position').count * 2),
            2,
          ),
        )
      const normalized = geom.index ? geom.toNonIndexed() : geom
      if (normalized !== geom) geom.dispose()
      batch.meshes.push(obj)
      batch.geometries.push(normalized)
      batches.set(obj.material, batch)
    }
  })
  batches.forEach(({ meshes, geometries }, mat) => {
    if (meshes.length < 2) {
      geometries.forEach((g) => g.dispose())
      return
    }
    const geometry = mergeGeometries(geometries)
    if (!geometry) {
      geometries.forEach((g) => g.dispose())
      return
    }
    const merged = new THREE.Mesh(geometry, mat)
    merged.name = `${group.name} / surfaces`
    merged.castShadow = true
    merged.receiveShadow = true
    meshes.forEach((m) => {
      m.removeFromParent()
      m.geometry.dispose()
    })
    geometries.forEach((g) => g.dispose())
    group.add(merged)
  })
}
export function buildStadium() {
  const root = new THREE.Group()
  root.name = 'Българска армия — CSKA Sofia — approximate metres'
  root.userData = {
    units: 'metres',
    source: 'https://stadium.cska.bg/',
    interpretation: 'Photographic reconstruction, not surveyed geometry',
    pitch: '105 × 68 m assumed',
  }
  const base = standard('#aaa89b'),
    dark = standard('#626b5b')
  root.add(
    ringMesh(
      [74, 95, 30, 0.15],
      [35.8, 54.7, 2, 0.15],
      base,
      'Stadium foundation and circulation',
    ),
  )
  root.add(
    ringMesh([38, 57, 5, 0.18], [34.5, 53, 1, 0.18], dark, 'Pitch surround'),
  )
  const seats = addSeating(root)
  const { roof, emissive } = addRoof(root)
  const facade = addFacade(root)
  addPitch(root)
  mergeStatic(seats)
  mergeStatic(roof)
  mergeStatic(facade)
  return { root, roof, emissive }
}
