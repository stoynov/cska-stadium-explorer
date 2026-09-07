import { stadiumDimensions } from '../../config/stadium'

const bowl = stadiumDimensions.seating
// Sector A is the entrance (+X) stand. Its upper profile is occupied by lounges.
export const sectorALowerRows = 16
export function seatingRows(side: number) {
  return side === 0 ? sectorALowerRows : bowl.rows
}
export const circulation = {
  stairWidth: 1.55,
  portalWidth: 3.0,
  portalStart: 7 * bowl.rowDepth,
  portalEnd: 12 * bowl.rowDepth,
  subdivisions: 3,
  seatMargin: 0.28,
}
export interface BowlPoint {
  x: number
  z: number
  nx: number
  nz: number
}
export interface AisleAxis {
  side: number
  station: number
}
export const aisleAxes: AisleAxis[] = [
  ...[0, 4].flatMap((side) =>
    [-40, -20, 0, 20, 40].map((station) => ({ side, station })),
  ),
  ...[2, 6].flatMap((side) =>
    [-20, 0, 20].map((station) => ({ side, station })),
  ),
  // Move the two adjacent corner stairs away from the open Sector A seams,
  // including the width of their pitch-side approach flights.
  ...[1, 3, 5, 7].map((side) => ({
    side,
    station: ((side === 1 ? 65 : side === 7 ? 25 : 45) * Math.PI) / 180,
  })),
]

// Unlike normalized perimeter distance, straight-side stations cannot drift as rows expand.
export function bowlPoint(
  side: number,
  station: number,
  depth: number,
): BowlPoint {
  const w = bowl.halfWidth + depth,
    l = bowl.halfLength + depth,
    r = bowl.cornerRadius + depth
  if (side === 0) return { x: w, z: station, nx: 1, nz: 0 }
  if (side === 2) return { x: station, z: l, nx: 0, nz: 1 }
  if (side === 4) return { x: -w, z: station, nx: -1, nz: 0 }
  if (side === 6) return { x: station, z: -l, nx: 0, nz: -1 }
  const quadrant = (side - 1) / 2,
    angle = (quadrant * Math.PI) / 2 + station
  const cx =
    (quadrant === 0 || quadrant === 3 ? 1 : -1) *
    (bowl.halfWidth - bowl.cornerRadius)
  const cz = (quadrant < 2 ? 1 : -1) * (bowl.halfLength - bowl.cornerRadius)
  return {
    x: cx + Math.cos(angle) * r,
    z: cz + Math.sin(angle) * r,
    nx: Math.cos(angle),
    nz: Math.sin(angle),
  }
}
export function sideExtent(side: number, depth: number) {
  if (side % 2) return Math.PI / 2
  return (
    2 *
    ((side === 0 || side === 4 ? bowl.halfLength : bowl.halfWidth) -
      bowl.cornerRadius)
  )
}
export function sideStation(side: number, t: number) {
  return side % 2 ? (t * Math.PI) / 2 : (t - 0.5) * sideExtent(side, 0)
}
export function circulationAt(point: BowlPoint, depth: number, margin = 0) {
  const portal =
    depth >= circulation.portalStart - 1e-5 &&
    depth < circulation.portalEnd - 1e-5
  const width = portal
    ? circulation.portalWidth + 0.42
    : circulation.stairWidth + 0.12
  for (const axis of aisleAxes) {
    const a = bowlPoint(axis.side, axis.station, depth)
    if (Math.hypot(point.x - a.x, point.z - a.z) < width / 2 + margin)
      return { axis, kind: portal ? ('portal' as const) : ('stair' as const) }
  }
}
export function rowSurfaceHeight(row: number) {
  return bowl.baseHeight + row * bowl.rowRise
}
export function stairTreads(rows = bowl.rows) {
  const result: { depth: number; height: number; rise: number; run: number }[] =
    []
  const run = bowl.rowDepth / circulation.subdivisions,
    rise = bowl.rowRise / circulation.subdivisions
  for (let i = 0; i < rows * circulation.subdivisions; i++) {
    const depth = i * run
    if (
      depth >= circulation.portalStart - 1e-5 &&
      depth < circulation.portalEnd - 1e-5
    )
      continue
    result.push({ depth, height: bowl.baseHeight + (i + 1) * rise, rise, run })
  }
  return result
}
