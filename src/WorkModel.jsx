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

// hand-sized in XR relative to the card's fill-the-frame scale
const XR_SCALE = 0.28

function useNormalizedWork(url) {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const node = scene.clone(true)
    node.traverse((o) => {
      if (o.isMesh) o.material = MATERIAL
    })
    const box = new THREE.Box3().setFromObject(node)
    const center = box.getCenter(new THREE.Vector3())
    node.position.sub(center)
    const size = box.getSize(new THREE.Vector3())
    // A piece that lies flat — Levon's plate — is nearly invisible at the
    // card's default 7° tilt: it spins about its own normal, so it stays a
    // sliver the whole way round. Look down on those instead. Flat is
    // measured against the footprint, not the diagonal, so a standing panel
    // (thin in Z, tall in Y) keeps the default view.
    const footprint = Math.max(size.x, size.z)
    const flat = footprint > 0 && size.y < 0.25 * footprint
    return {
      node,
      // flat pieces are framed by their footprint; the diagonal would leave
      // them small once tilted face-on
      scale: (flat ? 3.9 / (footprint || 1) : 4.6 / (size.length() || 1)),
      tilt: flat ? 1.15 : 0.12,
    }
  }, [scene])
}

// the slowly turning piece — the page card, VR, and the AR fallback when a
// device has no hit-test to place with
function SpinningWork({ url, xrMode }) {
  const group = useRef()
  const { node, scale, tilt } = useNormalizedWork(url)

  useFrame(({ clock }) => {
    if (REDUCE_MOTION || !group.current) return
    group.current.rotation.y = clock.getElapsedTime() * 0.35
  })

  const position = xrMode === 'ar' ? [0, -0.15, -1.3] : xrMode === 'vr' ? [0, 1.2, -1.6] : [0, 0, 0]
  // in XR the piece stands in the room, so it keeps its own orientation
  return (
    <group ref={group} rotation={[xrMode ? 0.12 : tilt, 0, 0]} position={position}>
      <group scale={scale * (xrMode ? XR_SCALE : 1)}>
        <primitive object={node} />
      </group>
    </group>
  )
}

// one world-locked copy; the raw hit-pose matrix applied directly is what
// keeps it glued to its real-world spot as the phone moves
function PlacedCopy({ node, scale, matrix, index }) {
  const ref = useRef()
  const clone = useMemo(() => node.clone(true), [node])
  useEffect(() => {
    if (!ref.current) return
    ref.current.matrixAutoUpdate = false
    ref.current.matrix.copy(matrix)
  }, [matrix])
  return (
    <group ref={ref} userData={{ placementIndex: index }}>
      <group scale={scale * XR_SCALE}>
        <primitive object={clone} />
      </group>
    </group>
  )
}

function ArPlacements({ url, placements, groupRef }) {
  const { node, scale } = useNormalizedWork(url)
  return (
    <group ref={groupRef}>
      {placements.map((m, i) => (
        <PlacedCopy key={`${i}-${m.elements[12]}-${m.elements[14]}`} node={node} scale={scale} matrix={m} index={i} />
      ))}
    </group>
  )
}

// rotated once at creation from the ring's default XY plane to lying flat;
// its matrix comes straight from the hit pose each frame
function useReticleGeometry() {
  return useMemo(() => new THREE.RingGeometry(0.05, 0.07, 32).rotateX(-Math.PI / 2), [])
}

// Tracks the hit test every frame and reports the latest surface pose up via
// ref so the session's tap handler can turn it into a placement.
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
  const placedGroupRef = useRef(null)
  const [near, setNear] = useState(false)
  const [xrModes, setXrModes] = useState([])
  const [xrMode, setXrMode] = useState(null)
  // world matrices of the copies tapped into the room this session
  const [placements, setPlacements] = useState([])
  // true once we know hit-test isn't available this session — the piece then
  // shows at a fixed spot instead of waiting on taps with nothing to hit
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
    setPlacements([])
    setArFallback(false)
    lastHitMatrixRef.current = null
    hitTestSourceRef.current?.cancel?.()
    hitTestSourceRef.current = null
  }

  // Tap on empty surface: place another copy on the reticle. Tap on a copy
  // already standing there: remove it. The tap ray comes from the XR input
  // source, cast against the placed group.
  const handleSelect = (event) => {
    const gl = glRef.current
    if (!gl) return
    const referenceSpace = gl.xr.getReferenceSpace()
    const frame = event.frame
    if (frame && referenceSpace && placedGroupRef.current && event.inputSource?.targetRaySpace) {
      const pose = frame.getPose(event.inputSource.targetRaySpace, referenceSpace)
      if (pose) {
        const m = new THREE.Matrix4().fromArray(pose.transform.matrix)
        const origin = new THREE.Vector3().setFromMatrixPosition(m)
        const direction = new THREE.Vector3(0, 0, -1)
          .applyMatrix4(new THREE.Matrix4().extractRotation(m))
          .normalize()
        const hits = new THREE.Raycaster(origin, direction)
          .intersectObjects(placedGroupRef.current.children, true)
        if (hits.length) {
          let o = hits[0].object
          while (o && o.userData.placementIndex === undefined) o = o.parent
          if (o) {
            const index = o.userData.placementIndex
            setPlacements((p) => p.filter((_, i) => i !== index))
            return
          }
        }
      }
    }
    if (lastHitMatrixRef.current) {
      const m = lastHitMatrixRef.current.clone()
      setPlacements((p) => [...p, m])
    }
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
            optionalFeatures: ['local'],
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

      if (mode !== 'immersive-ar') return
      try {
        const viewerSpace = await session.requestReferenceSpace('viewer')
        hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace })
        session.addEventListener('select', handleSelect)
      } catch {
        setArFallback(true)
      }
    } catch {
      setXrMode(null)
    }
  }

  const inPlacingAr = xrMode === 'ar' && !arFallback

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
              {inPlacingAr && (
                <>
                  <ArReticle
                    hitTestSourceRef={hitTestSourceRef}
                    lastHitMatrixRef={lastHitMatrixRef}
                    active
                  />
                  <ArPlacements url={url} placements={placements} groupRef={placedGroupRef} />
                </>
              )}
              {!inPlacingAr && <SpinningWork url={url} xrMode={xrMode} />}
            </Canvas>
          </Suspense>
          {xrModes.length > 0 && (
            <div className="work-xr">
              {xrModes.includes('immersive-ar') && (
                <button type="button" aria-label="View this work in augmented reality — tap surfaces to place copies, tap a copy to remove it" onClick={() => enterXr('immersive-ar')}>
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
