import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store'

function Leaf({ position, rotation, scale, color }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
  })
  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <coneGeometry args={[0.15, 0.4, 4]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  )
}

function BookPage({ side, color }) {
  const ref = useRef()
  const xOffset = side === 'left' ? -0.8 : 0.8
  const rotY = side === 'left' ? 0.4 : -0.4

  useFrame((state) => {
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
  })

  return (
    <group ref={ref} position={[xOffset, -0.3, 0]} rotation={[0, rotY, 0]}>
      {/* Page */}
      <mesh>
        <boxGeometry args={[1.4, 1.8, 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Page edge highlight */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.35, 1.75, 0.01]} />
        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
    </group>
  )
}

function CircuitTree() {
  const groupRef = useRef()

  useFrame((state) => {
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Central trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#2E7D32" emissive="#1B5E20" emissiveIntensity={0.4} />
      </mesh>

      {/* Circuit rings */}
      {[0.3, 0.5, 0.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2 + i * 0.08, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#4CAF50"
            emissive="#4CAF50"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Circuit nodes */}
      {[
        [0.15, 0.3, 0.15],
        [-0.15, 0.5, 0.1],
        [0.1, 0.7, -0.15],
        [-0.1, 0.4, -0.1],
      ].map((pos, i) => (
        <mesh key={`node-${i}`} position={pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#81C784" emissive="#81C784" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Connection lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={4}
            array={new Float32Array([0, 0, 0, 0.15, 0.3, 0.15, -0.15, 0.5, 0.1, 0, 0.8, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#4CAF50" linewidth={2} />
      </line>
    </group>
  )
}

function FloatingLeaves() {
  const leaves = useMemo(() => {
    const arr = []
    const colors = ['#4CAF50', '#66BB6A', '#81C784', '#2E7D32', '#43A047']
    for (let i = 0; i < 16; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 3,
          1.2 + Math.random() * 1.5,
          (Math.random() - 0.5) * 1.5,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 0.3 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.5 + Math.random() * 0.5,
      })
    }
    return arr
  }, [])

  return (
    <group>
      {leaves.map((leaf, i) => (
        <Float key={i} speed={leaf.speed} rotationIntensity={0.5} floatIntensity={0.8}>
          <Leaf {...leaf} />
        </Float>
      ))}
    </group>
  )
}

function GlowOrb() {
  const ref = useRef()
  useFrame((state) => {
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    ref.current.scale.set(scale, scale, scale)
  })
  return (
    <mesh ref={ref} position={[0, 0.2, -0.5]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial color="#1B5E20" transparent opacity={0.08} />
    </mesh>
  )
}

export default function SchoolEmblem3D() {
  const groupRef = useRef()
  const performanceMode = useAppStore((s) => s.performanceMode)

  useFrame((state) => {
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <GlowOrb />
      <BookPage side="left" color="#2E7D32" />
      <BookPage side="right" color="#4CAF50" />
      <CircuitTree />
      {!performanceMode && <FloatingLeaves />}

      {/* Hotspot: Programs */}
      <Html position={[2.5, 0.5, 0]} center>
        <div
          style={{
            background: 'rgba(13, 13, 13, 0.9)',
            border: '1px solid #4CAF50',
            borderRadius: '20px',
            padding: '8px 16px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#4CAF50'
            e.target.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(13, 13, 13, 0.9)'
            e.target.style.transform = 'scale(1)'
          }}
          onClick={() => {
            useAppStore.getState().setCameraTarget('programs')
            document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Explore Programs →
        </div>
      </Html>

      {/* Hotspot: Contact */}
      <Html position={[-2.5, -1, 0]} center>
        <div
          style={{
            background: 'rgba(13, 13, 13, 0.9)',
            border: '1px solid #81C784',
            borderRadius: '20px',
            padding: '8px 16px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#81C784'
            e.target.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(13, 13, 13, 0.9)'
            e.target.style.transform = 'scale(1)'
          }}
          onClick={() => {
            useAppStore.getState().setCameraTarget('contact')
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Get in Touch →
        </div>
      </Html>
    </group>
  )
}
