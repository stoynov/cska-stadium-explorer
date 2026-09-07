import { expect, spyOn, test } from 'bun:test'
import * as THREE from 'three'
import { addSeating } from './seating'
import { disposeGroup } from './geometry'
import { mergeStatic } from './stadium'
import { addFacade } from './facade'

test('facade service openings remain clear below the gallery while adjacent glazing is retained', () => {
  // Image decoding is unavailable in Bun; only crest texture loading is stubbed.
  // Every facade pane, mullion, transom and louver remains real geometry.
  const texture = spyOn(THREE.TextureLoader.prototype, 'load').mockReturnValue(
    new THREE.Texture(),
  )
  const root = new THREE.Group()
  try {
    const facade = addFacade(root)
    root.updateMatrixWorld(true)
    for (const sign of [-1, 1]) {
      for (const z of [47.2, 48, 50.5, 53, 53.8]) {
        for (const y of [0.6, 1.8, 2.45, 4.85, 6.8]) {
          const ray = new THREE.Raycaster(
            new THREE.Vector3(35, y, sign * z),
            new THREE.Vector3(1, 0, 0),
            0,
            40,
          )
          expect(ray.intersectObject(facade, true)).toHaveLength(0)
        }
      }
      for (const [y, z] of [
        [2, 45],
        [2, 56],
        [10, 50.5],
      ]) {
        const ray = new THREE.Raycaster(
          new THREE.Vector3(70, y, sign * z),
          new THREE.Vector3(1, 0, 0),
          0,
          5,
        )
        expect(ray.intersectObject(facade, true).length).toBeGreaterThan(0)
      }
    }
  } finally {
    texture.mockRestore()
    disposeGroup(root)
  }
})

test('both Sector A corner passages are clear from pitch to exterior with an overhead bridge', () => {
  const root = new THREE.Group()
  const seating = addSeating(root)
  root.updateMatrixWorld(true)
  const checkPassages = () => {
    for (const sign of [-1, 1]) {
      for (const z of [48, 50.5, 53]) {
        for (const y of [0.6, 1.8, 4.5, 8.5]) {
          const ray = new THREE.Raycaster(
            new THREE.Vector3(35, y, sign * z),
            new THREE.Vector3(1, 0, 0),
            0,
            40,
          )
          expect(ray.intersectObject(seating, true)).toHaveLength(0)
        }
      }
      const bridge = new THREE.Raycaster(
        new THREE.Vector3(53.2, 9, sign * 50.5),
        new THREE.Vector3(0, 1, 0),
        0,
        2,
      ).intersectObject(seating, true)
      expect(bridge.length).toBeGreaterThan(0)
      expect(bridge[0].point.y).toBeGreaterThan(9.5)
      // Walk from the Silver terrace onto the bridge without a solid end return.
      const terraceExit = new THREE.Raycaster(
        new THREE.Vector3(53.2, 11.3, sign * 46),
        new THREE.Vector3(0, 0, sign),
        0,
        6,
      )
      expect(terraceExit.intersectObject(seating, true)).toHaveLength(0)
    }
  }
  checkPassages()
  mergeStatic(seating)
  root.updateMatrixWorld(true)
  checkPassages()
  disposeGroup(root)
}, 15000)

test('corner cutouts remove concrete and chair footprints while retaining supported adjacent stands', () => {
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
    if (p.x > 34 && Math.abs(p.z) > 47) {
      expect(Math.abs(p.z) - 0.32).toBeGreaterThanOrEqual(54)
    }
  }
  for (const sign of [-1, 1]) {
    for (const x of [40, 48, 58]) {
      const voidRay = new THREE.Raycaster(
        new THREE.Vector3(x, 30, sign * 50.5),
        new THREE.Vector3(0, -1, 0),
      )
      expect(voidRay.intersectObject(terraces)).toHaveLength(0)
    }
    for (const [x, z] of [
      [44, 56],
      [54, 56],
      [42, 44],
      [-44, 50.5],
    ]) {
      const retained = new THREE.Raycaster(
        new THREE.Vector3(x, 30, sign * z),
        new THREE.Vector3(0, -1, 0),
      )
      expect(retained.intersectObject(terraces).length).toBeGreaterThan(0)
    }
    // The bridge has actual side supports outside the vehicle/pedestrian opening.
    for (const z of [46.8, 54.2]) {
      const support = new THREE.Raycaster(
        new THREE.Vector3(61, 9, sign * z),
        new THREE.Vector3(0, -1, 0),
        0,
        9,
      )
      expect(support.intersectObject(seating, true).length).toBeGreaterThan(0)
    }
    // The raised gallery reaches the public concourse by a supported return
    // stair, instead of ending against the higher corner tier's cheek wall.
    for (const [x, minimumY, maximumY] of [
      [55, 11.8, 12.8],
      [60, 15.2, 16.2],
      [63.7, 18, 18.4],
    ]) {
      const support = new THREE.Raycaster(
        new THREE.Vector3(x, 19, sign * 53),
        new THREE.Vector3(0, -1, 0),
        0,
        9,
      )
      const hit = support.intersectObject(seating, true)[0]
      expect(hit).toBeDefined()
      expect(hit.point.y).toBeGreaterThan(minimumY)
      expect(hit.point.y).toBeLessThan(maximumY)
    }
  }
  disposeGroup(root)
})
