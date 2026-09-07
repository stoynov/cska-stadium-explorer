// Seat-centre samples of drawn letter outlines, one glyph per bay.
// Front view of Stand V: Ц С К А. Axes are z=40,20,0,-20,-40.
export const letterBays = [30, 10, -10, -30] as const
function segment(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  width: number,
) {
  const dx = bx - ax,
    dy = by - ay,
    t = Math.max(
      0,
      Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)),
    )
  return Math.hypot(x - ax - t * dx, y - ay - t * dy) < width / 2
}
export function whiteSeat(side: number, z: number, row: number) {
  if (side !== 4) return false
  const glyph = letterBays.findIndex((center) => Math.abs(z - center) < 7.6)
  if (glyph < 0) return false
  const x = (letterBays[glyph] - z) / 15.2 + 0.5,
    y = (26 - row) / 20
  if (y < 0 || y > 1.12) return false
  if (glyph === 0)
    return (
      (y < 0.87 && ((x > 0.1 && x < 0.27) || (x > 0.73 && x < 0.9))) ||
      (y >= 0.78 && y <= 0.94 && x > 0.1 && x < 0.9) ||
      (y > 0.87 && y <= 1.1 && x > 0.76 && x < 0.93)
    )
  if (y > 1) return false
  if (glyph === 1) {
    const outer = ((x - 0.53) / 0.48) ** 2 + ((y - 0.5) / 0.5) ** 2
    const inner = ((x - 0.55) / 0.31) ** 2 + ((y - 0.5) / 0.33) ** 2
    return outer <= 1 && inner >= 1 && !(x > 0.67 && y > 0.16 && y < 0.84)
  }
  if (glyph === 2)
    return (
      (x > 0.1 && x < 0.27) ||
      segment(x, y, 0.23, 0.52, 0.86, 0.02, 0.16) ||
      segment(x, y, 0.4, 0.39, 0.89, 0.99, 0.17)
    )
  return (
    segment(x, y, 0.13, 1, 0.48, 0.02, 0.17) ||
    segment(x, y, 0.52, 0.02, 0.9, 1, 0.17) ||
    (y > 0.6 && y < 0.75 && x > 0.28 && x < 0.76)
  )
}
