import * as THREE from 'three'
import dem from '../data/vitosha-dem.json'

// Long-axis orientation measured from OSM way 1331127486; +X points to the NW entrance.
const axis = THREE.MathUtils.degToRad(41.31335)
export function geographicPoint(
  lat: number,
  lon: number,
  elevation = dem.origin.elevation,
) {
  const north = (lat - dem.origin.lat) * 111132,
    east =
      (lon - dem.origin.lon) *
      111320 *
      Math.cos(THREE.MathUtils.degToRad(dem.origin.lat))
  return new THREE.Vector3(
    -Math.sin(axis) * east + Math.cos(axis) * north,
    elevation - dem.origin.elevation,
    Math.cos(axis) * east + Math.sin(axis) * north,
  )
}
export function landscapeHeight(x: number, z: number) {
  const east = -Math.sin(axis) * x + Math.cos(axis) * z,
    north = Math.cos(axis) * x + Math.sin(axis) * z
  const lat = dem.origin.lat + north / 111132,
    lon =
      dem.origin.lon +
      east / (111320 * Math.cos(THREE.MathUtils.degToRad(dem.origin.lat)))
  const gx = THREE.MathUtils.clamp(
    ((lon - dem.bounds.west) / (dem.bounds.east - dem.bounds.west)) *
      (dem.cols - 1),
    0,
    dem.cols - 1.001,
  )
  const gy = THREE.MathUtils.clamp(
    ((dem.bounds.north - lat) / (dem.bounds.north - dem.bounds.south)) *
      (dem.rows - 1),
    0,
    dem.rows - 1.001,
  )
  const ix = Math.floor(gx),
    iy = Math.floor(gy),
    fx = gx - ix,
    fy = gy - iy
  const at = (a: number, b: number) => dem.heights[b * dem.cols + a]
  const elevation = THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(at(ix, iy), at(ix + 1, iy), fx),
    THREE.MathUtils.lerp(at(ix, iy + 1), at(ix + 1, iy + 1), fx),
    fy,
  )
  return THREE.MathUtils.lerp(
    -0.3,
    elevation - dem.origin.elevation,
    THREE.MathUtils.smoothstep(Math.hypot(x, z), 350, 1050),
  )
}

// Cache the same blended vertex elevations used by buildVitosha. Bilinear DEM
// interpolation differs by metres from its rendered triangle planes on hills.
const surfaceHeights = dem.heights.map((height, index) => {
  const col = index % dem.cols,
    row = Math.floor(index / dem.cols)
  const p = geographicPoint(
    THREE.MathUtils.lerp(
      dem.bounds.north,
      dem.bounds.south,
      row / (dem.rows - 1),
    ),
    THREE.MathUtils.lerp(
      dem.bounds.west,
      dem.bounds.east,
      col / (dem.cols - 1),
    ),
    height,
  )
  return THREE.MathUtils.lerp(
    -0.3,
    p.y,
    THREE.MathUtils.smoothstep(Math.hypot(p.x, p.z), 350, 1050),
  )
})

/** Ground elevation on the actual terrain triangles, including local blending. */
export function terrainHeight(x: number, z: number) {
  const east = -Math.sin(axis) * x + Math.cos(axis) * z
  const north = Math.cos(axis) * x + Math.sin(axis) * z
  const lat = dem.origin.lat + north / 111132
  const lon =
    dem.origin.lon +
    east / (111320 * Math.cos(THREE.MathUtils.degToRad(dem.origin.lat)))
  const gx = THREE.MathUtils.clamp(
    ((lon - dem.bounds.west) / (dem.bounds.east - dem.bounds.west)) *
      (dem.cols - 1),
    0,
    dem.cols - 1.000001,
  )
  const gy = THREE.MathUtils.clamp(
    ((dem.bounds.north - lat) / (dem.bounds.north - dem.bounds.south)) *
      (dem.rows - 1),
    0,
    dem.rows - 1.000001,
  )
  const ix = Math.floor(gx),
    iy = Math.floor(gy),
    fx = gx - ix,
    fy = gy - iy
  const at = (dx: number, dy: number) =>
    surfaceHeights[(iy + dy) * dem.cols + ix + dx]
  return fx + fy <= 1
    ? at(0, 0) * (1 - fx - fy) + at(1, 0) * fx + at(0, 1) * fy
    : at(1, 1) * (fx + fy - 1) + at(0, 1) * (1 - fx) + at(1, 0) * (1 - fy)
}
