import { expect, spyOn, test } from 'bun:test'
import * as THREE from 'three'
import { addSeating } from './seating'
import { disposeGroup } from './geometry'
import { mergeStatic } from './stadium'
import { addFacade } from './facade'

const diagonal = Math.SQRT1_2
function point(sign: number, radius: number, transverse: number, y: number) {
  return new THREE.Vector3(
    28.5 + (radius - transverse) * diagonal,
    y,
    sign * (47 + (radius + transverse) * diagonal),
  )
}

test('both diagonal corner passages are clear through the seating and rounded facade before and after batching', () => {
  const texture = spyOn(THREE.TextureLoader.prototype, 'load').mockReturnValue(
    new THREE.Texture(),
  )
  const root = new THREE.Group()
  try {
    const seating = addSeating(root)
    const facade = addFacade(root)
    root.updateMatrixWorld(true)
    const lintels = facade.getObjectsByProperty(
      'name',
      'Diagonal corner service opening lintel',
    )
    for (const column of facade.getObjectsByProperty(
      'name',
      'Recessed structural column',
    )) {
      const bounds = new THREE.Box3().setFromObject(column)
      if (bounds.min.y < 7) continue
      const support = new THREE.Raycaster(
        new THREE.Vector3(column.position.x, 7.55, column.position.z),
        new THREE.Vector3(0, -1, 0),
        0,
        0.5,
      )
      expect(support.intersectObjects(lintels).length).toBeGreaterThan(0)
    }
    const check = () => {
      root.updateMatrixWorld(true)
      for (const sign of [-1, 1]) {
        for (const offset of [-2.8, 0, 2.8]) {
          for (const y of [0.6, 1.8, 4.85, 6.8]) {
            const ray = new THREE.Raycaster(
              point(sign, 8, offset, y),
              new THREE.Vector3(diagonal, 0, sign * diagonal),
              0,
              52,
            )
            expect(ray.intersectObject(root, true)).toHaveLength(0)
          }
        }
        // The old straight-wall slots must be gone from the entrance glazing.
        for (const z of [48, 50.5, 53]) {
          const ray = new THREE.Raycaster(
            new THREE.Vector3(70, 2, sign * z),
            new THREE.Vector3(1, 0, 0),
            0,
            4,
          )
          expect(ray.intersectObject(facade, true).length).toBeGreaterThan(0)
        }
      }
    }
    check()
    mergeStatic(seating)
    mergeStatic(facade)
    check()
  } finally {
    texture.mockRestore()
    disposeGroup(root)
  }
}, 20000)

test('diagonal openings cut chair footprints and terraces while restoring the lower corner beside Sector A', () => {
  const root = new THREE.Group()
  const seating = addSeating(root)
  root.updateMatrixWorld(true)
  const terraces = seating.getObjectByName(
    'Precast seating treads — cut around stairs and entrances',
  )!
  const chairs = seating.getObjectByName(
    'Moulded red and white seat pans',
  ) as THREE.InstancedMesh
  const matrix = new THREE.Matrix4()
  for (let i = 0; i < chairs.count; i++) {
    chairs.getMatrixAt(i, matrix)
    const p = new THREE.Vector3().setFromMatrixPosition(matrix)
    if (p.x <= 28.5 || Math.abs(p.z) <= 47) continue
    const transverse = (Math.abs(p.z) - 47 - (p.x - 28.5)) * diagonal
    expect(Math.abs(transverse)).toBeGreaterThan(3.82)
    if (transverse < -3.5) expect(p.y).toBeLessThan(10.2)
  }
  for (const sign of [-1, 1]) {
    for (const radius of [12, 20, 30]) {
      const ray = new THREE.Raycaster(
        point(sign, radius, 0, 30),
        new THREE.Vector3(0, -1, 0),
      )
      expect(ray.intersectObject(terraces)).toHaveLength(0)
    }
    for (const [x, z] of [
      [44, 50.5],
      [44, 68],
      [-44, 50.5],
    ]) {
      const ray = new THREE.Raycaster(
        new THREE.Vector3(x, 30, sign * z),
        new THREE.Vector3(0, -1, 0),
      )
      expect(ray.intersectObject(terraces).length).toBeGreaterThan(0)
    }
  }
  disposeGroup(root)
})

test('curved Silver galleries support the diagonal bridges and remain connected to the VIP terrace', () => {
  const root = new THREE.Group()
  const seating = addSeating(root)
  root.updateMatrixWorld(true)
  for (const sign of [-1, 1]) {
    for (const [x, z] of [
      [53.2, 47.2],
      [51.9, 56.7],
    ]) {
      const ray = new THREE.Raycaster(
        new THREE.Vector3(x, 11, sign * z),
        new THREE.Vector3(0, -1, 0),
        0,
        1,
      )
      const hit = ray.intersectObject(seating, true)[0]
      expect(hit).toBeDefined()
      expect(hit.point.y).toBeCloseTo(10.16, 2)
    }
    const bridge = new THREE.Raycaster(
      point(sign, 25, 0, 9),
      new THREE.Vector3(0, 1, 0),
      0,
      2,
    ).intersectObject(seating, true)
    expect(bridge.length).toBeGreaterThan(0)
    expect(bridge[0].point.y).toBeGreaterThan(9.5)
    const exit = new THREE.Raycaster(
      new THREE.Vector3(53.2, 11.3, sign * 46),
      new THREE.Vector3(0, 0, sign),
      0,
      4,
    )
    expect(exit.intersectObject(seating, true)).toHaveLength(0)
    for (const offset of [-3.8, 3.8]) {
      const support = new THREE.Raycaster(
        point(sign, 26, offset, 9),
        new THREE.Vector3(0, -1, 0),
        0,
        9,
      )
      expect(support.intersectObject(seating, true).length).toBeGreaterThan(0)
      const bearing = new THREE.Raycaster(
        point(sign, 26, offset, 9.8),
        new THREE.Vector3(0, 1, 0),
        0,
        0.5,
      )
      expect(bearing.intersectObject(seating, true).length).toBeGreaterThan(0)
    }
  }
  disposeGroup(root)
})

test('the public row16 landing has a supported chair-free route from each bridge to its corner stair', () => {
  const root = new THREE.Group()
  const seating = addSeating(root)
  root.updateMatrixWorld(true)
  const radius = 23.52
  for (const sign of [-1, 1]) {
    const at = (angle: number, y: number) =>
      new THREE.Vector3(
        28.5 + radius * Math.cos(angle),
        y,
        sign * (47 + radius * Math.sin(angle)),
      )
    for (let degrees = 54; degrees < 76; degrees += 2) {
      const a = (degrees * Math.PI) / 180,
        b = ((degrees + 2) * Math.PI) / 180
      for (const height of [10.5, 10.8]) {
        const start = at(a, height),
          finish = at(b, height)
        const ray = new THREE.Raycaster(
          start,
          finish.clone().sub(start).normalize(),
          0,
          start.distanceTo(finish),
        )
        expect(ray.intersectObject(seating, true)).toHaveLength(0)
      }
      const floor = new THREE.Raycaster(
        at(a, 10.35),
        new THREE.Vector3(0, -1, 0),
        0,
        0.4,
      )
      expect(floor.intersectObject(seating, true).length).toBeGreaterThan(0)
    }
  }
  disposeGroup(root)
})
