import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import font from './fonts/helvetiker_bold.typeface.json'

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// tumbling composition — fractions of the visible viewport, cropped by edges on purpose
const LETTERS = [
  { char: 'B', f: [-0.46, 0.42], z: -0.6, rot: [0.2, -0.3, -0.21], axis: [0.3, 1, 0.1], speed: 0.14 },
  { char: 'E', f: [-0.06, 0.36], z: 0.4, rot: [-0.1, 0.2, 0.42], axis: [1, 0.2, 0.3], speed: 0.11 },
  { char: 'Y', f: [0.4, 0.44], z: -0.2, rot: [0.3, 0.1, 1.68], axis: [0.1, 1, 0.4], speed: 0.17 },
  { char: 'O', f: [-0.31, 0.03], z: 0.8, rot: [-0.2, 0.4, -0.66], axis: [1, 0.4, 0.2], speed: 0.09 },
  { char: 'N', f: [0.43, 0.04], z: -0.8, rot: [0.1, -0.2, 0.21], axis: [0.4, 1, 0.1], speed: 0.13 },
  { char: 'F', f: [-0.45, -0.36], z: 0.2, rot: [-0.3, 0.1, 1.12], axis: [0.2, 0.3, 1], speed: 0.15 },
  { char: 'R', f: [-0.02, -0.46], z: 0.6, rot: [0.2, 0.3, -0.35], axis: [1, 0.1, 0.5], speed: 0.1 },
  { char: 'M', f: [0.3, -0.4], z: -0.4, rot: [-0.1, -0.4, 2.58], axis: [0.3, 1, 0.3], speed: 0.12 },
]

function TumblingLetter({ char, f, z, rot, axis, speed }) {
  const group = useRef()
  const { viewport } = useThree()
  const ax = useMemo(() => {
    const [x, y, zz] = axis
    const len = Math.hypot(x, y, zz)
    return { x: x / len, y: y / len, z: zz / len }
  }, [axis])

  useFrame(({ pointer, viewport: vp }, delta) => {
    if (REDUCE_MOTION || !group.current) return
    const r = group.current.rotation
    r.x += ax.x * speed * delta
    r.y += ax.y * speed * delta
    r.z += ax.z * speed * delta
    // letters shy away from the cursor
    const baseX = f[0] * vp.width
    const baseY = f[1] * vp.height
    const px = (pointer.x * vp.width) / 2
    const py = (pointer.y * vp.height) / 2
    const dx = baseX - px
    const dy = baseY - py
    const dist = Math.hypot(dx, dy)
    const radius = vp.width * 0.2
    let tx = baseX
    let ty = baseY
    if (dist < radius && dist > 0.001) {
      const push = (1 - dist / radius) * 1.6
      tx = baseX + (dx / dist) * push
      ty = baseY + (dy / dist) * push
    }
    const p = group.current.position
    p.x += (tx - p.x) * 0.06
    p.y += (ty - p.y) * 0.06
  })

  const size = Math.min(Math.max(viewport.width / 6.5, 1.4), 3.4)
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
    r.y += (pointer.x * 0.12 - r.y) * 0.04
    r.x += (-pointer.y * 0.08 - r.x) * 0.04
  })
  return <group ref={group}>{children}</group>
}

export default function HeroScene() {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
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
