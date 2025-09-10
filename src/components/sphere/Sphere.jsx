import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTimerStore } from '../../stores/timerStore'
import { useSettings } from '../../hooks'
import * as THREE from 'three'
import SphereGeometry from './SphereGeometry'
import SphereMaterial from './SphereMaterial'
import InternalGalaxy from './InternalGalaxy'

export default function Sphere() {
  const sphereRef = useRef()
  const { sphere, timer } = useTimerStore()
  const { visual, getEffectiveColors } = useSettings()
  
  const colors = getEffectiveColors()
  
  // Create highly subdivided sphere geometry for smooth deformation
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(
      2, // radius
      128, // width segments (high for smooth deformation)
      64   // height segments
    )
  }, [])
  
  // Breathing animation
  useFrame((state) => {
    if (!sphereRef.current) return
    
    const time = state.clock.elapsedTime
    
    if (sphere.isBreathing && !sphere.exploding && !sphere.reforming) {
      // Breathing cycle - 4 second cycle by default
      const breathingCycle = (time * 1000) / sphere.breathingRate
      const breathingScale = 1 + Math.sin(breathingCycle * Math.PI * 2) * 0.05
      
      sphereRef.current.scale.setScalar(breathingScale)
      
      // Add subtle rotation during breathing
      sphereRef.current.rotation.y += 0.001
      sphereRef.current.rotation.x += 0.0005
    }
    
    // Pulsing during focus sessions
    if (sphere.pulsing && timer.status === 'focus') {
      const pulseSpeed = 2 // pulses per second
      const pulseIntensity = 0.02
      const pulse = Math.sin(time * pulseSpeed * Math.PI * 2) * pulseIntensity
      
      sphereRef.current.scale.setScalar(1 + pulse)
    }
    
    // Explosion state
    if (sphere.exploding) {
      // The explosion will be handled by the particle system
      // Here we just make the main sphere invisible
      sphereRef.current.visible = false
    } else if (sphere.reforming) {
      // Reformation animation
      const reformProgress = Math.min(time * 0.5, 1) // 2 second reformation
      sphereRef.current.scale.setScalar(reformProgress)
      sphereRef.current.visible = true
    } else {
      sphereRef.current.visible = true
    }
  })
  
  return (
    <group>
      <mesh 
        ref={sphereRef}
        geometry={geometry}
        castShadow={visual.shadows}
        receiveShadow={visual.shadows}
      >
        <SphereMaterial 
          material={sphere.material}
          glowIntensity={sphere.glowIntensity}
          colors={colors}
        />
      </mesh>
      
      {/* Internal galaxy particle system */}
      <InternalGalaxy 
        particleCount={sphere.particleCount}
        visible={!sphere.exploding}
      />
    </group>
  )
}