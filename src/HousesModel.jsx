import React, { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { IS_MOBILE } from './useInView.js'

// Literal basename matters: scripts/sync-space.mjs uploads the file from
// public/ as a space asset and rewrites this exact string to the asset URL in
// the built HTML. In dev, Vite serves public/ at the root. Same asset as the
// theme section's assembly scene — useGLTF caches it, so it downloads once.
const MODEL_URL = 'gaw-houses-split.glb'

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Houses() {
  const group = useRef()
  const { scene } = useGLTF(MODEL_URL)
  const { cloned, scale } = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    cloned.position.sub(center)
    const size = box.getSize(new THREE.Vector3())
    return { cloned, scale: 6 / (size.length() || 1) }
  }, [scene])

  // the scan's house facades point roughly (-0.87, 0, 0.48) — yaw them to camera
  const BASE_YAW = 1.07
  useFrame(({ clock }) => {
    if (REDUCE_MOTION || !group.current) return
    const t = clock.getElapsedTime()
    group.current.rotation.y = BASE_YAW + Math.sin(t * 0.55) * 0.18
    group.current.rotation.x = 0.08
  })

  return (
    <group ref={group} rotation={[0.08, BASE_YAW, 0]} position={[-0.4, 0.25, 0]}>
      <group scale={scale}>
        <primitive object={cloned} />
      </group>
    </group>
  )
}

class ModelBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function HousesModel({ fallback }) {
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Canvas
          className="houses-canvas"
          dpr={[1, IS_MOBILE ? 1 : 1.5]}
          camera={{ position: [0, 0.5, 9.5], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
          frameloop={REDUCE_MOTION ? 'demand' : 'always'}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[4, 6, 8]} intensity={1.3} />
          <Houses />
        </Canvas>
      </Suspense>
    </ModelBoundary>
  )
}
