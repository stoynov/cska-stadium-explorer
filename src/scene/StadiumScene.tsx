import { buildSofiaLandscape } from './model/sofia-landscape'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { buildStadium } from './model/stadium'
import { buildPark } from './model/park'
import { createDaylightEnvironment } from './model/daylight'
import { disposeGroup } from './model/geometry'
import { CameraDirector } from './CameraDirector'
import type { ViewerState } from '../state/viewer'
import type { Copy } from '../content'

export interface SceneHandle {
  capture: () => Promise<Blob>
  exportModel: () => Promise<ArrayBuffer>
}
interface Props {
  state: ViewerState
  copy: Copy
  reduced: boolean
  onManual: () => void
  onSettled: () => void
  onReady: () => void
  onFailure: () => void
  paused: boolean
  focusTower: number
}

function World({
  state,
  copy,
  reduced,
  onManual,
  onSettled,
  onReady,
  onFailure,
  api,
  compact,
  focusTower,
}: Props & { api: React.RefObject<SceneHandle | null>; compact: boolean }) {
  const stadium = useMemo(() => buildStadium(), []),
    park = useMemo(() => buildPark(compact), [compact]),
    landscape = useMemo(() => buildSofiaLandscape({ compact }), [compact])
  const { gl, scene, camera } = useThree(),
    sun = useRef<THREE.DirectionalLight>(null),
    fill = useRef<THREE.HemisphereLight>(null),
    pitchLight = useRef<THREE.PointLight>(null)
  useEffect(() => {
    const environment = createDaylightEnvironment(gl)
    scene.environment = environment.texture
    return () => {
      scene.environment = null
      environment.dispose()
    }
  }, [gl, scene])
  const blend = useRef(0),
    ready = useRef(false)
  useEffect(
    () => () => {
      disposeGroup(stadium.root)
      disposeGroup(park)
      disposeGroup(landscape)
    },
    [stadium, park, landscape],
  )
  useEffect(() => {
    api.current = {
      capture: async () => {
        gl.render(scene, camera)
        return new Promise<Blob>((resolve, reject) =>
          gl.domElement.toBlob(
            (blob) =>
              blob ? resolve(blob) : reject(new Error('Canvas capture failed')),
            'image/png',
          ),
        )
      },
      exportModel: async () => {
        const { exportStadium } = await import('../services/export')
        return exportStadium(stadium.root)
      },
    }
    const lost = (e: Event) => {
      e.preventDefault()
      onFailure()
    }
    gl.domElement.addEventListener('webglcontextlost', lost)
    return () => {
      api.current = null
      gl.domElement.removeEventListener('webglcontextlost', lost)
    }
  }, [api, gl, scene, camera, stadium, onFailure])
  useEffect(() => {
    stadium.roof.visible = !state.cutaway
  }, [stadium, state.cutaway])
  const dayColor = useMemo(() => new THREE.Color('#afc9dc'), []),
    nightColor = useMemo(() => new THREE.Color('#14252e'), [])
  useFrame((_, delta) => {
    if (!ready.current) {
      ready.current = true
      onReady()
    }
    blend.current = reduced
      ? Number(state.night)
      : THREE.MathUtils.damp(blend.current, Number(state.night), 3, delta)
    const b = blend.current
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(2.5, 0.3, b)
      sun.current.color.set(b > 0.5 ? '#a0bacb' : '#fff6ec')
    }
    if (fill.current)
      fill.current.intensity = THREE.MathUtils.lerp(1.45, 0.5, b)
    if (pitchLight.current)
      pitchLight.current.intensity = THREE.MathUtils.lerp(0, 1100, b)
    scene.environmentIntensity = THREE.MathUtils.lerp(0.055, 0.008, b)
    stadium.emissive.emissiveIntensity = b * 4
    const terrainMaterial = (landscape.children[0] as THREE.Mesh)
      .material as THREE.MeshBasicMaterial
    terrainMaterial.color.setRGB(
      THREE.MathUtils.lerp(1, 0.13, b),
      THREE.MathUtils.lerp(1, 0.18, b),
      THREE.MathUtils.lerp(1, 0.25, b),
    )
    const bg = scene.background as THREE.Color
    bg.copy(dayColor).lerp(nightColor, b)
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(bg)
  })
  const labelData: [number, number, number][] = [
    [74, 14, -15],
    [46, 25, 28],
    [-58, 15, 0],
    [0, 0.5, 0],
  ]
  return (
    <>
      <color attach="background" args={['#afc9dc']} />
      <fog attach="fog" args={['#afc9dc', 1800, 10000]} />
      <hemisphereLight ref={fill} args={['#dce8f2', '#7c756a', 1.45]} />
      <directionalLight
        ref={sun}
        position={[90, 170, -85]}
        intensity={2.5}
        castShadow
        shadow-mapSize={compact ? [1024, 1024] : [3072, 3072]}
        shadow-camera-left={-170}
        shadow-camera-right={170}
        shadow-camera-top={170}
        shadow-camera-bottom={-170}
        shadow-camera-far={480}
        shadow-normalBias={0.08}
        shadow-bias={-0.00015}
      />
      <pointLight
        ref={pitchLight}
        position={[0, 35, 0]}
        intensity={0}
        color="#fff2d3"
        distance={180}
        decay={1.25}
      />
      <primitive object={stadium.root} />
      <primitive object={park} />
      <primitive object={landscape} />
      {state.labels &&
        labelData.map((position, i) =>
          i === 1 && state.cutaway ? null : (
            <Html
              key={i}
              position={position}
              center
              occlude={[{ current: stadium.root }]}
              zIndexRange={[9, 1]}
            >
              <div className="scene-label">
                <span />
                {copy.labelNames[i]}
              </div>
            </Html>
          ),
        )}
      <CameraDirector
        focusTower={focusTower}
        chapter={state.chapter}
        request={state.request}
        cancel={state.cancel}
        reduced={reduced}
        onManual={onManual}
        onSettled={onSettled}
      />
    </>
  )
}
const StadiumScene = forwardRef<SceneHandle, Props>((props, ref) => {
  const api = useRef<SceneHandle | null>(null)
  // Keep the quality profile stable during orbit and orientation changes.
  const [compact] = useState(
    () => matchMedia('(max-width: 850px), (pointer: coarse)').matches,
  )
  useImperativeHandle(
    ref,
    () => ({
      capture: () =>
        api.current
          ? api.current.capture()
          : Promise.reject(new Error('Scene not ready')),
      exportModel: () =>
        api.current
          ? api.current.exportModel()
          : Promise.reject(new Error('Scene not ready')),
    }),
    [],
  )
  return (
    <Canvas
      className="scene-canvas"
      shadows="percentage"
      dpr={[1, compact ? 1.25 : 1.5]}
      frameloop={props.paused ? 'never' : 'always'}
      camera={{ position: [240, 220, 260], fov: 43, near: 0.5, far: 50000 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
      }}
      fallback={<div />}
    >
      <World {...props} api={api} compact={compact} />
    </Canvas>
  )
})
export default StadiumScene
