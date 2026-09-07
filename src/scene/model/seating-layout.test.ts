import { expect, test } from 'bun:test'
import {
  aisleAxes,
  bowlPoint,
  rowSurfaceHeight,
  circulationAt,
  stairTreads,
} from './seating-layout'
import { stadiumDimensions } from '../../config/stadium'

test('straight-side stair axes keep their station from bottom to top', () => {
  for (const axis of aisleAxes.filter((a) => a.side % 2 === 0)) {
    const bottom = bowlPoint(axis.side, axis.station, 0)
    const top = bowlPoint(axis.side, axis.station, 24)
    if (axis.side === 0 || axis.side === 4)
      expect(top.z).toBeCloseTo(bottom.z, 8)
    else expect(top.x).toBeCloseTo(bottom.x, 8)
  }
})
test('aisles stay the same physical width and portals exclude terrace geometry', () => {
  const axis = aisleAxes.find((a) => a.side === 4 && a.station === 0)!
  for (const depth of [0, 12, 24]) {
    const p = bowlPoint(axis.side, axis.station, depth)
    expect(circulationAt(p, depth)?.kind).toBe('stair')
    expect(circulationAt({ ...p, z: p.z + 2 }, depth)).toBeUndefined()
  }
  const p = bowlPoint(4, 0, 7)
  expect(circulationAt(p, 7)?.kind).toBe('portal')
})
test('walking steps have consistent human-scale rise and do not pass through the entrance', () => {
  const steps = stairTreads()
  for (const step of steps) {
    expect(step.rise).toBeGreaterThan(0)
    expect(step.rise).toBeLessThan(0.2)
    expect(step.run).toBeGreaterThan(0.25)
    expect(step.depth >= 5.53 && step.depth < 9.48).toBe(false)
  }
  expect(steps.at(-1)!.height).toBeCloseTo(
    rowSurfaceHeight(stadiumDimensions.seating.rows),
    6,
  )
})
test('corner stair direction is fixed while its radius grows', () => {
  const a = bowlPoint(1, Math.PI / 4, 0),
    b = bowlPoint(1, Math.PI / 4, 20)
  expect(b.x - a.x).toBeCloseTo(b.z - a.z, 8)
  expect(a.nx).toBeCloseTo(b.nx, 8)
})

test('precast terraces really leave the recessed entrances open', async () => {
  const THREE = await import('three')
  const { addSeating } = await import('./seating')
  const { disposeGroup } = await import('./geometry')
  const root = new THREE.Group()
  const bowl = addSeating(root)
  const mesh = bowl.getObjectByName(
    'Precast seating treads — cut around stairs and entrances',
  )!
  root.updateMatrixWorld(true)
  const axis = aisleAxes.find((a) => a.side === 4 && a.station === 0)!
  const centre = bowlPoint(axis.side, axis.station, 7)
  const ray = new THREE.Raycaster(
    new THREE.Vector3(centre.x, 30, centre.z),
    new THREE.Vector3(0, -1, 0),
  )
  expect(ray.intersectObject(mesh).length).toBe(0)
  ray.ray.origin.z += 4
  expect(ray.intersectObject(mesh).length).toBeGreaterThan(0)
  disposeGroup(root)
})

test('chair footprint clearance extends beyond the concrete cutout', () => {
  const portal = bowlPoint(4, 0, 7)
  const nearWall = { ...portal, z: portal.z + 1.8 }
  expect(circulationAt(nearWall, 7)).toBeUndefined()
  expect(circulationAt(nearWall, 7, 0.28)?.kind).toBe('portal')
  const stair = bowlPoint(4, 0, 12)
  const nearRail = { ...stair, z: stair.z + 0.95 }
  expect(circulationAt(nearRail, 12)).toBeUndefined()
  expect(circulationAt(nearRail, 12, 0.28)?.kind).toBe('stair')
})
