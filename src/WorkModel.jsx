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

function WorkMesh({ url, xrMode, placedMatrix }) {
  const outerRef = useRef()
  const spinRef = useRef()
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

  // once tapped into place in AR the piece should hold still, not keep
  // turning — everywhere else (the card, VR) it still slowly rotates
  useFrame(({ clock }) => {
    if (xrMode === 'ar' || REDUCE_MOTION || !spinRef.current) return
    spinRef.current.rotation.y = clock.getElapsedTime() * 0.35
  })

  // a hit-test pose is a raw world matrix in the session's reference space —
  // applying it straight to the outer group is what makes the piece stay put
  // on that real-world spot as the camera (i.e. the phone) moves around it
  useEffect(() => {
    if (placedMatrix && outerRef.current) {
      outerRef.current.matrixAutoUpdate = false
      outerRef.current.matrix.copy(placedMatrix)
    }
  }, [placedMatrix])

  // in an XR session the page scale (~4.6 units to fill a 300px card) would
  // tower over the viewer — present it hand-sized. AR without a placed pose
  // (hit-test unsupported, or not yet tapped) falls back to a fixed spot
  // ahead of the headset/phone; VR has no floor-hit-test so it always uses
  // the fixed spot.
  const fallbackPosition = xrMode === 'ar' ? [0, -0.15, -1.3] : xrMode === 'vr' ? [0, 1.2, -1.6] : [0, 0, 0]
  return (
    <group
      ref={outerRef}
      position={placedMatrix ? undefined : fallbackPosition}
      rotation={placedMatrix ? undefined : [0.12, 0, 0]}
    >
      <group ref={spinRef} scale={scale * (xrMode ? 0.28 : 1)}>
        <primitive object={node} />
      </group>
    </group>
  )
}

// the reticle geometry is rotated once, at creation, from vertical (ring's
// default XY-plane orientation) to lying flat — matches the pattern three.js's
// own webxr hit-test example uses, since we set the mesh's matrix directly
// from the hit pose afterward and can't rely on a declarative rotation prop
function useReticleGeometry() {
  return useMemo(() => new THREE.RingGeometry(0.05, 0.07, 32).rotateX(-Math.PI / 2), [])
}

// Renders a reticle that tracks the tapped-surface hit test each frame, and
// reports the latest hit pose up via a ref so the session's 'select' (tap)
// handler can freeze it into a placement. Hidden the moment something is
// placed — one piece, one spot, per session.
function ArReticle({ hitTestSourceRef, lastHitMatrixRef, active }) {
  const ref = useRef()
  const geometry = useReticleGeometry()

  useFrame((state, _delta, frame) => {
    if (!active || !frame || !hitTestSourceRef.current) {
      if (ref.current) ref.current.visible = false
      return
    }
    const referenceSpace = state.gl.xr.getReferenceSpace()
    const results = frame.getHitTestResults(hitTestSourceRef.current)
    const pose = results.length && referenceSpace ? results[0].getPose(referenceSpace) : null
    if (pose && ref.current) {
      const m = new THREE.Matrix4().fromArray(pose.transform.matrix)
      lastHitMatrixRef.current = m
      ref.current.visible = true
      ref.current.matrixAutoUpdate = false
      ref.current.matrix.copy(m)
    } else {
      lastHitMatrixRef.current = null
      if (ref.current) ref.current.visible = false
    }
  })

  if (!active) return null
  return (
    <mesh ref={ref} geometry={geometry} visible={false}>
      <meshBasicMaterial color="#ffffff" transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
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
  const hitTestSourceRef = useRef(null)
  const lastHitMatrixRef = useRef(null)
  const [near, setNear] = useState(false)
  const [xrModes, setXrModes] = useState([])
  const [xrMode, setXrMode] = useState(null)
  // null while the AR reticle is still searching for a surface to tap;
  // a Matrix4 once the piece has been placed there for this session
  const [placedMatrix, setPlacedMatrix] = useState(null)
  // true once we know hit-test isn't available this session, so the piece
  // shows at a fixed spot right away instead of waiting on a tap that has
  // nothing to place it on
  const [arFallback, setArFallback] = useState(false)

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

  const endSession = () => {
    setXrMode(null)
    setPlacedMatrix(null)
    setArFallback(false)
    lastHitMatrixRef.current = null
    hitTestSourceRef.current?.cancel?.()
    hitTestSourceRef.current = null
  }

  const enterXr = async (mode) => {
    const gl = glRef.current
    if (!gl) return
    try {
      let session
      if (mode === 'immersive-ar') {
        try {
          // hit-test is what lets a tap say "put it here" on a real surface
          session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['local', 'dom-overlay'],
          })
        } catch {
          // device/browser has AR but not hit-test — still worth showing the
          // piece, just not surface-anchored
          session = await navigator.xr.requestSession('immersive-ar', {
            optionalFeatures: ['local'],
          })
        }
      } else {
        session = await navigator.xr.requestSession(mode, {
          optionalFeatures: ['local-floor', 'local'],
        })
      }
      // 'local-floor' is not guaranteed (especially in AR) and three throws
      // at session start if the requested space is missing — AR always rides
      // the guaranteed 'local' space instead
      gl.xr.setReferenceSpaceType(mode === 'immersive-ar' ? 'local' : 'local-floor')
      session.addEventListener('end', endSession)
      setXrMode(mode === 'immersive-ar' ? 'ar' : 'vr')
      await gl.xr.setSession(session)

      if (mode !== 'immersive-ar') {
        setPlacedMatrix(null) // VR has no surface to hit-test; WorkMesh uses its fixed spot
        return
      }
      try {
        const viewerSpace = await session.requestReferenceSpace('viewer')
        hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace })
        session.addEventListener('select', () => {
          if (lastHitMatrixRef.current) setPlacedMatrix(lastHitMatrixRef.current.clone())
        })
      } catch {
        // no hit-test available on this device — fall back to the fixed spot
        setArFallback(true)
      }
    } catch {
      setXrMode(null)
    }
  }

  // an active XR session must pin the canvas: entering AR/VR hides the page,
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
              {xrMode === 'ar' && (
                <ArReticle
                  hitTestSourceRef={hitTestSourceRef}
                  lastHitMatrixRef={lastHitMatrixRef}
                  active={!placedMatrix && !arFallback}
                />
              )}
              {/* in AR, wait for a placement (tap) or a confirmed fallback
                  before showing the piece — otherwise it floats in view
                  while the reticle is still asking for a tap */}
              {(xrMode !== 'ar' || placedMatrix || arFallback) && (
                <WorkMesh url={url} xrMode={xrMode} placedMatrix={xrMode === 'ar' ? placedMatrix : null} />
              )}
            </Canvas>
          </Suspense>
          {xrModes.length > 0 && (
            <div className="work-xr">
              {xrModes.includes('immersive-ar') && (
                <button type="button" aria-label="View this work in augmented reality — tap a surface to place it" onClick={() => enterXr('immersive-ar')}>
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
