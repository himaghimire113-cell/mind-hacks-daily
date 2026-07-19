import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../store'

export default function Particles({ count = 200 }) {
  const performanceMode = useAppStore((s) => s.performanceMode)
  const meshRef = useRef()

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.001
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }
    return [pos, vel]
  }, [count])

  useFrame(() => {
    if (!meshRef.current || performanceMode) return
    const posAttr = meshRef.current.geometry.attributes.position
    const array = posAttr.array
    for (let i = 0; i < count; i++) {
      array[i * 3] += velocities[i * 3]
      array[i * 3 + 1] += velocities[i * 3 + 1]
      array[i * 3 + 2] += velocities[i * 3 + 2]
      if (array[i * 3 + 1] > 10) array[i * 3 + 1] = -10
      if (Math.abs(array[i * 3]) > 10) velocities[i * 3] *= -1
    }
    posAttr.needsUpdate = true
  })

  if (performanceMode) return null

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#4CAF50"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
