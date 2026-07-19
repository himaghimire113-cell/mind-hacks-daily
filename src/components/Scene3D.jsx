import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Stars, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, FXAA } from '@react-three/postprocessing'
import SchoolEmblem3D from './SchoolEmblem3D'
import Programs3D from './Programs3D'
import Stats3D from './Stats3D'
import Testimonials3D from './Testimonials3D'
import ContactZone3D from './ContactZone3D'
import Particles from './Particles'
import CameraController from './CameraController'
import { useAppStore } from '../store'

export default function Scene3D() {
  const performanceMode = useAppStore((s) => s.performanceMode)

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{
        antialias: !performanceMode,
        powerPreference: performanceMode ? 'low-power' : 'high-performance',
        alpha: true,
      }}
      dpr={performanceMode ? [1, 1] : [1, 2]}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={performanceMode ? 0.4 : 0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#4CAF50" />
        <pointLight position={[5, -3, 5]} intensity={0.3} color="#81C784" />

        {/* Fog for depth */}
        {!performanceMode && <fog attach="fog" args={['#0a0a0a', 10, 30]} />}

        {/* Stars background */}
        {!performanceMode && <Stars radius={50} depth={50} count={1000} factor={3} saturation={0} fade speed={1} />}

        {/* Scene objects */}
        <SchoolEmblem3D />
        <Programs3D />
        <Stats3D />
        <Testimonials3D />
        <ContactZone3D />
        <Particles count={performanceMode ? 50 : 200} />

        {/* Camera */}
        <CameraController />

        {/* Post-processing */}
        {!performanceMode && (
          <EffectComposer>
            <Bloom intensity={0.4} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
            <FXAA />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  )
}
