import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import { useAppStore } from '../store'

const stats = [
  { label: 'Students', value: 25000, suffix: '+', position: [-3, -10, 0], color: '#4CAF50' },
  { label: 'Excellence', value: 100, suffix: '%', position: [0, -10, 0], color: '#81C784' },
  { label: 'Years', value: 25, suffix: '+', position: [3, -10, 0], color: '#2E7D32' },
]

function AnimatedNumber({ value, suffix, position, color, label }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef()
  const hasAnimated = useRef(false)
  const performanceMode = useAppStore((s) => s.performanceMode)

  useEffect(() => {
    if (hasAnimated.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let start = 0
          const duration = 2000
          const startTime = performance.now()

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            start = Math.floor(eased * value)
            setDisplayValue(start)
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    const el = document.getElementById('stats-section')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  useFrame((state) => {
    if (ref.current && !performanceMode) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group ref={ref} position={position}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
        {/* Glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.02, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>

        {/* Number */}
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.6}
          color={color}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff"
        >
          {displayValue.toLocaleString()}{suffix}
        </Text>

        {/* Label */}
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.15}
          color="rgba(255,255,255,0.6)"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Float>
    </group>
  )
}

export default function Stats3D() {
  return (
    <group>
      {stats.map((stat) => (
        <AnimatedNumber key={stat.label} {...stat} />
      ))}
    </group>
  )
}
