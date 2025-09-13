import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSettings } from '../../hooks'
import { useTimerStore } from '../../stores/timerStore'
import InternalGalaxy from './InternalGalaxy'
import HeartbeatController from './HeartbeatController'
import * as THREE from 'three'

export default function Sphere({ theme }) {
  const sphereRef = useRef()
  const { effectiveColors, visual } = useSettings()
  const { sphere } = useTimerStore()
  
  // Use theme colors if provided, otherwise use settings colors
  const sphereColor = theme?.color || effectiveColors?.primary || "#0080ff"
  const emissiveColor = theme?.accent || effectiveColors?.accent || "#001122"
  
  // Basic breathing animation
  useFrame((state) => {
    if (sphereRef.current) {
      const time = state.clock.getElapsedTime()
      const breathe = 1 + Math.sin(time * 0.5) * 0.1
      sphereRef.current.scale.setScalar(breathe)
      sphereRef.current.rotation.y = time * 0.1
    }
  })
  
  return (
    <group>
      {/* Main sphere with enhanced material (no environment mapping) */}
      <mesh ref={sphereRef} position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhysicalMaterial 
          color={sphereColor}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          emissive={emissiveColor}
          emissiveIntensity={0.05}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Internal galaxy particle system */}
      <InternalGalaxy 
        particleCount={sphere?.particleCount || 2000}
        visible={!sphere?.exploding}
        particleColor={theme?.particleColor}
      />
      
      {/* Heartbeat pulsing controller */}
      <HeartbeatController sphereRef={sphereRef} />
    </group>
  )
}