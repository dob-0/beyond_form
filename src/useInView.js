import { useEffect, useRef, useState } from 'react'

// Pause a canvas' render loop while it is off-screen. On mobile the page
// stacks 5-6 WebGL canvases; without this they all run rAF at once. Attach the
// returned ref to the canvas' wrapper and feed `inView` into frameloop.
export function useInView(rootMargin = '250px') {
  const ref = useRef(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])
  return [ref, inView]
}

export const IS_MOBILE =
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 800px)').matches
