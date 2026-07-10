import React, { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useInView, IS_MOBILE } from './useInView.js'

const MODEL_URL = 'gaw-houses-split.glb'

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function SingleHouse({ index }) {
  const group = useRef()
  const { scene } = useGLTF(MODEL_URL)

  const { node, scale } = useMemo(() => {
    const source = scene.children[index] ?? scene.children[0]
    if (!source) return { node: null, scale: 1 }
    const node = source.clone(true)
    const box = new THREE.Box3().setFromObject(node)
    const center = box.getCenter(new THREE.Vector3())
    node.position.sub(center)
    const size = box.getSize(new THREE.Vector3())
    return { node, scale: 5 / (size.length() || 1) }
  }, [scene, index])

  useFrame(({ clock }) => {
    if (REDUCE_MOTION || !group.current) return
    group.current.rotation.y = clock.getElapsedTime() * 0.5
  })

  if (!node) return null

  return (
    <group ref={group} rotation={[0.15, 0, 0]}>
      <group scale={scale}>
        <primitive object={node} />
      </group>
    </group>
  )
}

class Boundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

export default function FactHouseModel({ index = 0 }) {
  const [ref, inView] = useInView()
  return (
    <Boundary>
      <Suspense fallback={null}>
        <div ref={ref} className="fact-house-host">
          <Canvas
            className="fact-house-canvas"
            dpr={[1, IS_MOBILE ? 1 : 1.5]}
            camera={{ position: [0, 0, 7.2], fov: 35 }}
            gl={{ antialias: true, alpha: true }}
            frameloop={REDUCE_MOTION || !inView ? 'demand' : 'always'}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[4, 6, 8]} intensity={1.3} />
            <SingleHouse index={index} />
          </Canvas>
        </div>
      </Suspense>
    </Boundary>
  )
}
