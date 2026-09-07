import { assets } from '../../config/assets'
import { stadiumDimensions } from '../../config/stadium'
import * as THREE from 'three'
import { ringMesh, perimeterPoint, standard, box } from './geometry'
import {
  facadeBase,
  facadeBays,
  facadeLayout,
  facadePerimeter,
} from './facade-layout'

export function addFacade(parent: THREE.Group) {
  const envelope = stadiumDimensions.facade
  const facade = new THREE.Group()
  facade.name = 'Segmented champagne metal louvers and glazed entrance'
  parent.add(facade)
  // Approximate daylight finish from the photos, not a certified RAL colour.
  const champagne = standard('#cfbb97', 0.42, 0.38),
    edge = standard('#ded5c2', 0.38, 0.5),
    dark = standard('#33393c', 0.85),
    structure = standard('#858887', 0.62, 0.35)
  champagne.envMapIntensity = 1.5
  edge.envMapIntensity = 3
  const moduleWidth = facadePerimeter / facadeBays
  const dummy = new THREE.Object3D()

  // Individual solid profiles, with real open gaps and separate module joints.
  const blades = facadeLayout()
  const louvers = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.38, 0.055, moduleWidth - 0.035),
    champagne,
    blades.length,
  )
  const tilt = new THREE.Quaternion(),
    axis = new THREE.Vector3(0, 0, 1)
  blades.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z)
    dummy.rotation.set(0, -Math.atan2(p.nz, p.nx), 0)
    tilt.setFromAxisAngle(axis, -p.angle)
    dummy.quaternion.multiply(tilt)
    dummy.updateMatrix()
    louvers.setMatrixAt(i, dummy.matrix)
  })
  louvers.name = 'Individually tilted metal louver modules'
  louvers.userData = {
    nominalModuleLength: 2.44,
    approximateFinish: 'Warm champagne metal; no RAL verified',
  }
  // The profiles themselves provide shade contrast; tiny shadow-map samples cause moiré.
  louvers.castShadow = false
  louvers.receiveShadow = false
  facade.add(louvers)

  for (let bay = 0; bay < facadeBays; bay++) {
    const t = (bay + 0.5) / facadeBays
    const p = perimeterPoint(
      t,
      envelope.halfWidth,
      envelope.halfLength,
      envelope.cornerRadius,
    )
    const base = facadeBase(p.x, p.z)
    const rail = box(
      facade,
      [0.12, 23.1 - base, 0.07],
      [p.x - p.nx * 0.3, (base + 23.1) / 2, p.z - p.nz * 0.3],
      edge,
      'Vertical louver carrier',
    )
    rail.rotation.y = -Math.atan2(p.nz, p.nx)
    // Leave the broad entrance glazing visible, including between the upper slats.
    if (!(p.x > 72.5 && Math.abs(p.z) < 64)) {
      const wall = box(
        facade,
        [0.14, 18.5, moduleWidth + 0.02],
        [p.x - p.nx * 1.3, 13.85, p.z - p.nz * 1.3],
        dark,
        'Recessed charcoal envelope',
      )
      wall.rotation.y = -Math.atan2(p.nz, p.nx)
    }
    if (bay % 3 === 0 && !(p.x > 72.5 && Math.abs(p.z) < 64)) {
      const column = box(
        facade,
        [0.25, 22.6, 0.25],
        [p.x - p.nx * 1.5, 11.5, p.z - p.nz * 1.5],
        structure,
        'Recessed structural column',
      )
      column.rotation.y = -Math.atan2(p.nz, p.nx)
    }
  }
  facade.add(
    ringMesh(
      [73.3, 93.8, 29.8, 23.15],
      [72.6, 93.1, 29.1, 23.15],
      edge,
      'Pale metal crown flashing',
    ),
  )

  // A continuous mullion/transom grid behind the stepped louver arch.
  const glassTints = ['#718d96', '#647f88', '#789099'].map((color) => {
    const material = standard(color, 0.15, 0.65)
    material.envMapIntensity = 5
    return material
  })
  const mullion = standard('#303b40', 0.4, 0.65),
    doorFrame = standard('#9ba6a8', 0.3, 0.8)
  for (let col = 0; col < 40; col++) {
    const z = -62 + (col + 0.5) * 3.1
    for (let row = 0; row < 9; row++) {
      const pane = box(
        facade,
        [0.12, 2.35, 3.04],
        [71.95, 1.25 + row * 2.4, z],
        glassTints[(col * 7 + row * 2) % 3],
        'Blue-grey entrance glazing',
      )
      pane.castShadow = false
    }
    box(
      facade,
      [0.2, 21.6, 0.065],
      [72.05, 10.9, z - 1.55],
      mullion,
      'Curtain wall mullion',
    )
  }
  for (let row = 0; row <= 9; row++)
    box(
      facade,
      [0.2, 0.065, 124],
      [72.05, 0.05 + row * 2.4, 0],
      mullion,
      'Curtain wall transom',
    )
  for (const z of [-37.2, -12.4, 12.4, 37.2]) {
    for (const offset of [-0.7, 0.7]) {
      box(
        facade,
        [0.16, 2.8, 1.32],
        [72.18, 1.45, z + offset],
        glassTints[0],
        'Entrance door',
      )
      for (const side of [-0.66, 0.66])
        box(
          facade,
          [0.22, 2.85, 0.06],
          [72.25, 1.45, z + offset + side],
          doorFrame,
        )
      box(facade, [0.23, 0.07, 1.38], [72.25, 2.88, z + offset], doorFrame)
      box(
        facade,
        [0.11, 0.6, 0.04],
        [72.45, 1.4, z + offset * 0.18],
        doorFrame,
        'Door pull',
      )
    }
  }
  // The current photograph shows the club crest on the glass, without a large plaque.
  const crestTexture = new THREE.TextureLoader().load(assets.crest)
  crestTexture.colorSpace = THREE.SRGBColorSpace
  const crest = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 4.85),
    new THREE.MeshStandardMaterial({
      map: crestTexture,
      transparent: true,
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
  )
  crest.position.set(72.3, 10.7, 0)
  crest.rotation.y = Math.PI / 2
  crest.name = 'CSKA crest on entrance glass'
  facade.add(crest)
  return facade
}
