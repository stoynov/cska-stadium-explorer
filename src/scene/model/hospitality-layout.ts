import { stadiumDimensions } from '../../config/stadium'
import {
  aisleAxes,
  circulation,
  rowSurfaceHeight,
  sectorALowerRows,
} from './seating-layout'

// Photo-based envelope, not surveyed dimensions. Counts/terrace types follow
// the official 29 Jan 2026 Sector A article (factSources.hospitality).
export const hospitalityLayout = {
  frontX:
    stadiumDimensions.seating.halfWidth +
    sectorALowerRows * stadiumDimensions.seating.rowDepth,
  glassX: 55.6,
  roomBackX: 63.4,
  backX: 69.8,
  halfLength:
    stadiumDimensions.seating.halfLength -
    stadiumDimensions.seating.cornerRadius,
  slabThickness: 0.24,
  levels: [
    {
      name: 'Silver',
      floor: rowSurfaceHeight(sectorALowerRows),
      ceiling: 13.26,
    },
    { name: 'Gold', floor: 13.5, ceiling: 16.76 },
    { name: 'Platinum', floor: 17, ceiling: 20.5 },
  ],
} as const

export interface SkyboxLayout {
  level: 'Gold' | 'Platinum'
  index: number
  zMin: number
  zMax: number
  floor: number
  ceiling: number
  seatsPerRow: number
}

export function skyboxLayout(): SkyboxLayout[] {
  const result: SkyboxLayout[] = []
  let z = -46.55
  for (let i = 0; i < 20; i++) {
    const width = i === 0 || i === 19 ? 6.5 : 4.45
    result.push({
      level: 'Gold',
      index: i,
      zMin: z,
      zMax: z + width,
      floor: 13.5,
      ceiling: 16.76,
      seatsPerRow: width > 6 ? 9 : 6,
    })
    z += width
  }
  for (let i = 0; i < 8; i++)
    result.push({
      level: 'Platinum',
      index: i,
      zMin: -26 + i * 6.5,
      zMax: -26 + (i + 1) * 6.5,
      floor: 17,
      ceiling: 20.5,
      seatsPerRow: 6,
    })
  return result
}

export function terraceSeats(box: SkyboxLayout) {
  return [0, 1].flatMap((row) =>
    Array.from({ length: box.seatsPerRow }, (_, col) => ({
      x: 52.7 + row,
      z:
        box.zMin +
        (box.zMax - box.zMin - (box.seatsPerRow - 1) * 0.62) / 2 +
        col * 0.62,
      floor: box.floor + row * 0.18,
    })),
  )
}

export function balconyGuardSpans(level: string) {
  const spans: { start: number; end: number }[] = []
  let start = -hospitalityLayout.halfLength
  if (level === 'Silver') {
    for (const axis of aisleAxes.filter((axis) => axis.side === 0)) {
      const gap = circulation.stairWidth / 2 + 0.15
      spans.push({ start, end: axis.station - gap })
      start = axis.station + gap
    }
  }
  spans.push({ start, end: hospitalityLayout.halfLength })
  return spans
}
