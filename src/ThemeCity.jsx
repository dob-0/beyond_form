import React, { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { IS_MOBILE } from './useInView.js'

// "City and Time": the ten houses of the logo drift scattered in space and
// assemble into their rows as the visitor scrolls through the theme section —
// the city gathering itself out of time. Model: the split logo scan
// (one node per house, translations = their place in the logo).
const MODEL_URL = 'gaw-houses-split.glb'
const BASE_YAW = 1.07

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const rand = (i, salt) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const smoothstep = (t) => t * t * (3 - 2 * t)

function City({ sectionId }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef()
  const progress = useRef(REDUCE_MOTION ? 1 : 0)

  const { cloned, houses, norm } = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    const norm = 4.0 / (box.getSize(new THREE.Vector3()).length() || 1)
    const houses = cloned.children.map((node, i) => {
      const home = node.position.clone().sub(center)
      node.position.copy(home)
      // biased up (+y) and right-of-screen (+z after the group yaw) so the
      // drifting houses stay clear of the text columns
      const dir = new THREE.Vector3(
        rand(i, 1) - 0.5, rand(i, 2) - 0.3, rand(i, 3) - 0.25
      ).normalize()
      return {
        node,
        home,
        scatter: home.clone().add(dir.multiplyScalar(1.6 + rand(i, 4) * 2.2)),
        qScatter: new THREE.Quaternion().setFromEuler(new THREE.Euler(
          (rand(i, 5) - 0.5) * Math.PI * 2,
          (rand(i, 6) - 0.5) * Math.PI * 2,
          (rand(i, 7) - 0.5) * Math.PI * 2
        )),
        qHome: new THREE.Quaternion(),
        drift: 0.3 + rand(i, 8) * 0.5,
      }
    })
    return { cloned, houses, norm }
  }, [scene])

  useFrame(({ clock, pointer, viewport }) => {
    if (!group.current) return
    // scroll position of the theme section drives the assembly
    if (!REDUCE_MOTION) {
      const el = document.getElementById(sectionId)
      if (el) {
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        // fully assembled by the time the section top reaches ~15% viewport
        const raw = (vh * 0.9 - rect.top) / (vh * 0.75)
        progress.current += (Math.min(1, Math.max(0, raw)) - progress.current) * 0.08
      }
    }
    const p = smoothstep(progress.current)
    const t = clock.getElapsedTime()
    houses.forEach((h, i) => {
      h.node.position.lerpVectors(h.scatter, h.home, p)
      if (!REDUCE_MOTION) {
        // residual drift while scattered, stillness once home
        h.node.position.y += Math.sin(t * h.drift + i) * 0.12 * (1 - p)
        h.node.quaternion.slerpQuaternions(h.qScatter, h.qHome, p)
        const wobble = (1 - p) * Math.sin(t * h.drift * 2 + i * 2) * 0.2
        h.node.rotation.z += wobble
      }
    })
    if (!REDUCE_MOTION) {
      group.current.rotation.y = BASE_YAW + pointer.x * 0.18 * p
      group.current.rotation.x = pointer.y * -0.06 * p
    }
    // desktop: upper-right, clear of the two text columns. mobile: single
    // column, so centre it as a backdrop behind the heading (CSS dims it).
    group.current.position.x = viewport.width * (IS_MOBILE ? 0 : 0.23)
    group.current.position.y = viewport.height * (IS_MOBILE ? 0.16 : 0.24)
  })

  return (
    <group ref={group} rotation={[0, BASE_YAW, 0]} scale={norm}>
      <primitive object={cloned} />
    </group>
  )
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function ThemeCity({ sectionId = 'theme' }) {
  return (
    <SceneBoundary>
      <Suspense fallback={null}>
        <Canvas
          className="city-canvas"
          dpr={[1, IS_MOBILE ? 1 : 1.5]}
          camera={{ position: [0, 0, 9], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          frameloop={REDUCE_MOTION ? 'demand' : 'always'}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[4, 6, 8]} intensity={1.3} />
          <City sectionId={sectionId} />
        </Canvas>
      </Suspense>
    </SceneBoundary>
  )
}
