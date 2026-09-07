import { expect, test } from 'bun:test'
import * as THREE from 'three'
import { buildPedestrians, pedestrianLayout, pedestrianPose } from './people'
import { onParkPath } from './park-layout'
import { disposeGroup } from './geometry'

test('visitors stand on walkways with enough separation for their bodies', () => {
  const people = pedestrianLayout()
  expect(people.length).toBe(110)
  for (let i = 0; i < people.length; i++) {
    expect(onParkPath(people[i], -0.3)).toBe(true)
    for (const other of people.slice(i + 1))
      expect(
        Math.hypot(people[i].x - other.x, people[i].z - other.z),
      ).toBeGreaterThanOrEqual(0.85)
  }
})
test('walking poses keep two separate grounded feet and arms swinging opposite the legs', () => {
  for (const stride of [-0.29, -0.16, 0.025, 0.16, 0.29]) {
    const sides = pedestrianPose(stride)
    expect(sides[0].ankle.x).toBeLessThan(sides[1].ankle.x)
    for (const p of sides) {
      expect(p.ankle.y).toBe(0.1)
      expect(p.hip.distanceTo(p.knee)).toBeLessThan(0.47)
      expect(p.knee.distanceTo(p.ankle)).toBeLessThan(0.49)
      if (Math.abs(stride) > 0.1) expect(p.elbow.z * p.ankle.z).toBeLessThan(0)
    }
  }
})
test('instanced visitor geometry has finite transforms and shoe soles on the paving', () => {
  const group = buildPedestrians(),
    layout = pedestrianLayout(),
    matrix = new THREE.Matrix4()
  for (const child of group.children) {
    const mesh = child as THREE.InstancedMesh
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, matrix)
      expect(matrix.elements.every(Number.isFinite)).toBe(true)
    }
  }
  const shoes = group.getObjectByName('Visitors / boxes') as THREE.InstancedMesh
  for (let i = 0; i < layout.length; i++) {
    shoes.getMatrixAt(i * 3 + 1, matrix)
    const sole = new THREE.Vector3(0, -0.5, 0).applyMatrix4(matrix)
    expect(sole.y).toBeCloseTo(0.065, 5)
  }
  disposeGroup(group)
})
