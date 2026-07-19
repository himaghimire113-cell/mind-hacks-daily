import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useAppStore } from '../store'

const targets = {
  hero: { pos: [0, 0, 8], lookAt: [0, 0, 0] },
  about: { pos: [5, 2, 6], lookAt: [0, -2, 0] },
  programs: { pos: [-3, -3, 7], lookAt: [0, -5, 0] },
  contact: { pos: [3, -8, 6], lookAt: [0, -10, 0] },
  notices: { pos: [-5, 0, 7], lookAt: [0, 0, 0] },
  news: { pos: [0, 3, 7], lookAt: [0, 0, 0] },
  gallery: { pos: [4, 1, 6], lookAt: [0, 0, 0] },
  admission: { pos: [-4, -1, 7], lookAt: [0, -2, 0] },
  facilities: { pos: [2, -4, 7], lookAt: [0, -5, 0] },
}

export default function CameraController() {
  const { camera } = useThree()
  const cameraTarget = useAppStore((s) => s.cameraTarget)
  const isAnimating = useRef(false)

  useEffect(() => {
    const target = targets[cameraTarget]
    if (!target) return

    isAnimating.current = true
    gsap.to(camera.position, {
      x: target.pos[0],
      y: target.pos[1],
      z: target.pos[2],
      duration: 2,
      ease: 'power3.inOut',
      onComplete: () => { isAnimating.current = false },
    })
  }, [cameraTarget, camera])

  useFrame((state) => {
    if (!isAnimating.current) {
      // Subtle idle movement
      const t = state.clock.getElapsedTime()
      camera.position.x += Math.sin(t * 0.3) * 0.001
      camera.position.y += Math.cos(t * 0.2) * 0.001
    }
  })

  return null
}
