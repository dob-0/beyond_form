import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import font from './fonts/helvetiker_bold.typeface.json'
import { IS_MOBILE } from './mobile.js'

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// scroll velocity drives letter spin boost + drift — module-level so all letters share it
const scroll = { vel: 0, _t: null }
if (typeof window !== 'undefined') {
  let prevY = window.scrollY
  let prevTime = performance.now()
  window.addEventListener('scroll', () => {
    const now = performance.now()
    const dt = Math.max(now - prevTime, 1)
    scroll.vel = (window.scrollY - prevY) / dt  // px/ms
    prevY = window.scrollY
    prevTime = now
    clearTimeout(scroll._t)
    scroll._t = setTimeout(() => { scroll.vel = 0 }, 200)
  }, { passive: true })
}

// tumbling composition — fractions of the visible viewport, cropped by edges on purpose
const LETTERS = [
  { char: 'B',      f: [-0.48,  0.44],  z: -1.2, rot: [0.8,  -1.1, -0.7], axis: [0.3, 1,   0.8], speed: 0.38 },
  { char: 'E',      f: [ 0.05,  0.42],  z:  1.6, rot: [-0.5,  0.9,  1.4], axis: [1,   0.5, 0.3], speed: 0.52 },
  { char: 'Y',      f: [ 0.46,  0.48],  z: -0.6, rot: [1.2,   0.4,  2.1], axis: [0.2, 1,   0.7], speed: 0.44 },
  { char: 'O',      f: [-0.42,  0.06],  z:  2.0, rot: [-0.9,  1.2, -1.3], axis: [1,   0.6, 0.4], speed: 0.31 },
  { char: 'N',      f: [ 0.44,  0.02],  z: -1.8, rot: [0.4,  -0.7,  0.9], axis: [0.5, 1,   0.2], speed: 0.61 },
  { char: 'D',      f: [ 0.18,  0.22],  z:  0.8, rot: [-1.1,  0.3,  1.7], axis: [0.7, 0.4, 1  ], speed: 0.47 },
  { char: 'F',      f: [-0.44, -0.38],  z:  0.4, rot: [-0.6,  0.8,  2.3], axis: [0.2, 0.6, 1  ], speed: 0.55 },
  { char: 'O',      f: [ 0.08, -0.32],  z: -1.0, rot: [0.9,  -0.5, -0.4], axis: [1,   0.3, 0.6], speed: 0.29 },
  { char: 'R',      f: [ 0.42, -0.44],  z:  1.4, rot: [-0.3,  1.0,  0.6], axis: [0.8, 1,   0.1], speed: 0.67 },
  { char: 'M',      f: [-0.14, -0.46],  z: -0.4, rot: [1.3,  -1.2,  3.1], axis: [0.4, 0.8, 1  ], speed: 0.41 },
  { char: 'B',      f: [ 0.28, -0.14],  z:  2.2, rot: [-0.7,  0.6, -1.8], axis: [1,   0.2, 0.9], speed: 0.58 },
  { char: 'Y',      f: [-0.28,  0.28],  z: -1.6, rot: [0.5,  -0.9,  0.3], axis: [0.3, 1,   0.5], speed: 0.35 },
]

function TumblingLetter({ char, f, z, rot, axis, speed, sizeScale = 1 }) {
  const group = useRef()
  const { viewport } = useThree()
  const ax = useMemo(() => {
    const [x, y, zz] = axis
    const len = Math.hypot(x, y, zz)
    return { x: x / len, y: y / len, z: zz / len }
  }, [axis])

  useFrame(({ pointer, viewport: vp }, delta) => {
    if (REDUCE_MOTION || !group.current) return
    // scroll boosts spin speed — both directions
    const boost = 1 + Math.abs(scroll.vel) * 0.6
    const r = group.current.rotation
    r.x += ax.x * speed * delta * boost
    r.y += ax.y * speed * delta * boost
    r.z += ax.z * speed * delta * boost
    // letters shy away from the cursor
    const baseX = f[0] * vp.width
    const baseY = f[1] * vp.height
    const px = (pointer.x * vp.width) / 2
    const py = (pointer.y * vp.height) / 2
    const dx = baseX - px
    const dy = baseY - py
    const dist = Math.hypot(dx, dy)
    const radius = vp.width * 0.32
    let tx = baseX
    let ty = baseY
    if (dist < radius && dist > 0.001) {
      const push = (1 - dist / radius) * 3.2
      tx = baseX + (dx / dist) * push
      ty = baseY + (dy / dist) * push
    }
    // scroll drift — letters float in scroll direction, then snap back
    ty += scroll.vel * 0.018
    const p = group.current.position
    p.x += (tx - p.x) * 0.1
    p.y += (ty - p.y) * 0.1
  })

  const size = Math.min(Math.max(viewport.width / 5.0, 1.5), 4.5) * sizeScale
  return (
    <group
      ref={group}
      position={[f[0] * viewport.width, f[1] * viewport.height, z]}
      rotation={rot}
    >
      <Center>
        <Text3D font={font} size={size} height={size * 0.22} curveSegments={8}>
          {char}
          <meshStandardMaterial color="#f4f2ee" roughness={0.85} metalness={0} />
        </Text3D>
      </Center>
    </group>
  )
}

function Parallax({ children }) {
  const group = useRef()
  useFrame(({ pointer }) => {
    if (REDUCE_MOTION || !group.current) return
    const r = group.current.rotation
    r.y += (pointer.x * 0.22 - r.y) * 0.05
    r.x += (-pointer.y * 0.16 - r.x) * 0.05
  })
  return <group ref={group}>{children}</group>
}

export default function HeroScene() {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, IS_MOBILE ? 1.5 : 2]}
      camera={{ position: [0, 0, 12], fov: 40 }}
      gl={{ antialias: true }}
      frameloop={REDUCE_MOTION ? 'demand' : 'always'}
    >
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 9]} intensity={1.2} />
      <Parallax>
        {LETTERS.map((l) => (
          <TumblingLetter key={l.char + l.f.join()} {...l} />
        ))}
      </Parallax>
    </Canvas>
  )
}
