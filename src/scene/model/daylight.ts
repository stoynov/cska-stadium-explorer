import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'

// Local procedural sky supplies broad outdoor reflections without external HDR downloads.
export function createDaylightEnvironment(renderer: THREE.WebGLRenderer) {
  const source = new THREE.Scene(),
    sky = new Sky()
  sky.scale.setScalar(400)
  const uniforms = sky.material.uniforms
  uniforms.turbidity.value = 3
  uniforms.rayleigh.value = 1.35
  uniforms.mieCoefficient.value = 0.003
  uniforms.sunPosition.value.set(90, 170, -85)
  uniforms.showSunDisc.value = false
  uniforms.cloudCoverage.value = 0.28
  source.add(sky)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const target = pmrem.fromScene(source, 0.04, 0.1, 1000, { size: 128 })
  sky.geometry.dispose()
  sky.material.dispose()
  pmrem.dispose()
  return target
}
