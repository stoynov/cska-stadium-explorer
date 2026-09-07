import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { box, standard } from './geometry'
import {
  hospitalityLayout as h,
  skyboxLayout,
  terraceSeats,
  balconyGuardSpans,
} from './hospitality-layout'
import { factSources } from '../../config/fact-sources'

export function addHospitality(parent: THREE.Group) {
  const group = new THREE.Group()
  group.name = 'Sector A — Bronze, Silver, Gold and Platinum'
  group.userData = {
    source: factSources.hospitality.url,
    interpretation:
      'Approximate west/entrance stand; Bronze flanks and Silver central lower seats; Gold and Platinum glazed boxes with external terraces',
    dimensions:
      'Photographic proportions, not surveyed room plans or seating capacity',
  }
  parent.add(group)
  const pale = standard('#d8d9d4', 0.75),
    floor = standard('#a1a6a2', 0.86),
    frame = standard('#303b3e', 0.38, 0.6),
    interior = standard('#252b2b', 0.94),
    divider = standard('#727b79', 0.68),
    seat = standard('#701b2c', 0.6),
    cushion = new RoundedBoxGeometry(0.53, 0.13, 0.5, 1, 0.045),
    back = new RoundedBoxGeometry(0.55, 0.48, 0.1, 1, 0.045)
  const glass = ['#334a4c', '#3c5253', '#304346'].map((color) => {
    const mat = standard(color, 0.19, 0.48)
    mat.envMapIntensity = 1.6
    return mat
  })
  const slab = (y: number, name: string) => {
    box(
      group,
      [h.backX - h.frontX, h.slabThickness, h.halfLength * 2],
      [(h.frontX + h.backX) / 2, y - h.slabThickness / 2, 0],
      floor,
      name,
    )
    box(
      group,
      [0.24, 0.34, h.halfLength * 2],
      [h.frontX + 0.12, y - 0.1, 0],
      pale,
      'Pale continuous balcony slab edge',
    )
  }
  const glazing = (
    owner: THREE.Group,
    zMin: number,
    zMax: number,
    y: number,
    ceiling: number,
  ) => {
    const panels = Math.ceil((zMax - zMin) / 2.25),
      width = (zMax - zMin) / panels
    for (let i = 0; i < panels; i++) {
      const z = zMin + (i + 0.5) * width
      const pane = box(
        owner,
        [0.08, ceiling - y - 0.22, width - 0.065],
        [h.glassX, (ceiling + y) / 2, z],
        glass[i % glass.length],
        'Pitch-facing hospitality glazing',
      )
      pane.castShadow = false
      box(
        owner,
        [0.14, ceiling - y, 0.065],
        [h.glassX - 0.04, (ceiling + y) / 2, zMin + i * width],
        frame,
        'Glazing mullion',
      )
    }
    for (const height of [y + 0.1, ceiling - 0.1])
      box(
        owner,
        [0.14, 0.07, zMax - zMin],
        [h.glassX - 0.04, height, (zMin + zMax) / 2],
        frame,
        'Glazing transom',
      )
  }
  for (const level of h.levels) {
    slab(level.floor, 'Terrace supporting slab')
    box(
      group,
      [0.2, level.ceiling - level.floor, h.halfLength * 2],
      [h.backX - 0.1, (level.floor + level.ceiling) / 2, 0],
      interior,
      'Rear common circulation wall',
    )
    // A low open guard reads as a terrace, with the tall glazed wall recessed behind.
    for (const span of balconyGuardSpans(level.name)) {
      box(
        group,
        [0.065, 0.065, span.end - span.start],
        [h.frontX + 0.18, level.floor + 1.02, (span.start + span.end) / 2],
        frame,
        'Balcony guard top rail',
      )
      const posts = Math.ceil((span.end - span.start) / 2.3)
      for (let i = 0; i <= posts; i++)
        box(
          group,
          [0.045, 1.02, 0.045],
          [
            h.frontX + 0.18,
            level.floor + 0.51,
            THREE.MathUtils.lerp(
              span.start + 0.025,
              span.end - 0.025,
              i / posts,
            ),
          ],
          frame,
          'Balcony guard upright',
        )
    }
    for (const sign of [-1, 1]) {
      // Silver's open terrace continues onto the corner gallery. Only the
      // recessed room keeps an end wall; the walking strip must remain open.
      const returnFront = level.name === 'Silver' ? h.glassX : h.frontX
      box(
        group,
        [h.backX - returnFront, level.ceiling - level.floor, 0.18],
        [
          (returnFront + h.backX) / 2,
          (level.floor + level.ceiling) / 2,
          sign * (h.halfLength - 0.09),
        ],
        pale,
        'Hospitality end return',
      )
    }
    if (level.name === 'Silver')
      glazing(group, -46.4, 46.4, level.floor, level.ceiling)
    if (level.name === 'Platinum') {
      glazing(group, -46.4, -26, level.floor, level.ceiling)
      glazing(group, 26, 46.4, level.floor, level.ceiling)
    }
  }
  slab(20.74, 'Hospitality roof slab below main canopy')
  for (const b of skyboxLayout()) {
    const room = new THREE.Group()
    room.name = `${b.level} skybox ${b.index + 1}`
    room.userData = {
      skybox: true,
      level: b.level,
      terraceSeats: b.seatsPerRow * 2,
    }
    group.add(room)
    glazing(room, b.zMin, b.zMax, b.floor, b.ceiling)
    const width = b.zMax - b.zMin,
      centre = (b.zMin + b.zMax) / 2
    box(
      room,
      [0.16, b.ceiling - b.floor, width],
      [h.roomBackX, (b.floor + b.ceiling) / 2, centre],
      interior,
      'Skybox rear wall — common corridor beyond',
    )
    for (const z of [b.zMin, b.zMax]) {
      box(
        room,
        [h.roomBackX - h.glassX, b.ceiling - b.floor, 0.075],
        [(h.glassX + h.roomBackX) / 2, (b.floor + b.ceiling) / 2, z],
        divider,
        'Skybox room partition',
      )
      box(
        room,
        [h.glassX - h.frontX - 0.22, 0.8, 0.045],
        [(h.frontX + h.glassX) / 2, b.floor + 0.4, z],
        frame,
        'Private terrace divider',
      )
    }
    box(
      room,
      [1.15, 0.18, width - 0.16],
      [53.65, b.floor + 0.09, centre],
      floor,
      'Premium rear row platform',
    )
    for (const s of terraceSeats(b)) {
      const pan = new THREE.Mesh(cushion, seat)
      pan.name = 'Premium terrace seat pan'
      pan.position.set(s.x, s.floor + 0.37, s.z)
      pan.rotation.y = -Math.PI / 2
      room.add(pan)
      const shell = new THREE.Mesh(back, seat)
      shell.name = 'Padded premium seat back'
      shell.position.set(s.x + 0.23, s.floor + 0.65, s.z)
      shell.rotation.y = -Math.PI / 2
      room.add(shell)
      box(
        room,
        [0.2, 0.3, 0.12],
        [s.x, s.floor + 0.15, s.z],
        frame,
        'Premium chair pedestal',
      )
      for (const sign of [-1, 1])
        box(
          room,
          [0.45, 0.055, 0.05],
          [s.x, s.floor + 0.56, s.z + sign * 0.27],
          frame,
          'Premium armrest',
        )
    }
  }
  return group
}
