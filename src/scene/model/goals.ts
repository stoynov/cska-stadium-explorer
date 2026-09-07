import * as THREE from 'three'

// IFAB Law 1: dimensions are the clear opening, not the post centrelines.
// https://www.theifab.com/laws/latest/the-field-of-play/
export const goalPostRadius = 0.06
const halfWidth = 7.32 / 2 + goalPostRadius
const crossbarHeight = 2.44 + goalPostRadius
// Net depths are modelling assumptions, not dimensions prescribed by IFAB.
const topDepth = 1.6
const bottomDepth = 2
const widthCells = 32
const heightCells = 11
const depthCells = 8

export function addGoal(
  parent: THREE.Group,
  end: number,
  goalLine: number,
  groundHeight: number,
  material: THREE.Material,
) {
  const goal = new THREE.Group()
  goal.name = end < 0 ? 'Goal / negative Z' : 'Goal / positive Z'
  goal.position.set(0, groundHeight, end * goalLine)
  parent.add(goal)
  const point = (x: number, y: number, depth: number) =>
    new THREE.Vector3(x, y, end * depth)
  const frontLeft = point(-halfWidth, 0, 0)
  const frontRight = point(halfWidth, 0, 0)
  const topLeft = point(-halfWidth, crossbarHeight, 0)
  const topRight = point(halfWidth, crossbarHeight, 0)
  const rearLeft = point(-halfWidth, 0, bottomDepth)
  const rearRight = point(halfWidth, 0, bottomDepth)
  const rearTopLeft = point(-halfWidth, crossbarHeight, topDepth)
  const rearTopRight = point(halfWidth, crossbarHeight, topDepth)

  const tube = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    name: string,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 16),
      material,
    )
    mesh.name = name
    mesh.position.copy(a).add(b).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    )
    mesh.castShadow = true
    goal.add(mesh)
  }
  tube(frontLeft, topLeft, goalPostRadius, 'Left goalpost')
  tube(frontRight, topRight, goalPostRadius, 'Right goalpost')
  tube(topLeft, topRight, goalPostRadius, 'Goal crossbar')
  for (const [a, b] of [
    [topLeft, rearTopLeft],
    [topRight, rearTopRight],
    [rearTopLeft, rearTopRight],
    [rearLeft, rearTopLeft],
    [rearRight, rearTopRight],
    [frontLeft, rearLeft],
    [frontRight, rearRight],
    [rearLeft, rearRight],
  ])
    tube(a, b, 0.025, 'Goal net support')

  const positions: number[] = []
  const segment = (a: THREE.Vector3, b: THREE.Vector3) =>
    positions.push(...a.toArray(), ...b.toArray())
  // Every panel shares its exact perimeter and subdivision counts with its
  // neighbours. Both strand directions follow the same sloping rear surface.
  const panel = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    d: THREE.Vector3,
    columns: number,
    rows: number,
  ) => {
    const grid = Array.from({ length: rows + 1 }, (_, row) => {
      const left = a.clone().lerp(c, row / rows)
      const right = b.clone().lerp(d, row / rows)
      return Array.from({ length: columns + 1 }, (_, column) =>
        left.clone().lerp(right, column / columns),
      )
    })
    for (let row = 0; row <= rows; row++) {
      for (let column = 0; column <= columns; column++) {
        if (column < columns) segment(grid[row][column], grid[row][column + 1])
        if (row < rows) segment(grid[row][column], grid[row + 1][column])
      }
    }
  }
  panel(rearLeft, rearRight, rearTopLeft, rearTopRight, widthCells, heightCells)
  panel(topLeft, topRight, rearTopLeft, rearTopRight, widthCells, depthCells)
  panel(frontLeft, rearLeft, topLeft, rearTopLeft, depthCells, heightCells)
  panel(frontRight, rearRight, topRight, rearTopRight, depthCells, heightCells)
  const net = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    ),
    new THREE.LineBasicMaterial({
      color: '#e1e5d9',
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    }),
  )
  net.name = 'Goal net'
  goal.add(net)
}
