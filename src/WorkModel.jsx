import React, { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { IS_MOBILE } from './mobile.js'

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// mid-gray flat-shaded facets stay legible on the paper row and on its
// ink hover inversion alike
const MATERIAL = new THREE.MeshStandardMaterial({
  color: '#8f8b84',
  roughness: 0.65,
  metalness: 0,
  flatShading: true,
})

function WorkMesh({ url }) {
  const group = useRef()
  const { scene } = useGLTF(url)

  const { node, scale } = useMemo(() => {
    const node = scene.clone(true)
    node.traverse((o) => {
      if (o.isMesh) o.material = MATERIAL
    })
    const box = new THREE.Box3().setFromObject(node)
    const center = box.getCenter(new THREE.Vector3())
    node.position.sub(center)
    const size = box.getSize(new THREE.Vector3())
    return { node, scale: 4.6 / (size.length() || 1) }
  }, [scene])

  useFrame(({ clock }) => {
    if (REDUCE_MOTION || !group.current) return
    group.current.rotation.y = clock.getElapsedTime() * 0.35
  })

  return (
    <group ref={group} rotation={[0.12, 0, 0]}>
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

// The page already runs six WebGL contexts; mobile budgets are ~8. The canvas
// therefore exists only while its row is near the viewport — mounting is
// gated by intersection, and leaving unmounts and frees the context.
// (Pausing via frameloop:"demand" is the thing that breaks in the sandboxed
// srcdoc iframe; observers themselves fire fine — data-reveal relies on them.)
export default function WorkModel({ url }) {
  const holder = useRef()
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return }
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: '250px 0px' }
    )
    observer.observe(holder.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={holder} className="work-model" aria-hidden="true">
      {near && (
        <Boundary>
          <Suspense fallback={null}>
            <Canvas
              dpr={[1, IS_MOBILE ? 1 : 1.5]}
              camera={{ position: [0, 0, 7], fov: 35 }}
              gl={{ antialias: true, alpha: true }}
              frameloop={REDUCE_MOTION ? 'demand' : 'always'}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[4, 6, 8]} intensity={1.4} />
              <directionalLight position={[-5, -2, -6]} intensity={0.35} />
              <WorkMesh url={url} />
            </Canvas>
          </Suspense>
        </Boundary>
      )}
    </div>
  )
}
