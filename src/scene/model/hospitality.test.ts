import { expect, test } from 'bun:test'
import * as THREE from 'three'
import { addSeating } from './seating'
import { disposeGroup } from './geometry'
import { mergeStatic } from './stadium'
import { skyboxLayout, terraceSeats } from './hospitality-layout'
import { addRoof } from './roof'

test('private terrace chairs leave room for dividers, a rear walkway and human headroom', () => {
  for (const room of skyboxLayout()) {
    for (const seat of terraceSeats(room)) {
      expect(seat.z - 0.3).toBeGreaterThan(room.zMin + 0.1)
      expect(seat.z + 0.3).toBeLessThan(room.zMax - 0.1)
      expect(55.6 - (seat.x + 0.3)).toBeGreaterThan(1.5)
      expect(room.ceiling - seat.floor).toBeGreaterThan(2.9)
    }
  }
})

test('Sector A has separate glazed Gold and Platinum boxes with supported external seats below the canopy', () => {
  const root = new THREE.Group()
  const seating = addSeating(root)
  const hospitality = seating.getObjectByName(
    'Sector A — Bronze, Silver, Gold and Platinum',
  )
  expect(hospitality).toBeDefined()
  if (!hospitality) return
  root.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(hospitality)
  expect(bounds.min.x).toBeGreaterThan(51.5)
  expect(bounds.max.x).toBeLessThan(71)
  expect(bounds.max.y).toBeLessThan(20.9)
  expect(bounds.min.z).toBeCloseTo(-47, 4)
  expect(bounds.max.z).toBeCloseTo(47, 4)
  for (const z of [-40, -20, 0, 20, 40]) {
    const ray = new THREE.Raycaster(
      new THREE.Vector3(51.65, 11.18, z),
      new THREE.Vector3(1, 0, 0),
      0,
      0.8,
    )
    expect(ray.intersectObject(hospitality, true).length).toBe(0)
  }
  const { roof } = addRoof(root)
  root.updateMatrixWorld(true)
  for (const x of [52, 60, 69]) {
    for (const z of [-46, 0, 46]) {
      const ray = new THREE.Raycaster(
        new THREE.Vector3(x, bounds.max.y, z),
        new THREE.Vector3(0, 1, 0),
      )
      const roofHit = ray.intersectObject(roof, true)[0]
      expect(roofHit).toBeDefined()
      expect(roofHit.distance).toBeGreaterThan(0.25)
    }
  }
  // The five lower stair flights end at the Silver landing, without climbing through its rooms.
  for (let i = 1; i <= 5; i++) {
    const flight = seating.getObjectByName(`Stair and recessed entrance ${i}`)!
    const flightBounds = new THREE.Box3().setFromObject(flight)
    expect(flightBounds.max.x).toBeLessThan(51.7)
    expect(flightBounds.max.y).toBeLessThan(11.1)
  }
  const boxes: THREE.Object3D[] = []
  const chairs: THREE.Object3D[] = []
  const glass: THREE.Object3D[] = []
  hospitality.traverse((obj) => {
    if (obj.userData.skybox) boxes.push(obj)
    if (obj.name === 'Premium terrace seat pan') chairs.push(obj)
    if (obj.name === 'Pitch-facing hospitality glazing') glass.push(obj)
  })
  expect(boxes.filter((b) => b.userData.level === 'Gold')).toHaveLength(20)
  expect(boxes.filter((b) => b.userData.level === 'Platinum')).toHaveLength(8)
  expect(glass.length).toBeGreaterThan(28)
  expect(chairs.length).toBeGreaterThanOrEqual(20 * 12 + 8 * 10)
  const positions = chairs.map((c) => c.getWorldPosition(new THREE.Vector3()))
  for (const p of positions) {
    // Chair shell ends <54.1; glass is recessed past x55, with a rear walkway.
    expect(p.x).toBeGreaterThan(52.2)
    expect(p.x).toBeLessThan(54)
    const ray = new THREE.Raycaster(
      new THREE.Vector3(p.x, p.y - 0.12, p.z),
      new THREE.Vector3(0, -1, 0),
      0,
      0.5,
    )
    const hits = ray
      .intersectObject(hospitality, true)
      .filter(
        (h) =>
          h.object.name === 'Terrace supporting slab' ||
          h.object.name === 'Premium rear row platform',
      )
    expect(hits.length).toBeGreaterThan(0)
  }
  // The renderer batches static meshes. Its output must retain all floor support.
  mergeStatic(seating)
  root.updateMatrixWorld(true)
  for (const p of positions.filter((_, i) => i % 12 === 0)) {
    const ray = new THREE.Raycaster(
      new THREE.Vector3(p.x, p.y - 0.12, p.z),
      new THREE.Vector3(0, -1, 0),
      0,
      0.5,
    )
    expect(ray.intersectObject(seating, true).length).toBeGreaterThan(0)
  }
  // The old public concourse must not slice through a lounge at y=18.2.
  const interior = new THREE.Raycaster(
    new THREE.Vector3(64.2, 19, 1),
    new THREE.Vector3(0, -1, 0),
    0,
    1,
  )
  expect(interior.intersectObject(seating, true).length).toBe(0)
  disposeGroup(root)
})
