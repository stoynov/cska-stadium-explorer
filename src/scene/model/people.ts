import * as THREE from 'three'
import { seededRandom, standard } from './geometry'
import { parkPaths } from './park-layout'

export function pedestrianLayout(count = 110) {
  const rng = seededRandom(846)
  const people: {
    x: number
    z: number
    angle: number
    scale: number
    stride: number
  }[] = []
  for (
    let attempt = 0;
    people.length < count && attempt < count * 20;
    attempt++
  ) {
    const path = parkPaths[attempt % 6]
    const index = 1 + Math.floor(rng() * (path.points.length - 2))
    const p = path.points[index],
      a = path.points[index - 1],
      b = path.points[index + 1]
    const angle = Math.atan2(b.x - a.x, b.z - a.z)
    const offset = (rng() - 0.5) * Math.max(0, path.width - 1.2)
    const x = p.x + Math.cos(angle) * offset,
      z = p.z - Math.sin(angle) * offset
    if (people.some((other) => Math.hypot(other.x - x, other.z - z) < 0.85))
      continue
    people.push({
      x,
      z,
      angle: angle + (rng() > 0.5 ? Math.PI : 0),
      scale: people.length % 13 === 0 ? 0.72 : 0.9 + rng() * 0.13,
      stride:
        people.length % 4 === 0
          ? 0.025
          : (0.16 + rng() * 0.13) * (rng() > 0.5 ? 1 : -1),
    })
  }
  return people
}

// Adult local height 1.82 m; ankles and shoes remain on the paving in every pose.
export function pedestrianPose(stride: number) {
  return [-1, 1].map((side) => ({
    shoulder: new THREE.Vector3(side * 0.22, 1.43, 0),
    elbow: new THREE.Vector3(side * 0.27, 1.17, -side * stride * 0.6),
    wrist: new THREE.Vector3(side * 0.24, 0.96, -side * stride * 1.05 + 0.05),
    hip: new THREE.Vector3(side * 0.095, 0.94, 0),
    knee: new THREE.Vector3(side * 0.105, 0.52, side * stride * 0.45 + 0.04),
    ankle: new THREE.Vector3(side * 0.105, 0.1, side * stride),
  }))
}

export function buildPedestrians(layout = pedestrianLayout()) {
  const count = layout.length
  const group = new THREE.Group()
  group.name = 'Park visitors — articulated standing and walking figures'
  const material = standard('#ffffff', 0.85)
  const batches = {
    body: new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.22, 0.17, 0.51, 8),
      material,
      count,
    ),
    limbs: new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.85, 1, 1, 7),
      material,
      count * 9,
    ),
    head: new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 10, 8),
      material,
      count,
    ),
    hands: new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 7, 5),
      material,
      count * 2,
    ),
    hair: new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.48),
      material,
      count,
    ),
    boxes: new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      material,
      count * 3,
    ),
  }
  const dummy = new THREE.Object3D(),
    world = new THREE.Object3D(),
    matrix = new THREE.Matrix4()
  const up = new THREE.Vector3(0, 1, 0),
    direction = new THREE.Vector3()
  const shirts = [
    '#b62236',
    '#ece4d6',
    '#315678',
    '#a62432',
    '#71837a',
    '#cea570',
    '#44494d',
  ]
  const trousers = ['#27313a', '#344f69', '#5c605b', '#887866']
  const skins = ['#d9aa86', '#bb8865', '#edc7a9', '#8d6046']
  const hairs = ['#403029', '#65513c', '#b09a73', '#88857d']
  let limbIndex = 0
  const place = (
    batch: THREE.InstancedMesh,
    index: number,
    position: THREE.Vector3,
    scale: THREE.Vector3,
    color: string,
    rotation?: THREE.Quaternion,
  ) => {
    dummy.position.copy(position)
    dummy.scale.copy(scale)
    dummy.quaternion.copy(rotation ?? new THREE.Quaternion())
    dummy.updateMatrix()
    matrix.multiplyMatrices(world.matrix, dummy.matrix)
    batch.setMatrixAt(index, matrix)
    batch.setColorAt(index, new THREE.Color(color))
  }
  const limb = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    color: string,
  ) => {
    direction.subVectors(b, a)
    const rotation = new THREE.Quaternion().setFromUnitVectors(
      up,
      direction.clone().normalize(),
    )
    place(
      batches.limbs,
      limbIndex++,
      a.clone().add(b).multiplyScalar(0.5),
      new THREE.Vector3(radius, direction.length(), radius),
      color,
      rotation,
    )
  }
  layout.forEach((person, i) => {
    world.position.set(person.x, 0.065, person.z)
    world.rotation.set(0, person.angle, 0)
    world.scale.setScalar(person.scale)
    world.updateMatrix()
    const shirt = shirts[i % shirts.length],
      pants = trousers[i % trousers.length],
      skin = skins[i % skins.length]
    place(
      batches.body,
      i,
      new THREE.Vector3(0, 1.23, 0),
      new THREE.Vector3(1, 1, 0.62),
      shirt,
    )
    place(
      batches.boxes,
      i * 3,
      new THREE.Vector3(0, 0.96, 0),
      new THREE.Vector3(0.33, 0.19, 0.23),
      pants,
    )
    limb(
      new THREE.Vector3(0, 1.46, 0),
      new THREE.Vector3(0, 1.61, 0),
      0.058,
      skin,
    )
    place(
      batches.head,
      i,
      new THREE.Vector3(0, 1.68, 0.012),
      new THREE.Vector3(0.105, 0.14, 0.112),
      skin,
    )
    place(
      batches.hair,
      i,
      new THREE.Vector3(0, 1.69, 0.007),
      new THREE.Vector3(0.109, 0.137, 0.116),
      hairs[i % hairs.length],
    )
    pedestrianPose(person.stride).forEach((pose, side) => {
      limb(pose.shoulder, pose.elbow, 0.063, shirt)
      limb(pose.elbow, pose.wrist, 0.041, skin)
      limb(pose.hip, pose.knee, 0.082, pants)
      limb(pose.knee, pose.ankle, 0.058, pants)
      place(
        batches.hands,
        i * 2 + side,
        pose.wrist.clone().add(new THREE.Vector3(0, -0.04, 0)),
        new THREE.Vector3(0.045, 0.065, 0.032),
        skin,
      )
      place(
        batches.boxes,
        i * 3 + side + 1,
        pose.ankle
          .clone()
          .setY(0.055)
          .add(new THREE.Vector3(0, 0, 0.047)),
        new THREE.Vector3(0.13, 0.11, 0.27),
        i % 3 === 0 ? '#dfded4' : '#282b2d',
      )
    })
  })
  for (const [name, mesh] of Object.entries(batches)) {
    mesh.name = `Visitors / ${name}`
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.computeBoundingBox()
    mesh.computeBoundingSphere()
    group.add(mesh)
  }
  return group
}
