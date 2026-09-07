import { stadiumDimensions } from '../../config/stadium'
import { rowSurfaceHeight, sectorALowerRows } from './seating-layout'

// Corner placement follows the supplied photograph. Angle, width and
// elevations are proportional estimates, not a surveyed circulation plan.
export const cornerEntries = {
  centreX:
    stadiumDimensions.seating.halfWidth -
    stadiumDimensions.seating.cornerRadius,
  centreZ:
    stadiumDimensions.seating.halfLength -
    stadiumDimensions.seating.cornerRadius,
  halfWidth: 3.5,
  pitchRadius: 8,
  exteriorRadius: 53.5,
  floor: 0.2,
  bridgeTop: rowSurfaceHeight(sectorALowerRows),
  bridgeThickness: 0.38,
  exteriorClearHeight: 7.2,
} as const

export function cornerEntryPoint(
  sign: number,
  radius: number,
  transverse: number,
) {
  return {
    x: cornerEntries.centreX + (radius - transverse) * Math.SQRT1_2,
    z: sign * (cornerEntries.centreZ + (radius + transverse) * Math.SQRT1_2),
  }
}

export function cornerEntryOffset(x: number, z: number) {
  return (
    (Math.abs(z) - cornerEntries.centreZ - (x - cornerEntries.centreX)) *
    Math.SQRT1_2
  )
}

export function inCornerEntry(x: number, z: number, margin = 0) {
  return (
    x > cornerEntries.centreX &&
    Math.abs(z) > cornerEntries.centreZ &&
    Math.abs(cornerEntryOffset(x, z)) < cornerEntries.halfWidth + margin
  )
}

export function clipEntryEdge(
  polygon: number[][],
  sign: number,
  edge: number,
  keepMainSide: boolean,
) {
  const distance = (p: number[]) =>
    ((sign * p[2] - cornerEntries.centreZ - (p[0] - cornerEntries.centreX)) *
      Math.SQRT1_2 -
      edge) *
    (keepMainSide ? -1 : 1)
  const out: number[][] = []
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i],
      b = polygon[(i + 1) % polygon.length]
    const da = distance(a),
      db = distance(b)
    if (da >= 0) out.push(a)
    if (da >= 0 !== db >= 0) {
      const t = da / (da - db)
      out.push(a.map((value, axis) => value + t * (b[axis] - value)))
    }
  }
  return out
}

export function clipCornerEntry(
  side: number,
  polygon: number[][],
  retainLowerCorner = true,
) {
  if (side !== 1 && side !== 7) return [polygon]
  const sign = side === 1 ? 1 : -1
  return [
    ...(retainLowerCorner
      ? [clipEntryEdge(polygon, sign, -cornerEntries.halfWidth, true)]
      : []),
    clipEntryEdge(polygon, sign, cornerEntries.halfWidth, false),
  ].filter((part) => part.length >= 3)
}

// Clip facade modules along their own tangent, so the openings follow the
// diagonal passage at the rounded corners instead of cutting the main glass.
export function outsideCornerEntrySpans(
  x: number,
  z: number,
  tx: number,
  tz: number,
  halfLength: number,
) {
  if (x < cornerEntries.centreX || Math.abs(z) < cornerEntries.centreZ)
    return [{ start: -halfLength, end: halfLength }]
  const offset = cornerEntryOffset(x, z)
  const slope = ((z < 0 ? -tz : tz) - tx) * Math.SQRT1_2
  if (Math.abs(slope) < 1e-6)
    return Math.abs(offset) < cornerEntries.halfWidth
      ? []
      : [{ start: -halfLength, end: halfLength }]
  const cuts = [
    (-cornerEntries.halfWidth - offset) / slope,
    (cornerEntries.halfWidth - offset) / slope,
  ].sort((a, b) => a - b)
  return [
    [-halfLength, Math.min(halfLength, cuts[0])],
    [Math.max(-halfLength, cuts[1]), halfLength],
  ]
    .filter(([a, b]) => b > a)
    .map(([start, end]) => ({ start, end }))
}
