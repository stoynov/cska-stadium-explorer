import { stadiumDimensions } from '../../config/stadium'
import * as THREE from 'three'
import { ringMesh, perimeterPoint, beam, standard, box } from './geometry'

export function addRoof(parent: THREE.Group) {
  const roof = new THREE.Group()
  roof.name = 'Complete roof canopy and steel structure'
  parent.add(roof)
  const ivory = standard('#e3e4e0', 0.8, 0.08),
    steel = standard('#d4d7d8', 0.44, 0.4),
    seam = standard('#b7bcb6', 0.55, 0.2)
  roof.add(
    ringMesh(
      stadiumDimensions.roof.outer,
      stadiumDimensions.roof.inner,
      ivory,
      'Continuous open roof canopy',
    ),
  )
  roof.add(ringMesh([72.7, 93, 29, 21.65], [43.5, 62.5, 13, 20.95], ivory))
  roof.add(
    ringMesh(
      stadiumDimensions.roof.inner,
      [43.5, 62.5, 13, 20.95],
      steel,
      'Inner roof edge',
    ),
  )
  for (let i = 0; i < 64; i++) {
    const t = i / 64,
      outer = perimeterPoint(t, 71.5, 91.8, 28),
      inner = perimeterPoint(t, 44, 63, 13.5)
    const a = new THREE.Vector3(outer.x, 22.2, outer.z),
      b = new THREE.Vector3(inner.x, 21.55, inner.z)
    beam(roof, a, b, 0.15, seam)
    const high = new THREE.Vector3(outer.x, 26.2, outer.z)
    beam(roof, high, a, 0.15, steel)
    beam(roof, high, b, 0.12, steel)
    const next = perimeterPoint((i + 1) / 64, 71.5, 91.8, 28)
    beam(roof, high, new THREE.Vector3(next.x, 26.2, next.z), 0.1, steel)
    if (i % 2 === 0)
      beam(roof, new THREE.Vector3(outer.x, 18.3, outer.z), high, 0.2, steel)
    for (let k = 1; k < 4; k++) {
      const p = a.clone().lerp(b, k / 4),
        q = high.clone().lerp(b, k / 4)
      beam(roof, p, q, 0.065, steel)
      const nextP = a.clone().lerp(b, (k + 1) / 4)
      beam(roof, q, nextP, 0.055, steel)
    }
  }
  // Solar fields are kept to the entrance-side canopy seen in the 2026 aerial.
  const panels = standard('#33474d', 0.36, 0.45),
    frame = standard('#b5c3c2', 0.5, 0.5)
  for (let z = -51; z <= 51; z += 4.5) {
    const panel = box(
      roof,
      [10, 0.12, 3.95],
      [53, 21.9, z],
      panels,
      'Entrance-side solar panel',
    )
    panel.rotation.z = -0.02
    box(roof, [10.2, 0.08, 0.08], [53, 22, z - 2], frame)
    for (let col = 0; col < 6; col++)
      box(roof, [0.04, 0.05, 3.9], [48 + col * 1.8, 22.02, z], frame)
  }
  const fixtures = standard('#242f30'),
    emissive = new THREE.MeshStandardMaterial({
      color: '#e8e2be',
      emissive: '#fff0c4',
      emissiveIntensity: 0,
    })
  for (let i = 0; i < 28; i++) {
    const p = perimeterPoint(i / 28, 44.2, 63.2, 13.7)
    const housing = box(
      roof,
      [1.8, 0.35, 0.5],
      [p.x, 21, p.z],
      fixtures,
      'Pitch floodlight',
    )
    housing.rotation.y = Math.atan2(p.nx, p.nz)
    const light = box(roof, [1.55, 0.12, 0.4], [p.x, 20.78, p.z], emissive)
    light.rotation.y = housing.rotation.y
  }
  return { roof, emissive }
}
