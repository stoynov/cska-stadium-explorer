import { whiteSeat } from './seat-lettering'
import { stadiumDimensions } from '../../config/stadium'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { ringMesh, standard, seededRandom, box, beam } from './geometry'
import {
  aisleAxes,
  bowlPoint,
  sideExtent,
  sideStation,
  circulationAt,
  circulation,
  rowSurfaceHeight,
  stairTreads,
} from './seating-layout'

export function addSeating(parent: THREE.Group) {
  const group = new THREE.Group()
  group.name = 'Seating bowl — continuous tier with real stair flights'
  parent.add(group)
  const concrete = standard('#b8b5ae', 0.93),
    riser = standard('#96938d', 0.96)
  const stepMat = standard('#c6c3bb', 0.91),
    edgeMat = standard('#e2dfd6', 0.84)
  const stairRiser = standard('#a35d5b', 0.85),
    portalRed = standard('#b92632', 0.59)
  const railMat = standard('#969c9e', 0.4, 0.65),
    dark = standard('#111a1e', 0.99)
  const bowl = stadiumDimensions.seating,
    rng = seededRandom(48)
  const tops: number[] = [],
    risers: number[] = []
  const quad = (
    out: number[],
    a: number[],
    b: number[],
    c: number[],
    d: number[],
  ) => out.push(...a, ...b, ...c, ...a, ...c, ...d)
  const seats: {
    x: number
    y: number
    z: number
    rotation: number
    color: THREE.Color
  }[] = []

  for (let row = 0; row < bowl.rows; row++) {
    const depth = row * bowl.rowDepth,
      y = rowSurfaceHeight(row)
    for (let side = 0; side < 8; side++) {
      const length =
        side % 2
          ? sideExtent(side, depth) * (bowl.cornerRadius + depth)
          : sideExtent(side, depth)
      const slices = Math.ceil(length / 0.22)
      for (let i = 0; i < slices; i++) {
        const s0 = sideStation(side, i / slices),
          s1 = sideStation(side, (i + 1) / slices)
        const mid = bowlPoint(side, (s0 + s1) / 2, depth + bowl.rowDepth / 2)
        // Omit actual concrete, not just chairs: stairs and tunnels occupy these openings.
        if (circulationAt(mid, depth + bowl.rowDepth / 2)) continue
        const a = bowlPoint(side, s0, depth),
          b = bowlPoint(side, s1, depth)
        const c = bowlPoint(side, s1, depth + bowl.rowDepth),
          d = bowlPoint(side, s0, depth + bowl.rowDepth)
        quad(tops, [a.x, y, a.z], [b.x, y, b.z], [c.x, y, c.z], [d.x, y, d.z])
        quad(
          risers,
          [d.x, y, d.z],
          [c.x, y, c.z],
          [c.x, y + bowl.rowRise, c.z],
          [d.x, y + bowl.rowRise, d.z],
        )
      }
      const count = Math.floor(length / 0.53)
      for (let c = 0; c < count; c++) {
        const p = bowlPoint(
          side,
          sideStation(side, (c + 0.5) / count),
          depth + 0.42,
        )
        if (circulationAt(p, depth + 0.42, circulation.seatMargin)) continue
        const white = whiteSeat(side, p.z, row)
        const color = new THREE.Color(white ? '#ecebe5' : '#bc172c')
        color.multiplyScalar(0.9 + rng() * 0.14)
        seats.push({
          x: p.x,
          y: y + 0.3,
          z: p.z,
          rotation: Math.atan2(-p.nx, -p.nz),
          color,
        })
      }
    }
  }
  for (const [positions, mat, name] of [
    [
      tops,
      concrete,
      'Precast seating treads — cut around stairs and entrances',
    ],
    [risers, riser, 'Precast row risers'],
  ] as const) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geometry.computeVertexNormals()
    const mesh = new THREE.Mesh(geometry, mat)
    mesh.name = name
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  // Rounded moulded shells, tilted backs and dark supports replace sharp floating boxes.
  const seatMat = standard('#ffffff', 0.48, 0.03)
  const cushions = new THREE.InstancedMesh(
    new RoundedBoxGeometry(0.43, 0.1, 0.43, 1, 0.045),
    seatMat,
    seats.length,
  )
  const backs = new THREE.InstancedMesh(
    new RoundedBoxGeometry(0.44, 0.4, 0.075, 1, 0.03),
    seatMat,
    seats.length,
  )
  const brackets = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.08, 0.28, 0.22),
    standard('#33393b', 0.67, 0.35),
    seats.length,
  )
  cushions.name = 'Moulded red and white seat pans'
  backs.name = 'Rounded seat shells — ЦСКА mosaic'
  brackets.name = 'Dark seat brackets'
  const dummy = new THREE.Object3D()
  seats.forEach((seat, i) => {
    dummy.rotation.set(0, seat.rotation, 0)
    dummy.position.set(seat.x, seat.y, seat.z)
    dummy.updateMatrix()
    cushions.setMatrixAt(i, dummy.matrix)
    cushions.setColorAt(i, seat.color)
    dummy.translateZ(-0.2)
    dummy.position.y += 0.2
    dummy.rotateX(-0.12)
    dummy.updateMatrix()
    backs.setMatrixAt(i, dummy.matrix)
    backs.setColorAt(i, seat.color)
    dummy.rotation.set(0, seat.rotation, 0)
    dummy.position.set(seat.x, seat.y - 0.19, seat.z)
    dummy.updateMatrix()
    brackets.setMatrixAt(i, dummy.matrix)
  })
  cushions.receiveShadow = true
  backs.receiveShadow = true
  brackets.receiveShadow = true
  group.add(cushions, backs, brackets)

  const steps = stairTreads(),
    p0 = circulation.portalStart,
    p1 = circulation.portalEnd
  const floor = rowSurfaceHeight(7),
    roof = rowSurfaceHeight(12)
  for (const [index, axis] of aisleAxes.entries()) {
    const flight = new THREE.Group(),
      origin = bowlPoint(axis.side, axis.station, 0)
    flight.name = `Stair and recessed entrance ${index + 1}`
    flight.position.set(origin.x, 0, origin.z)
    flight.rotation.y = Math.atan2(origin.nx, origin.nz)
    group.add(flight)
    const tread = (z: number, y: number, run: number, rise: number) => {
      box(
        flight,
        [circulation.stairWidth, 0.35, run + 0.008],
        [0, y - 0.175, z + run / 2],
        stepMat,
        'Walking tread',
      )
      box(
        flight,
        [circulation.stairWidth, 0.025, 0.045],
        [0, y + 0.006, z + 0.022],
        edgeMat,
        'Pale stair nosing',
      )
      box(
        flight,
        [circulation.stairWidth, 0.105, 0.015],
        [0, y - rise * 0.5, z],
        stairRiser,
        'Muted red step riser',
      )
    }
    // Short run from pitch-side promenade to the first seating row.
    for (let i = 0; i < 9; i++)
      tread(
        -2.37 + (i * 2.37) / 9,
        0.2 + ((i + 1) * (bowl.baseHeight - 0.2)) / 9,
        2.37 / 9,
        (bowl.baseHeight - 0.2) / 9,
      )
    steps.forEach((s) => tread(s.depth, s.height, s.run, s.rise))
    box(
      flight,
      [circulation.portalWidth, 0.22, p1 - p0],
      [0, floor - 0.11, (p0 + p1) / 2],
      stepMat,
      'Entrance landing and recessed tunnel floor',
    )
    for (const sign of [-1, 1]) {
      box(
        flight,
        [0.23, roof - floor + 0.32, p1 - p0 + 0.18],
        [
          sign * (circulation.portalWidth / 2 + 0.115),
          (floor + roof) / 2,
          (p0 + p1) / 2,
        ],
        edgeMat,
        'Concrete portal cheek wall',
      )
      box(
        flight,
        [0.018, roof - floor - 0.24, p1 - p0 - 0.3],
        [
          sign * (circulation.portalWidth / 2 - 0.012),
          (floor + roof) / 2,
          (p0 + p1) / 2 + 0.1,
        ],
        portalRed,
        'Red inner portal return',
      )
    }
    box(
      flight,
      [circulation.portalWidth + 0.46, 0.24, p1 - p0 + 0.22],
      [0, roof + 0.08, (p0 + p1) / 2],
      edgeMat,
      'Portal lintel and upper landing',
    )
    box(
      flight,
      [circulation.portalWidth, 0.55, 0.1],
      [0, roof - 0.22, p0 - 0.06],
      portalRed,
      'Red entrance fascia',
    )
    box(
      flight,
      [circulation.portalWidth, roof - floor - 0.12, 0.13],
      [0, (floor + roof) / 2 - 0.06, p1 - 0.08],
      dark,
      'Recessed tunnel shadow',
    )
    // Thin handrails run along the clear stair edges, stopping at the portal.
    for (const [start, end] of [
      [-2.37, p0],
      [p1, bowl.rows * bowl.rowDepth],
    ] as const) {
      const height = (depth: number) =>
        depth < 0
          ? 0.2 + ((depth + 2.37) / 2.37) * (bowl.baseHeight - 0.2)
          : bowl.baseHeight + (depth / bowl.rowDepth) * bowl.rowRise
      for (const sign of [-1, 1]) {
        const x = sign * (circulation.stairWidth / 2 + 0.025)
        beam(
          flight,
          new THREE.Vector3(x, height(start) + 0.88, start),
          new THREE.Vector3(x, height(end) + 0.88, end),
          0.025,
          railMat,
        )
        const count = Math.ceil((end - start) / 1.8)
        for (let k = 0; k <= count; k++) {
          const z = THREE.MathUtils.lerp(start, end, k / count),
            y = height(z)
          beam(
            flight,
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x, y + 0.88, z),
            0.021,
            railMat,
          )
        }
      }
    }
    // Short return rails prevent an exposed edge where the narrow stair meets the wider landing.
    for (const sign of [-1, 1])
      beam(
        flight,
        new THREE.Vector3(sign * 0.8, floor + 0.9, p0),
        new THREE.Vector3(sign * 1.42, floor + 0.9, p0),
        0.026,
        railMat,
      )
  }
  group.add(
    ringMesh(
      [65, 83.5, 36.5, 18.2],
      [63.5, 82, 35, 18.2],
      concrete,
      'Upper circulation',
    ),
  )
  return group
}
