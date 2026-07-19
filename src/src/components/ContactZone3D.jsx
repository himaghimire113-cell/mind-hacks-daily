import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float } from '@react-three/drei'
import { useAppStore } from '../store'

const contactItems = [
  {
    id: 'phone',
    icon: '📞',
    label: 'Phone',
    value: '+977 9842624058',
    position: [-2, -20, 0],
    color: '#4CAF50',
  },
  {
    id: 'email',
    icon: '✉️',
    label: 'Email',
    value: 'gbmsmartschool@gmail.com',
    position: [0, -20, 0],
    color: '#81C784',
  },
  {
    id: 'address',
    icon: '📍',
    label: 'Address',
    value: 'Birtamode - 4, Jhapa, Nepal',
    position: [2, -20, 0],
    color: '#2E7D32',
  },
]

function ContactIcon({ item }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const showContactSnackbar = useAppStore((s) => s.showContactSnackbar)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5
      const targetScale = hovered ? 1.3 : 1
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const handleClick = () => {
    if (item.id === 'phone') {
      window.location.href = `tel:${item.value.replace(/\s/g, '')}`
    } else if (item.id === 'email') {
      window.location.href = `mailto:${item.value}`
    } else {
      showContactSnackbar(`${item.label}: ${item.value}`)
    }
  }

  return (
    <group
      position={item.position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        {/* Base platform */}
        <mesh ref={ref} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.15, 32]} />
          <meshStandardMaterial
            color={hovered ? item.color : '#1a1a1a'}
            emissive={item.color}
            emissiveIntensity={hovered ? 0.5 : 0.1}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Icon sphere */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color={item.color}
            emissive={item.color}
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* HTML Label */}
        <Html position={[0, -0.8, 0]} center>
          <div
            style={{
              textAlign: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              background: hovered ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0,0,0,0.5)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${hovered ? item.color : 'transparent'}`,
              transition: 'all 0.3s',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
            <div>{item.label}</div>
            {hovered && (
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                {item.value}
              </div>
            )}
          </div>
        </Html>
      </Float>
    </group>
  )
}

export default function ContactZone3D() {
  return (
    <group>
      {/* Desk surface */}
      <mesh position={[0, -21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#0d1f0d" emissive="#1B5E20" emissiveIntensity={0.05} />
      </mesh>

      {contactItems.map((item) => (
        <ContactIcon key={item.id} item={item} />
      ))}
    </group>
  )
}
