import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function HoverEffects({ 
  mouseData, 
  isActive = false,
  intensity = 1.0 
}) {
  const particlesRef = useRef()
  const glowRef = useRef()
  
  // Generate hover particles
  const hoverParticles = useMemo(() => {
    if (!mouseData || !mouseData.intersectionPoint) return null
    
    const particleCount = 50
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const center = mouseData.intersectionPoint
    const normal = mouseData.normal || new THREE.Vector3(0, 1, 0)
    
    for (let i = 0; i < particleCount; i++) {
      // Create particles in a hemisphere around the intersection point
      const radius = Math.random() * 0.3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.5 // Hemisphere
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      // Transform relative to surface normal
      const particlePos = new THREE.Vector3(x, y, z)
      
      // Align with surface normal
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
      particlePos.applyQuaternion(quaternion)
      particlePos.add(center)
      
      positions[i * 3] = particlePos.x
      positions[i * 3 + 1] = particlePos.y
      positions[i * 3 + 2] = particlePos.z
      
      // Color based on distance from center
      const distance = Math.sqrt(x * x + y * y + z * z)
      const hue = 0.6 - distance * 0.2 // Blue to cyan
      const color = new THREE.Color().setHSL(hue, 0.8, 0.7)
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      sizes[i] = (1 - distance / 0.3) * 0.05
    }
    
    return { positions, colors, sizes }
  }, [mouseData])
  
  // Animate hover effects
  useFrame((state) => {
    if (!isActive || !hoverParticles) return
    
    const time = state.clock.elapsedTime
    
    // Animate particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
      const colors = particlesRef.current.geometry.attributes.color
      
      for (let i = 0; i < positions.count; i++) {
        // Floating animation
        const floatOffset = Math.sin(time * 3 + i * 0.1) * 0.02
        positions.array[i * 3 + 1] += floatOffset
        
        // Pulsing colors
        const pulse = Math.sin(time * 5 + i * 0.2) * 0.3 + 0.7
        colors.array[i * 3] = hoverParticles.colors[i * 3] * pulse
        colors.array[i * 3 + 1] = hoverParticles.colors[i * 3 + 1] * pulse
        colors.array[i * 3 + 2] = hoverParticles.colors[i * 3 + 2] * pulse
      }
      
      positions.needsUpdate = true
      colors.needsUpdate = true
      
      // Rotation
      particlesRef.current.rotation.y = time * 0.5
    }
    
    // Animate glow
    if (glowRef.current && mouseData) {
      glowRef.current.position.copy(mouseData.intersectionPoint)
      
      // Pulsing glow
      const glowIntensity = (Math.sin(time * 4) * 0.3 + 0.7) * intensity
      glowRef.current.scale.setScalar(glowIntensity)
      
      // Color cycling
      const hue = (time * 0.5) % 1
      glowRef.current.material.color.setHSL(hue, 0.8, 0.6)
    }
  })
  
  if (!isActive || !mouseData || !hoverParticles) {
    return null
  }
  
  return (
    <group>
      {/* Hover particles */}
      <Points
        ref={particlesRef}
        positions={hoverParticles.positions}
        colors={hoverParticles.colors}
      >
        <PointMaterial
          transparent
          vertexColors
          size={0.02}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Glow sphere at intersection */}
      <mesh ref={glowRef} position={mouseData.intersectionPoint}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0.6}
          color="#4ecdc4"
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Ring effect */}
      <mesh position={mouseData.intersectionPoint}>
        <ringGeometry args={[0.15, 0.25, 32]} />
        <meshBasicMaterial
          transparent
          opacity={0.4}
          color="#ffffff"
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}