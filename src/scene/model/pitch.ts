import { stadiumDimensions } from '../../config/stadium'
import * as THREE from 'three'
import { beam, box, standard, seededRandom } from './geometry'

export function addPitch(parent: THREE.Group) {
  const pitch = new THREE.Group()
  pitch.name = 'Pitch — assumed 105 × 68 metres'
  parent.add(pitch)
  const canvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 2304
  const c = canvas.getContext('2d')!
  const dimensions = stadiumDimensions.pitch
  const w = canvas.width,
    h = canvas.height
  c.fillStyle = '#50753c'
  c.fillRect(0, 0, w, h)
  for (let i = 0; i < 20; i++) {
    c.fillStyle = i % 2 ? '#5b843f' : '#507637'
    c.fillRect(0, (i * h) / 20, w, h / 20 + 1)
  }
  const rng = seededRandom(11)
  for (let i = 0; i < 45000; i++) {
    c.fillStyle = rng() > 0.5 ? 'rgba(210,222,122,.055)' : 'rgba(15,49,17,.06)'
    c.fillRect(rng() * w, rng() * h, 2, 4)
  }
  c.save()
  c.scale(w / dimensions.width, h / dimensions.length)
  c.strokeStyle = '#e2e6ce'
  c.lineWidth = 0.13
  c.strokeRect(0.16, 0.16, 67.68, 104.68)
  c.beginPath()
  c.moveTo(0, 52.5)
  c.lineTo(68, 52.5)
  c.stroke()
  c.beginPath()
  c.arc(34, 52.5, 9.15, 0, Math.PI * 2)
  c.stroke()
  for (const z of [0, 105]) {
    const dir = z === 0 ? 1 : -1
    c.strokeRect(13.84, z, 40.32, 16.5 * dir)
    c.strokeRect(24.84, z, 18.32, 5.5 * dir)
    c.beginPath()
    c.arc(34, z + 11 * dir, 0.2, 0, Math.PI * 2)
    c.fillStyle = '#e2e6ce'
    c.fill()
    c.beginPath()
    c.arc(
      34,
      z + 11 * dir,
      9.15,
      z === 0 ? 0.64 : Math.PI + 0.64,
      z === 0 ? Math.PI - 0.64 : Math.PI * 2 - 0.64,
    )
    c.stroke()
  }
  c.beginPath()
  c.arc(34, 52.5, 0.22, 0, Math.PI * 2)
  c.fill()
  c.restore()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(dimensions.width, dimensions.length),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 1 }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.22
  mesh.receiveShadow = true
  mesh.name = 'Grass and pitch markings'
  pitch.add(mesh)
  const white = standard('#eff0e7'),
    steel = standard('#485051')
  for (const end of [-1, 1]) {
    const z = end * 52.6
    beam(
      pitch,
      new THREE.Vector3(-3.66, 0.3, z),
      new THREE.Vector3(-3.66, 2.74, z),
      0.075,
      white,
    )
    beam(
      pitch,
      new THREE.Vector3(3.66, 0.3, z),
      new THREE.Vector3(3.66, 2.74, z),
      0.075,
      white,
    )
    beam(
      pitch,
      new THREE.Vector3(-3.66, 2.74, z),
      new THREE.Vector3(3.66, 2.74, z),
      0.075,
      white,
    )
    const points: number[] = []
    for (let x = -3.66; x <= 3.67; x += 0.26)
      points.push(x, 0.3, z + end * 2, x, 2.74, z + end * 1.6)
    for (let y = 0.3; y <= 2.75; y += 0.22)
      points.push(-3.66, y, z + end * 1.8, 3.66, y, z + end * 1.8)
    const nets = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(points, 3),
      ),
      new THREE.LineBasicMaterial({
        color: '#bec7b4',
        transparent: true,
        opacity: 0.5,
      }),
    )
    nets.name = 'Goal net'
    pitch.add(nets)
    for (const x of [-36, 36]) {
      beam(
        pitch,
        new THREE.Vector3(x, 0.3, end * 53),
        new THREE.Vector3(x, 1.6, end * 53),
        0.04,
        white,
      )
      const flag = box(
        pitch,
        [0.65, 0.4, 0.03],
        [x + 0.3, 1.4, end * 53],
        standard('#bb1b31'),
      )
      flag.name = 'Corner flag'
    }
  }
  box(pitch, [0.9, 1.2, 15], [36.5, 0.8, 10], steel, 'Home dugout')
  box(pitch, [0.9, 1.2, 15], [36.5, 0.8, -10], steel, 'Away dugout')
}
