import React, { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'

// Literal basename matters: scripts/sync-space.mjs uploads public/gaw-houses.glb
// as a space asset and rewrites this exact string to the asset URL in the
// built HTML. In dev, Vite serves public/ at the root so the relative path works.
const MODEL_URL = 'gaw-houses.glb'

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Houses() {
  const group = useRef()
  const { scene } = useGLTF(MODEL_URL)
  const scale = useMemo(() => {
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3())
    return 6 / (size.length() || 1)
  }, [scene])

  // the scan's house facades point roughly (-0.87, 0, 0.48) — yaw them to camera
  const BASE_YAW = 1.07
  useFrame(({ clock, pointer }) => {
    if (REDUCE_MOTION || !group.current) return
    const t = clock.getElapsedTime()
    group.current.rotation.y = BASE_YAW + Math.sin(t * 0.25) * 0.18 + pointer.x * 0.25
    group.current.rotation.x = 0.08 + pointer.y * -0.08
  })

  return (
    <group ref={group} rotation={[0.08, BASE_YAW, 0]} position={[-0.4, 0.25, 0]}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
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
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.5, 7.2], fov: 35 }}
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
