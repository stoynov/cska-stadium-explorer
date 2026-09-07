import { test, expect } from 'bun:test'
import {
  facadeBase,
  facadeLayout,
  facadeBays,
  facadePerimeter,
} from './facade-layout'

test('the entrance arch clears the crest and rises in mirrored steps toward its centre', () => {
  expect(facadeBase(73, 0)).toBeGreaterThan(13)
  for (const z of [0, 8, 17, 25, 34, 43, 51, 60]) {
    expect(facadeBase(73, z)).toBe(facadeBase(73, -z))
    expect(facadeBase(73, z)).toBeGreaterThanOrEqual(facadeBase(73, z + 5))
  }
  expect(facadeBase(-73, 0)).toBeLessThan(5)
})
test('separate louver modules fit the perimeter and leave the glazed cutout clear', () => {
  expect(facadePerimeter / facadeBays).toBeCloseTo(2.44, 1)
  const blades = facadeLayout()
  expect(blades.length).toBeGreaterThan(10000)
  for (const blade of blades) {
    expect(blade.y).toBeGreaterThanOrEqual(facadeBase(blade.x, blade.z))
    expect(Math.hypot(blade.nx, blade.nz)).toBeCloseTo(1, 6)
  }
})
