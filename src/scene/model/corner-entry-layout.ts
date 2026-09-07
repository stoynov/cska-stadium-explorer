import { stadiumDimensions } from '../../config/stadium'
import { rowSurfaceHeight, sectorALowerRows } from './seating-layout'

// The two open seams beside Sector A are visible in the supplied main-stand
// photograph. These widths/elevations are proportional estimates.
export const cornerEntries = {
  innerZ:
    stadiumDimensions.seating.halfLength -
    stadiumDimensions.seating.cornerRadius,
  outerZ: 54,
  pitchX: 35,
  exteriorX: 73.5,
  floor: 0.2,
  bridgeTop: rowSurfaceHeight(sectorALowerRows),
  bridgeThickness: 0.38,
  exteriorClearHeight: 7.2,
} as const

export function inCornerEntry(x: number, z: number, margin = 0) {
  return (
    x > 34 &&
    Math.abs(z) > cornerEntries.innerZ - margin &&
    Math.abs(z) < cornerEntries.outerZ + margin
  )
}

export function outsideCornerEntrySpans(start: number, end: number) {
  return [
    [start, Math.min(end, -cornerEntries.outerZ)],
    [
      Math.max(start, -cornerEntries.innerZ),
      Math.min(end, cornerEntries.innerZ),
    ],
    [Math.max(start, cornerEntries.outerZ), end],
  ]
    .filter(([a, b]) => b > a)
    .map(([start, end]) => ({ start, end }))
}

// Clip every tread/riser polygon at the exact straight cheek-wall boundary.
// Skipping midpoint samples alone leaves jagged fragments across the passage.
export function clipCornerEntry(side: number, polygon: number[][]) {
  if (side !== 1 && side !== 7) return polygon
  const sign = side === 1 ? 1 : -1
  const out: number[][] = []
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i],
      b = polygon[(i + 1) % polygon.length]
    const da = sign * a[2] - cornerEntries.outerZ
    const db = sign * b[2] - cornerEntries.outerZ
    if (da >= 0) out.push(a)
    if (da >= 0 !== db >= 0) {
      const t = da / (da - db)
      out.push(a.map((value, axis) => value + t * (b[axis] - value)))
    }
  }
  return out
}
