import { test, expect } from 'bun:test'
import { perimeterPoint, makeRing } from './geometry'

test('rounded perimeter closes with finite points and unit outward normals', () => {
  const start = perimeterPoint(0, 70, 90, 25)
  const end = perimeterPoint(1, 70, 90, 25)
  expect(Math.hypot(start.x - end.x, start.z - end.z)).toBeLessThan(0.00001)
  for (let i = 0; i < 1000; i++) {
    const p = perimeterPoint(i / 1000, 70, 90, 25)
    expect(Math.abs(p.x)).toBeLessThanOrEqual(70.0001)
    expect(Math.abs(p.z)).toBeLessThanOrEqual(90.0001)
    expect(Math.hypot(p.nx, p.nz)).toBeCloseTo(1)
  }
})
test('roof ring has a genuine opening and finite normals', () => {
  const g = makeRing([73, 93, 28, 23], [43, 62, 12, 22])
  const p = g.getAttribute('position')
  for (let i = 0; i < p.count; i++) {
    expect(Number.isFinite(p.getX(i) + p.getY(i) + p.getZ(i))).toBe(true)
    expect(Math.abs(p.getX(i)) > 29 || Math.abs(p.getZ(i)) > 48).toBe(true)
  }
  expect(g.index!.count).toBeGreaterThan(1000)
  g.dispose()
})
