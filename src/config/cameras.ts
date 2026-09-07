import * as THREE from 'three'
const presets = [
  { position: [195, 92, 205], target: [0, 38, 0], fov: 42 },
  { position: [22, 26, 10], target: [-43, 9, 0], fov: 52 },
  { position: [22, 3.4, 37], target: [-24, 10, -25], fov: 64 },
  { position: [185, 36, 84], target: [39, 11, 0], fov: 44 },
  { position: [330, 160, 365], target: [0, 26, 0], fov: 46 },
]
export function cameraPreset(chapter: number, aspect: number) {
  const p = presets[chapter],
    target = new THREE.Vector3(...p.target),
    position = new THREE.Vector3(...p.position)
  if (chapter !== 2 && chapter !== 1 && aspect < 1.35) {
    position
      .sub(target)
      .multiplyScalar(Math.min(2.1, 1.35 / aspect))
      .add(target)
  }
  if (chapter === 1 && aspect < 0.8)
    position.sub(target).multiplyScalar(1.4).add(target)
  return { position, target, fov: p.fov }
}
