import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float, Text } from '@react-three/drei'
import { useAppStore } from '../store'

const programs = [
  {
    id: 'preschool',
    title: 'Pre-School',
    subtitle: 'Nursery, LKG, UKG',
    color: '#4CAF50',
    position: [-3, -5, 0],
    description: 'Our pre-school program nurtures young minds through play-based learning, creative exploration, and foundational skill development in a safe, stimulating environment.',
  },
  {
    id: 'school',
    title: 'School',
    subtitle: 'Grade 1 - 10',
    color: '#2E7D32',
    position: [0, -5, 0],
    description: 'Comprehensive education from Grade 1 through 10, following the national curriculum with emphasis on critical thinking, digital literacy, and holistic development.',
  },
  {
    id: 'college',
    title: 'College',
    subtitle: 'CS, Business, Hotel Mgmt',
    color: '#1B5E20',
    position: [3, -5, 0],
    description: 'Higher secondary programs in Computer Science, Business Studies, Hotel Management, ADHM, and BBS — preparing students for professional excellence.',
  },
]

function ProgramCard({ program, index }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const openProgramDialog = useAppStore((s) => s.openProgramDialog)

  useFrame((state) => {
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.05
    const targetScale = hovered ? 1.15 : 1
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  return (
    <group
      ref={ref}
      position={program.position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => openProgramDialog(program)}
    >
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Card base */}
        <mesh>
          <boxGeometry args={[2.2, 2.8, 0.15]} />
          <meshStandardMaterial
            color={hovered ? program.color : '#0d0d0d'}
            emissive={program.color}
            emissiveIntensity={hovered ? 0.3 : 0.05}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Glow border */}
        <mesh scale={[2.25, 2.85, 0.12]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={program.color}
            transparent
            opacity={hovered ? 0.3 : 0.05}
            wireframe
          />
        </mesh>

        {/* Title */}
        <Text
          position={[0, 0.6, 0.1]}
          fontSize={0.25}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff"
        >
          {program.title}
        </Text>

        {/* Subtitle */}
        <Text
          position={[0, 0.2, 0.1]}
          fontSize={0.12}
          color="rgba(255,255,255,0.7)"
          anchorX="center"
          anchorY="middle"
        >
          {program.subtitle}
        </Text>

        {/* Click hint */}
        <Html position={[0, -0.8, 0.1]} center>
          <div
            style={{
              background: hovered ? program.color : 'transparent',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              border: `1px solid ${program.color}`,
              transition: 'all 0.3s',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {hovered ? 'Click to Explore' : 'Hover to Preview'}
          </div>
        </Html>
      </Float>
    </group>
  )
}

export default function Programs3D() {
  return (
    <group position={[0, 0, 0]}>
      {programs.map((program, i) => (
        <ProgramCard key={program.id} program={program} index={i} />
      ))}
    </group>
  )
}
