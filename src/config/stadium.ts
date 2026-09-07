// Approximate modelling dimensions, in metres. See docs/model-assumptions.md.
// Changes to the bowl envelope also require retuning cameras and secondary details.
export const stadiumDimensions = {
  pitch: { width: 68, length: 105 },
  seating: {
    rows: 31,
    rowDepth: 0.79,
    rowRise: 0.535,
    baseHeight: 1.6,
    halfWidth: 39,
    halfLength: 57.5,
    cornerRadius: 10.5,
  },
  facade: {
    halfWidth: 73,
    halfLength: 93.5,
    cornerRadius: 29.5,
    courses: 54,
    coursePitch: 0.35,
  },
  roof: {
    outer: [72.7, 93, 29, 22.1] as [number, number, number, number],
    inner: [43.5, 62.5, 13, 21.4] as [number, number, number, number],
  },
}
