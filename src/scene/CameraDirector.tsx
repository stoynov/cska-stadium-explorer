import { towerLocation, landscapeHeight } from './model/sofia-landscape'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as THREE from 'three'
import { cameraPreset } from '../config/cameras'

interface Props {
  focusTower: number
  chapter: number
  request: number
  cancel: number
  reduced: boolean
  onManual: () => void
  onSettled: () => void
}
export function CameraDirector({
  focusTower,
  chapter,
  request,
  cancel,
  reduced,
  onManual,
  onSettled,
}: Props) {
  const { camera, gl, size } = useThree()
  const controls = useRef<OrbitControls | null>(null)
  const callbacks = useRef({ onManual, onSettled })
  callbacks.current = { onManual, onSettled }
  const manualMode = useRef(false),
    lastRequest = useRef('')
  const motion = useRef<{
    from: THREE.Vector3
    to: THREE.Vector3
    targetFrom: THREE.Vector3
    targetTo: THREE.Vector3
    fovFrom: number
    fovTo: number
    elapsed: number
  } | null>(null)
  useEffect(() => {
    motion.current = null
    manualMode.current = true
  }, [cancel])
  useEffect(() => {
    const control = new OrbitControls(camera, gl.domElement)
    control.enableDamping = true
    control.dampingFactor = 0.09
    control.enablePan = false
    control.minDistance = 4
    control.maxDistance = 1100
    control.maxPolarAngle = Math.PI * 0.58
    control.minPolarAngle = 0.13
    control.rotateSpeed = 0.55
    control.zoomSpeed = 0.65
    const manual = () => {
      motion.current = null
      manualMode.current = true
      callbacks.current.onManual()
    }
    control.addEventListener('start', manual)
    controls.current = control
    return () => {
      control.removeEventListener('start', manual)
      control.dispose()
      controls.current = null
    }
  }, [camera, gl])
  useEffect(() => {
    if (!controls.current) return
    const key = `${chapter}:${request}:${focusTower}`
    if (lastRequest.current === key && manualMode.current) return
    lastRequest.current = key
    manualMode.current = false
    controls.current.enableDamping = false
    controls.current.update()
    controls.current.enableDamping = true
    const destination = cameraPreset(chapter, size.width / size.height)
    if (focusTower) {
      destination.target.copy(towerLocation)
      destination.target.y =
        landscapeHeight(towerLocation.x, towerLocation.z) + 54
      destination.position
        .copy(destination.target)
        .add(
          new THREE.Vector3(120, 35, 140).multiplyScalar(
            size.width / size.height < 0.8 ? 1.6 : 1,
          ),
        )
      destination.fov = 42
    }
    const perspective = camera as THREE.PerspectiveCamera
    motion.current = {
      from: camera.position.clone(),
      to: destination.position,
      targetFrom: controls.current.target.clone(),
      targetTo: destination.target,
      fovFrom: perspective.fov,
      fovTo: destination.fov,
      elapsed: 0,
    }
  }, [chapter, request, focusTower, size.width, size.height, camera])
  useFrame((_, delta) => {
    const control = controls.current
    if (!control) return
    const m = motion.current
    if (m) {
      m.elapsed += Math.min(delta, 0.05)
      const progress = reduced ? 1 : Math.min(1, m.elapsed / 1.8),
        smooth = progress * progress * (3 - 2 * progress)
      camera.position.lerpVectors(m.from, m.to, smooth)
      control.target.lerpVectors(m.targetFrom, m.targetTo, smooth)
      const perspective = camera as THREE.PerspectiveCamera
      perspective.fov = THREE.MathUtils.lerp(m.fovFrom, m.fovTo, smooth)
      perspective.updateProjectionMatrix()
      camera.lookAt(control.target)
      if (progress === 1) {
        motion.current = null
        control.update()
        callbacks.current.onSettled()
      }
    } else {
      control.update()
      if (camera.position.y < 1.1) {
        camera.position.y = 1.1
        camera.lookAt(control.target)
      }
    }
  })
  return null
}
