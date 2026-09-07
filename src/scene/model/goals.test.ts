import { afterAll, beforeAll, expect, test } from 'bun:test'
import * as THREE from 'three'
import { addPitch } from './pitch'
import { disposeGroup } from './geometry'

const parent = new THREE.Group()
let nets: THREE.LineSegments[]
let frame: THREE.Mesh<THREE.CylinderGeometry>[]
let boundary: number[]

beforeAll(() => {
  // Bun has no canvas; only the texture drawing API is replaced. All goal
  // geometry, transforms, bounding boxes and ray intersections remain real.
  const originalDocument = globalThis.document
  const context = {
    fillRect() {},
    save() {},
    scale() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    arc() {},
    fill() {},
    restore() {},
    strokeRect(...args: number[]) {
      boundary ??= args
    },
  }
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => context }),
  } as unknown as Document
  try {
    addPitch(parent)
  } finally {
    globalThis.document = originalDocument
  }
  parent.updateMatrixWorld(true)
  nets = []
  frame = []
  parent.traverse((object) => {
    if (object instanceof THREE.LineSegments && object.name === 'Goal net')
      nets.push(object)
    if (
      object instanceof THREE.Mesh &&
      object.geometry instanceof THREE.CylinderGeometry &&
      Math.abs(object.getWorldPosition(new THREE.Vector3()).x) < 5
    )
      frame.push(object as THREE.Mesh<THREE.CylinderGeometry>)
  })
})
afterAll(() => disposeGroup(parent))

function vertices(net: THREE.LineSegments) {
  const position = net.geometry.getAttribute('position')
  return Array.from({ length: position.count }, (_, i) =>
    new THREE.Vector3()
      .fromBufferAttribute(position, i)
      .applyMatrix4(net.matrixWorld),
  )
}

function goalPlane(end: number) {
  // Canvas v maps to world -z after the pitch plane's rotation.
  return end < 0 ? boundary[1] - 52.5 : boundary[1] + boundary[3] - 52.5
}

test('goal net reaches the frame on the painted goal line and the grass', () => {
  expect(nets).toHaveLength(2)
  for (const net of nets) {
    const points = vertices(net)
    const end = Math.sign(points[0].z)
    expect(
      Math.min(...points.map((p) => end * (p.z - goalPlane(end)))),
    ).toBeCloseTo(0, 5)
    expect(Math.min(...points.map((p) => p.y))).toBeCloseTo(0.22, 5)
  }
})

test('all net strands form one connected assembly, including roof and both sides', () => {
  for (const net of nets) {
    const points = vertices(net)
    const end = Math.sign(points[0].z)
    const plane = goalPlane(end)
    const key = (p: THREE.Vector3) =>
      p
        .toArray()
        .map((n) => n.toFixed(4))
        .join(',')
    const graph = new Map<string, Set<string>>()
    for (let i = 0; i < points.length; i += 2) {
      const a = key(points[i]),
        b = key(points[i + 1])
      if (!graph.has(a)) graph.set(a, new Set())
      if (!graph.has(b)) graph.set(b, new Set())
      graph.get(a)!.add(b)
      graph.get(b)!.add(a)
    }
    const visited = new Set<string>()
    const pending = [key(points[0])]
    while (pending.length) {
      const next = pending.pop()!
      if (visited.has(next)) continue
      visited.add(next)
      pending.push(...graph.get(next)!)
    }
    expect(visited.size).toBe(graph.size)
    for (const side of [-1, 1])
      expect(
        points.some(
          (p) =>
            Math.abs(p.x - side * 3.72) < 1e-5 &&
            p.y > 0.5 &&
            p.y < 2.4 &&
            end * (p.z - plane) > 0.2 &&
            end * (p.z - plane) < 1.4,
        ),
      ).toBe(true)
    expect(
      points.some(
        (p) =>
          Math.abs(p.x) < 3 &&
          Math.abs(p.y - 2.72) < 1e-5 &&
          end * (p.z - plane) > 0.2 &&
          end * (p.z - plane) < 1.4,
      ),
    ).toBe(true)
  }
})

test('nets face away from play and leave the entire goal mouth open at both ends', () => {
  const normalized = nets.map((net) => {
    const points = vertices(net)
    const end = Math.sign(points[0].z)
    const plane = goalPlane(end)
    for (const p of points) {
      const depth = end * (p.z - plane)
      expect(depth).toBeGreaterThanOrEqual(-1e-5)
      if (depth < 0.05 && Math.abs(p.x) < 3.66)
        expect(p.y).toBeGreaterThanOrEqual(2.66)
    }
    return points
      .map((p) => [p.x, p.y, end * p.z].map((n) => n.toFixed(4)).join(','))
      .sort()
  })
  expect(normalized[0]).toEqual(normalized[1])
})

test('front frame is grounded with a clear 7.32 by 2.44 metre opening', () => {
  for (const end of [-1, 1]) {
    const front = frame.filter(
      (mesh) =>
        Math.abs(
          mesh.getWorldPosition(new THREE.Vector3()).z - goalPlane(end),
        ) < 0.001,
    )
    expect(front).toHaveLength(3)
    const bounds = front
      .map((mesh) => new THREE.Box3().setFromObject(mesh))
      .sort((a, b) => a.max.x - b.max.x)
    const left = bounds[0],
      right = bounds.find((box) => box.min.x > 3)!,
      crossbar = bounds.find((box) => box.min.x < -3 && box.max.x > 3)!
    expect(right.min.x - left.max.x).toBeCloseTo(7.32, 5)
    expect(crossbar.min.y - 0.22).toBeCloseTo(2.44, 5)
    expect(left.min.y).toBeCloseTo(0.22, 5)
    for (const mesh of front)
      expect(mesh.geometry.parameters.radiusTop * 2).toBeLessThanOrEqual(0.12)
    for (const x of [-3.4, 0, 3.4]) {
      const ray = new THREE.Raycaster(
        new THREE.Vector3(x, 1.4, end * 50),
        new THREE.Vector3(0, 0, end),
        0,
        2.6,
      )
      expect(ray.intersectObjects(frame)).toHaveLength(0)
    }
  }
})

test('ground continues across the pitch edge and supports both rear net hems', () => {
  const surfaces: THREE.Mesh[] = []
  parent.traverse((object) => {
    if (
      object instanceof THREE.Mesh &&
      !(object.geometry instanceof THREE.CylinderGeometry)
    )
      surfaces.push(object)
  })
  const supported = (point: THREE.Vector3) => {
    const ray = new THREE.Raycaster(
      new THREE.Vector3(point.x, 0.5, point.z),
      new THREE.Vector3(0, -1, 0),
      0,
      0.5,
    )
    const ground = ray.intersectObjects(surfaces)[0]
    expect(ground).toBeDefined()
    expect(ground.point.y).toBeCloseTo(point.y, 5)
  }
  for (const net of nets)
    for (const point of vertices(net).filter(
      (p) => Math.abs(p.y - 0.22) < 1e-5,
    ))
      supported(point)
  // Sample across both boundaries, including the old half-metre hole between
  // the marked plane and the surrounding track, plus the four pitch corners.
  for (const side of [-1, 1]) {
    for (const x of [-33.9, 0, 33.9])
      for (const z of [52.49, 52.5, 52.51, 52.75, 53.1, 54.5])
        supported(new THREE.Vector3(x, 0.22, side * z))
    for (const z of [-52.49, 0, 52.49])
      for (const x of [33.99, 34, 34.01, 34.25, 34.6])
        supported(new THREE.Vector3(side * x, 0.22, z))
  }
})
