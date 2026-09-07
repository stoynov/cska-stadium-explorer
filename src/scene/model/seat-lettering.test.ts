import { test, expect } from 'bun:test'
import { whiteSeat, letterBays } from './seat-lettering'
import {
  buildVitosha,
  buildTelevisionTower,
  towerLocation,
  landscapeHeight,
  geographicPoint,
} from './sofia-landscape'
import * as THREE from 'three'
import { disposeGroup } from './geometry'

test('the four seat letters fit between the five access axes', () => {
  for (const center of letterBays) {
    let count = 0
    for (let row = 0; row < 31; row++)
      for (let z = center - 10; z <= center + 10; z += 0.53) {
        if (whiteSeat(4, z, row)) {
          count++
          expect(Math.abs(z - center)).toBeLessThan(7.6)
          expect(row).toBeGreaterThanOrEqual(4)
          expect(row).toBeLessThanOrEqual(26)
        }
      }
    expect(count).toBeGreaterThan(70)
  }
  for (const z of [-40, -20, 0, 20, 40])
    for (let row = 0; row < 31; row++) expect(whiteSeat(4, z, row)).toBe(false)
  expect(whiteSeat(0, 30, 20)).toBe(false)
})
test('the C has an open counter and A has a crossbar below its apex', () => {
  expect(whiteSeat(4, 10, 16)).toBe(false)
  expect(whiteSeat(4, 10 - 6, 16)).toBe(false)
  expect(whiteSeat(4, -30, 13)).toBe(true)
  expect(whiteSeat(4, -30, 20)).toBe(false)
})
test('geographic landscape retains metre scale and upward-facing terrain normals', () => {
  const mountain = buildVitosha(),
    normal = mountain.geometry.getAttribute('normal')
  let up = 0
  for (let i = 0; i < normal.count; i++) if (normal.getY(i) > 0.5) up++
  expect(up / normal.count).toBeGreaterThan(0.95)
  expect(Math.hypot(towerLocation.x, towerLocation.z)).toBeGreaterThan(800)
  expect(Math.hypot(towerLocation.x, towerLocation.z)).toBeLessThan(900)
  expect(geographicPoint(42.5639, 23.2783, 2290).y).toBe(736 + 1000)
  const tower = buildTelevisionTower(),
    bounds = new THREE.Box3().setFromObject(tower)
  expect(bounds.max.y - bounds.min.y).toBeCloseTo(106, 0)
  expect(tower.position.y).toBeCloseTo(
    landscapeHeight(towerLocation.x, towerLocation.z),
    5,
  )
  const group = new THREE.Group()
  group.add(mountain, tower)
  disposeGroup(group)
})
