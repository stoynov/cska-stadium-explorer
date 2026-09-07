import { expect, test } from 'bun:test'
import * as THREE from 'three'
import dem from '../data/vitosha-dem.json'
import { geographicPoint, terrainHeight } from './geographic'
import { buildVitosha } from './sofia-landscape'

test('terrain sampling matches actual rendered triangles at city road and hillside locations', () => {
  const terrain = buildVitosha()
  terrain.updateMatrixWorld()
  const ray = new THREE.Raycaster()
  for (const [x, z] of [
    [-1410.8, 2189.15],
    [1500, 1500],
    [-2000, 900],
    [300, 950],
    [2300, -1800],
  ]) {
    ray.set(new THREE.Vector3(x, 3000, z), new THREE.Vector3(0, -1, 0))
    const hit = ray.intersectObject(terrain)[0]
    expect(hit).toBeDefined()
    expect(terrainHeight(x, z)).toBeCloseTo(hit.point.y, 3)
  }
  terrain.geometry.dispose()
  ;(terrain.material as THREE.Material).dispose()
})

test('terrain covers northern Sofia through the city extract boundary', () => {
  expect(dem.bounds.north).toBeGreaterThan(42.716)
  const p = geographicPoint(42.716, 23.339806)
  const terrain = buildVitosha()
  terrain.updateMatrixWorld()
  const ray = new THREE.Raycaster(
    new THREE.Vector3(p.x, 3000, p.z),
    new THREE.Vector3(0, -1, 0),
  )
  expect(ray.intersectObject(terrain).length).toBeGreaterThan(0)
  terrain.geometry.dispose()
  ;(terrain.material as THREE.Material).dispose()
})
