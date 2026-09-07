import { expect, test } from 'bun:test'
import {
  parkPaths,
  parkTrees,
  onParkPath,
  inForecourt,
  inStadiumGrounds,
  distanceToPath,
} from './park-layout'

test('all garden routes connect to the promenade or another walking route', () => {
  for (const path of parkPaths.slice(1))
    for (const end of [path.points[0], path.points.at(-1)!]) {
      // Outer avenues intentionally continue into the wider park.
      if (Math.hypot(end.x, end.z) > 350) continue
      expect(
        parkPaths.some(
          (other) =>
            other !== path &&
            distanceToPath(end, other) <= other.width / 2 + 0.1,
        ),
      ).toBe(true)
    }
})
test('mature trees and saplings leave entrances, walkways and the stadium clear', () => {
  for (const compact of [false, true]) {
    const trees = parkTrees(compact)
    expect(trees.length).toBeGreaterThan(1500)
    expect(trees.some((t) => t.young)).toBe(true)
    for (const tree of trees) {
      expect(onParkPath(tree, 2.49)).toBe(false)
      expect(inStadiumGrounds(tree, 1.99)).toBe(false)
      expect(inForecourt(tree, 4.99)).toBe(false)
    }
  }
})
