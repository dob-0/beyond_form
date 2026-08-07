import React, { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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

function WorkMesh({ url, xrMode }) {
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

  // in an XR session the page scale (~4.6 units to fill a 300px card) would
  // tower over the viewer — present it hand-sized in front of them. AR runs
  // on the 'local' space (origin at the head), VR on 'local-floor'.
  const position = xrMode === 'ar' ? [0, -0.15, -1.3] : xrMode === 'vr' ? [0, 1.2, -1.6] : [0, 0, 0]
  return (
    <group ref={group} rotation={[0.12, 0, 0]} position={position}>
      <group scale={scale * (xrMode ? 0.28 : 1)}>
        <primitive object={node} />
      </group>
    </group>
  )
}

// grabs the renderer so the buttons outside the Canvas can hand it a session
function XrBridge({ glRef }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.xr.enabled = true
    glRef.current = gl
  }, [gl, glRef])
  return null
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
  const glRef = useRef(null)
  const [near, setNear] = useState(false)
  const [xrModes, setXrModes] = useState([])
  const [xrMode, setXrMode] = useState(null)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return }
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: '250px 0px' }
    )
    observer.observe(holder.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const xr = typeof navigator !== 'undefined' ? navigator.xr : null
    if (!xr?.isSessionSupported) return
    let cancelled = false
    Promise.all(
      ['immersive-ar', 'immersive-vr'].map((mode) =>
        xr.isSessionSupported(mode).then((ok) => (ok ? mode : null)).catch(() => null)
      )
    ).then((modes) => {
      if (!cancelled) setXrModes(modes.filter(Boolean))
    })
    return () => { cancelled = true }
  }, [])

  const enterXr = async (mode) => {
    const gl = glRef.current
    if (!gl) return
    try {
      const session = await navigator.xr.requestSession(mode, {
        optionalFeatures: ['local-floor', 'local'],
      })
      // 'local-floor' is not guaranteed (especially in AR) and three throws
      // at session start if the requested space is missing — AR always rides
      // the guaranteed 'local' space instead
      gl.xr.setReferenceSpaceType(mode === 'immersive-ar' ? 'local' : 'local-floor')
      session.addEventListener('end', () => setXrMode(null))
      setXrMode(mode === 'immersive-ar' ? 'ar' : 'vr')
      await gl.xr.setSession(session)
    } catch {
      setXrMode(null)
    }
  }

  // an active XR session must pin the canvas: entering AR hides the page,
  // the observer fires not-intersecting, and unmounting would destroy the
  // renderer the session is running on
  return (
    <div ref={holder} className="work-model">
      {(near || xrMode) && (
        <Boundary>
          <Suspense fallback={null}>
            <Canvas
              dpr={[1, IS_MOBILE ? 1 : 1.5]}
              camera={{ position: [0, 0, 7], fov: 35 }}
              gl={{ antialias: true, alpha: true }}
              frameloop={REDUCE_MOTION ? 'demand' : 'always'}
            >
              <XrBridge glRef={glRef} />
              <ambientLight intensity={0.9} />
              <directionalLight position={[4, 6, 8]} intensity={1.4} />
              <directionalLight position={[-5, -2, -6]} intensity={0.35} />
              <WorkMesh url={url} xrMode={xrMode} />
            </Canvas>
          </Suspense>
          {xrModes.length > 0 && (
            <div className="work-xr">
              {xrModes.includes('immersive-ar') && (
                <button type="button" aria-label="View this work in augmented reality" onClick={() => enterXr('immersive-ar')}>
                  AR ↗
                </button>
              )}
              {xrModes.includes('immersive-vr') && (
                <button type="button" aria-label="View this work in virtual reality" onClick={() => enterXr('immersive-vr')}>
                  VR ↗
                </button>
              )}
            </div>
          )}
        </Boundary>
      )}
    </div>
  )
}
