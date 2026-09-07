import { stadiumDimensions } from '../../config/stadium'
import { perimeterPoint } from './geometry'

const {
  halfWidth: w,
  halfLength: l,
  cornerRadius: r,
} = stadiumDimensions.facade
export const facadePerimeter = 4 * (w + l - 2 * r) + 2 * Math.PI * r
export const facadeBays = Math.round(facadePerimeter / 2.44)

// Stepped cutout read from the August 2026 frontal photograph, in approximate metres.
export function facadeBase(x: number, z: number) {
  if (x > w - 0.3 && Math.abs(z) < 64) {
    const a = Math.abs(z)
    if (a < 5) return 13.5
    if (a < 13) return 13.15
    if (a < 21) return 12.45
    if (a < 29) return 11.4
    if (a < 38) return 10.35
    if (a < 47) return 9.3
    if (a < 55) return 8.25
    return 6.85
  }
  if (Math.abs(z) > l - 0.3 && Math.abs(x) < 16)
    return 5.15 + Math.floor((16 - Math.abs(x)) / 5) * 0.7
  return 4.4
}

export function facadeLayout() {
  const courses = stadiumDimensions.facade.courses
  const blades = []
  for (let bay = 0; bay < facadeBays; bay++) {
    const p = perimeterPoint((bay + 0.5) / facadeBays, w, l, r)
    const base = facadeBase(p.x, p.z)
    for (let row = 0; row < courses; row++) {
      const y = 4.4 + row * stadiumDimensions.facade.coursePitch
      if (y < base) continue
      // Facade photographs show groups of slats at differing inclinations.
      // The grouped rhythm is interpretive; the installation angles are not published.
      const block = Math.floor(row / 6)
      const angle =
        25 +
        11 * Math.sin(bay * 0.39 + block * 1.7) +
        5 * Math.cos(bay * 0.91 - block)
      blades.push({ ...p, y, bay, row, angle: (angle * Math.PI) / 180 })
    }
  }
  return blades
}
