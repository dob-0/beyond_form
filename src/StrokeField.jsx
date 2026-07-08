import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// deterministic pseudo-random so the scatter is stable between renders
const rand = (i, salt) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function Strokes({ count = 16 }) {
  const { viewport } = useThree()
  const refs = useRef([])
  const strokes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        // upper-right scatter only — must stay off the headline and body text
        pos: [
          (0.1 + rand(i, 1) * 0.32) * viewport.width,
          (0.02 + rand(i, 2) * 0.42) * viewport.height,
          (rand(i, 3) - 0.5) * 1.2,
        ],
        rot: [rand(i, 4) * Math.PI, rand(i, 5) * Math.PI, rand(i, 6) * Math.PI],
        speed: 0.08 + rand(i, 7) * 0.18,
        len: 0.45 + rand(i, 8) * 0.55,
      })),
    [count, viewport.width, viewport.height]
  )

  useFrame((_, delta) => {
    if (REDUCE_MOTION) return
    refs.current.forEach((m, i) => {
      if (!m) return
      m.rotation.z += strokes[i].speed * delta
      m.rotation.x += strokes[i].speed * 0.4 * delta
    })
  })

  return strokes.map((s, i) => (
    <mesh
      key={i}
      ref={(el) => (refs.current[i] = el)}
      position={s.pos}
      rotation={s.rot}
    >
      <boxGeometry args={[s.len, 0.07, 0.07]} />
      <meshBasicMaterial color="#0a0a0a" />
    </mesh>
  ))
}

export default function StrokeField() {
  return (
    <Canvas
      className="stroke-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={REDUCE_MOTION ? 'demand' : 'always'}
    >
      <Strokes />
    </Canvas>
  )
}
