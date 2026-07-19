import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float } from '@react-three/drei'
import { useAppStore } from '../store'

const testimonials = [
  {
    id: 1,
    name: 'PTA President',
    role: 'Parent Teacher Association',
    text: 'GBM School provides an exceptional environment for holistic development. The spacious campus and skilled teachers have transformed our children's educational journey.',
    avatar: 'P',
  },
  {
    id: 2,
    name: 'School Principal',
    role: 'Academic Leadership',
    text: 'Our commitment to excellence spans over 25 years. We blend traditional values with modern innovation to create leaders for the next generation.',
    avatar: 'S',
  },
  {
    id: 3,
    name: 'Alumni Representative',
    role: 'Class of 2015',
    text: 'The foundation I received at GBM School prepared me for global opportunities. The focus on both academics and character building is truly remarkable.',
    avatar: 'A',
  },
]

function TestimonialCard({ data, index, activeIndex }) {
  const ref = useRef()
  const isActive = index === activeIndex

  useFrame(() => {
    if (ref.current) {
      const targetX = (index - activeIndex) * 4
      const targetOpacity = isActive ? 1 : 0.3
      const targetScale = isActive ? 1 : 0.8
      ref.current.position.x += (targetX - ref.current.position.x) * 0.05
      ref.current.scale.setScalar(targetScale)
    }
  })

  return (
    <group ref={ref} position={[index * 4, -15, 0]}>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Card plane */}
        <mesh>
          <planeGeometry args={[3, 3.5]} />
          <meshStandardMaterial
            color="#0d0d0d"
            emissive="#1B5E20"
            emissiveIntensity={isActive ? 0.1 : 0.02}
            side={2}
          />
        </mesh>

        {/* Border glow */}
        <mesh scale={[1.02, 1.02, 1]}>
          <planeGeometry args={[3, 3.5]} />
          <meshBasicMaterial color="#4CAF50" transparent opacity={isActive ? 0.2 : 0.05} side={2} />
        </mesh>

        {/* HTML Content */}
        <Html
          position={[0, 0, 0.05]}
          center
          style={{
            width: '260px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'transparent',
              padding: '20px',
              color: '#fff',
              textAlign: 'center',
              opacity: isActive ? 1 : 0.4,
              transition: 'opacity 0.5s',
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                margin: '0 auto 12px',
              }}
            >
              {data.avatar}
            </div>
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.8)',
                fontStyle: 'italic',
                marginBottom: '12px',
              }}
            >
              "{data.text}"
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#4CAF50' }}>{data.name}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{data.role}</p>
          </div>
        </Html>
      </Float>
    </group>
  )
}

export default function Testimonials3D() {
  const [activeIndex, setActiveIndex] = useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <group position={[0, 0, 0]}>
      {testimonials.map((t, i) => (
        <TestimonialCard key={t.id} data={t} index={i} activeIndex={activeIndex} />
      ))}
    </group>
  )
}
