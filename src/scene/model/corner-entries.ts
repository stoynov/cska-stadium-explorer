import * as THREE from 'three'
import { box, beam, standard } from './geometry'
import {
  cornerEntries as e,
  cornerEntryPoint,
  clipEntryEdge,
} from './corner-entry-layout'
import { hospitalityLayout as h } from './hospitality-layout'
import { stadiumDimensions } from '../../config/stadium'
import { rowSurfaceHeight, sectorALowerRows } from './seating-layout'

export function addCornerEntries(parent: THREE.Group) {
  const group = new THREE.Group()
  group.name = 'Sector A — two diagonal corner service passages'
  group.userData.interpretation =
    'Approximate diagonal corner passages, curved Silver galleries and transverse bridges derived from the supplied main-stand photograph'
  parent.add(group)
  const concrete = standard('#bbbdb7', 0.88),
    pale = standard('#d6d8d0', 0.78),
    rail = standard('#727b7d', 0.43, 0.55),
    pavement = standard('#91968f', 0.97)
  const bowl = stadiumDimensions.seating
  const innerRadius = h.frontX - e.centreX,
    outerRadius = h.backX - e.centreX
  for (const sign of [-1, 1]) {
    const passage = new THREE.Group()
    passage.name = `Sector A ${sign < 0 ? '−Z' : '+Z'} diagonal corner passage`
    group.add(passage)
    const localBox = (
      length: number,
      height: number,
      width: number,
      radius: number,
      y: number,
      transverse: number,
      material: THREE.Material,
      name: string,
    ) => {
      const p = cornerEntryPoint(sign, radius, transverse)
      const mesh = box(
        passage,
        [length, height, width],
        [p.x, y, p.z],
        material,
        name,
      )
      mesh.rotation.y = (-sign * Math.PI) / 4
      return mesh
    }
    localBox(
      e.exteriorRadius - e.pitchRadius,
      0.08,
      2 * e.halfWidth,
      (e.exteriorRadius + e.pitchRadius) / 2,
      e.floor - 0.04,
      0,
      pavement,
      'Diagonal open service passage pavement',
    )

    // The Silver gallery follows the lower corner around from Sector A and
    // crosses the passage tangentially at the same elevation as public row16.
    const galleryEdge = e.halfWidth + 0.4
    const positions: number[] = []
    const surface = (polygon: number[][]) => {
      const clipped = clipEntryEdge(polygon, sign, galleryEdge, true)
      for (let i = 1; i < clipped.length - 1; i++)
        positions.push(...clipped[0], ...clipped[i], ...clipped[i + 1])
    }
    const arc = (
      radius: number,
      angle: number,
      y: number,
    ): [number, number, number] => [
      e.centreX + radius * Math.cos(angle),
      y,
      sign * (e.centreZ + radius * Math.sin(angle)),
    ]
    const bottom = e.bridgeTop - e.bridgeThickness
    for (let i = 0; i < 80; i++) {
      const a = (i * Math.PI) / 160,
        b = ((i + 1) * Math.PI) / 160
      for (const y of [bottom, e.bridgeTop])
        surface([
          arc(innerRadius, a, y),
          arc(outerRadius, a, y),
          arc(outerRadius, b, y),
          arc(innerRadius, b, y),
        ])
      for (const r of [innerRadius, outerRadius])
        surface([
          arc(r, a, bottom),
          arc(r, b, bottom),
          arc(r, b, e.bridgeTop),
          arc(r, a, e.bridgeTop),
        ])
    }
    const innerRun = Math.sqrt(innerRadius ** 2 - galleryEdge ** 2),
      outerRun = Math.sqrt(outerRadius ** 2 - galleryEdge ** 2)
    const edgeA = cornerEntryPoint(sign, innerRun, galleryEdge),
      edgeB = cornerEntryPoint(sign, outerRun, galleryEdge)
    surface([
      [edgeA.x, bottom, edgeA.z],
      [edgeB.x, bottom, edgeB.z],
      [edgeB.x, e.bridgeTop, edgeB.z],
      [edgeA.x, e.bridgeTop, edgeA.z],
    ])
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geometry.computeVertexNormals()
    const gallery = new THREE.Mesh(geometry, concrete)
    gallery.name = 'Curved Silver gallery and transverse corner bridge'
    gallery.castShadow = gallery.receiveShadow = true
    passage.add(gallery)

    // Support columns sit outside the diagonal clear width on both sides.
    for (const offset of [-e.halfWidth - 0.3, e.halfWidth + 0.3]) {
      for (const radius of [24, 26, 33, 40])
        localBox(
          0.5,
          bottom - e.floor,
          0.5,
          radius,
          (bottom + e.floor) / 2,
          offset,
          concrete,
          'Gallery support outside diagonal passage',
        )
      localBox(
        17,
        0.35,
        0.5,
        32,
        bottom - 0.175,
        offset,
        concrete,
        'Diagonal gallery bearing beam',
      )
    }
    // Curved front/back rails stop at the bridge's public-side landing.
    for (const radius of [innerRadius + 0.08, outerRadius - 0.08]) {
      const end = Math.PI / 4 + Math.asin(galleryEdge / radius)
      const segments = Math.ceil((radius * end) / 1.3)
      for (let i = 0; i < segments; i++) {
        const a = (i * end) / segments,
          b = ((i + 1) * end) / segments
        const p = arc(radius, a, e.bridgeTop + 1.05),
          q = arc(radius, b, e.bridgeTop + 1.05)
        beam(
          passage,
          new THREE.Vector3(...p),
          new THREE.Vector3(...q),
          0.027,
          rail,
        )
        beam(
          passage,
          new THREE.Vector3(p[0], e.bridgeTop, p[2]),
          new THREE.Vector3(...p),
          0.022,
          rail,
        )
      }
    }
    // Stepped cheeks close only the exposed cross-sections of the two tiers.
    for (const mainSide of [true, false]) {
      const offset = (mainSide ? -1 : 1) * (e.halfWidth + 0.09)
      const rows = mainSide ? sectorALowerRows : bowl.rows
      for (let row = 0; row < rows; row++) {
        const r0 = bowl.cornerRadius + row * bowl.rowDepth,
          r1 = r0 + bowl.rowDepth
        const start = Math.sqrt(r0 ** 2 - e.halfWidth ** 2),
          end = Math.sqrt(r1 ** 2 - e.halfWidth ** 2)
        const y = rowSurfaceHeight(row)
        localBox(
          end - start + 0.008,
          y - e.floor,
          0.18,
          (start + end) / 2,
          (y + e.floor) / 2,
          offset,
          concrete,
          'Stepped diagonal retaining cheek',
        )
        const a = cornerEntryPoint(sign, start, offset),
          b = cornerEntryPoint(sign, end, offset)
        // Leave the row16 gallery landing clear instead of railing it shut.
        if (row !== sectorALowerRows)
          beam(
            passage,
            new THREE.Vector3(a.x, y + 1.04, a.z),
            new THREE.Vector3(b.x, y + 1.04 + bowl.rowRise, b.z),
            0.026,
            rail,
          )
      }
    }
    // Low edge fascia makes the bridge read as one continuous concrete slab.
    localBox(
      outerRun - innerRun,
      0.25,
      0.12,
      (outerRun + innerRun) / 2,
      e.bridgeTop - 0.12,
      galleryEdge - 0.06,
      pale,
      'Diagonal bridge slab edge',
    )
  }
  return group
}
