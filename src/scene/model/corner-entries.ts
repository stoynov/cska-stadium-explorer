import * as THREE from 'three'
import { box, beam, standard } from './geometry'
import { cornerEntries as e } from './corner-entry-layout'
import { hospitalityLayout as h } from './hospitality-layout'
import { stadiumDimensions } from '../../config/stadium'
import { rowSurfaceHeight, sectorALowerRows } from './seating-layout'

export function addCornerEntries(parent: THREE.Group) {
  const group = new THREE.Group()
  group.name = 'Sector A — two open corner service passages'
  group.userData.interpretation =
    'Photo-derived open stand seams, supported gallery links and pitch-level service access; approximate dimensions'
  parent.add(group)
  const concrete = standard('#bbbdb7', 0.88),
    pale = standard('#d6d8d0', 0.78),
    rail = standard('#727b7d', 0.43, 0.55),
    pavement = standard('#91968f', 0.97)
  const bowl = stadiumDimensions.seating
  for (const sign of [-1, 1]) {
    const passage = new THREE.Group()
    passage.name = `Sector A ${sign < 0 ? '−Z' : '+Z'} corner passage`
    group.add(passage)
    box(
      passage,
      [e.exteriorX - e.pitchX, 0.08, e.outerZ - e.innerZ],
      [
        (e.exteriorX + e.pitchX) / 2,
        e.floor - 0.04,
        (sign * (e.innerZ + e.outerZ)) / 2,
      ],
      pavement,
      'Continuous open service passage pavement',
    )
    box(
      passage,
      [h.backX - h.frontX, e.bridgeThickness, e.outerZ - e.innerZ + 0.4],
      [
        (h.backX + h.frontX) / 2,
        e.bridgeTop - e.bridgeThickness / 2,
        (sign * (e.innerZ + e.outerZ)) / 2,
      ],
      concrete,
      'Corner connecting gallery slab',
    )
    for (const z of [e.innerZ - 0.25, e.outerZ + 0.25]) {
      for (const x of [h.frontX + 0.45, 61, h.backX - 0.45]) {
        box(
          passage,
          [0.5, e.bridgeTop - e.bridgeThickness - e.floor, 0.5],
          [x, (e.floor + e.bridgeTop - e.bridgeThickness) / 2, sign * z],
          concrete,
          'Gallery support outside clear passage',
        )
      }
      box(
        passage,
        [h.backX - h.frontX, 0.4, 0.5],
        [
          (h.backX + h.frontX) / 2,
          e.bridgeTop - e.bridgeThickness - 0.2,
          sign * z,
        ],
        concrete,
        'Gallery bearing beam',
      )
    }
    // Guards follow the exposed longitudinal edges; neither end crosses the walk.
    for (const x of [h.frontX + 0.08, h.backX - 0.08]) {
      box(
        passage,
        [0.065, 0.065, e.outerZ - e.innerZ],
        [x, e.bridgeTop + 1.05, (sign * (e.innerZ + e.outerZ)) / 2],
        rail,
        'Gallery guard top rail',
      )
      for (let z = e.innerZ + 0.15; z < e.outerZ; z += 1.35)
        box(
          passage,
          [0.045, 1.05, 0.045],
          [x, e.bridgeTop + 0.525, sign * z],
          rail,
          'Gallery guard upright',
        )
      box(
        passage,
        [0.15, 0.28, e.outerZ - e.innerZ],
        [x, e.bridgeTop - 0.08, (sign * (e.innerZ + e.outerZ)) / 2],
        pale,
        'Pale gallery fascia',
      )
    }
    // A narrow return flight joins the lower VIP gallery to the retained
    // public concourse. Its arrangement is interpretive, not a measured plan.
    const stairStart = 51.8,
      stairEnd = 63.7,
      stairTop = 18.2,
      steps = 45
    const run = (stairEnd - stairStart) / steps
    const rise = (stairTop - e.bridgeTop) / steps
    for (let step = 0; step < steps; step++) {
      const top = e.bridgeTop + (step + 1) * rise
      box(
        passage,
        [run + 0.008, 0.28, 1.4],
        [stairStart + (step + 0.5) * run, top - 0.14, sign * 53],
        concrete,
        'Corner gallery return stair tread',
      )
    }
    box(
      passage,
      [0.8, 0.24, 1.4],
      [stairEnd + 0.35, stairTop - 0.12, sign * 53],
      concrete,
      'Corner gallery upper concourse landing',
    )
    for (const z of [52.26, 53.74]) {
      beam(
        passage,
        new THREE.Vector3(stairStart, e.bridgeTop - 0.2, sign * z),
        new THREE.Vector3(stairEnd, stairTop - 0.2, sign * z),
        0.14,
        concrete,
      )
      beam(
        passage,
        new THREE.Vector3(stairStart, e.bridgeTop + 1.04, sign * z),
        new THREE.Vector3(stairEnd, stairTop + 1.04, sign * z),
        0.027,
        rail,
      )
      for (let step = 0; step <= steps; step += 5) {
        const x = stairStart + step * run,
          y = e.bridgeTop + step * rise
        beam(
          passage,
          new THREE.Vector3(x, y, sign * z),
          new THREE.Vector3(x, y + 1.04, sign * z),
          0.022,
          rail,
        )
      }
      box(
        passage,
        [0.25, stairTop - e.bridgeTop - 0.3, 0.25],
        [stairEnd - 0.1, (stairTop + e.bridgeTop - 0.3) / 2, sign * z],
        concrete,
        'Return stair bearing above gallery',
      )
    }
    // Close the cut structural sections along the sides, never across the opening.
    for (const corner of [false, true]) {
      const rows = corner ? bowl.rows : sectorALowerRows
      const cutX = (depth: number) =>
        corner
          ? bowl.halfWidth -
            bowl.cornerRadius +
            Math.sqrt(
              (bowl.cornerRadius + depth) ** 2 - (e.outerZ - e.innerZ) ** 2,
            )
          : bowl.halfWidth + depth
      for (let row = 0; row < rows; row++) {
        const x0 = cutX(row * bowl.rowDepth),
          x1 = cutX((row + 1) * bowl.rowDepth)
        const y = rowSurfaceHeight(row)
        const z = sign * (corner ? e.outerZ + 0.09 : e.innerZ - 0.09)
        box(
          passage,
          [x1 - x0 + 0.006, y - e.floor, 0.18],
          [(x0 + x1) / 2, (y + e.floor) / 2, z],
          concrete,
          'Stepped retaining cheek at stand cut',
        )
        const outsideBridge = x1 < h.frontX || x0 > h.backX
        if (outsideBridge || corner)
          beam(
            passage,
            new THREE.Vector3(x0, y + 1.04, z),
            new THREE.Vector3(x1, y + 1.04 + bowl.rowRise, z),
            0.026,
            rail,
          )
      }
    }
  }
  return group
}
