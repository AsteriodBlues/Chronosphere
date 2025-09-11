import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useSettings } from '../../hooks'

export default function InternalGalaxy({ particleCount = 1000, visible = true }) {
  const pointsRef = useRef()
  const { effectiveColors, visual } = useSettings()
  const colors = effectiveColors
  
  // Generate galaxy particle positions
  const [positions, colors_array, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors_array = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const color = new THREE.Color()
    
    for (let i = 0; i < particleCount; i++) {
      // Create galaxy spiral pattern inside sphere
      const i3 = i * 3
      
      // Generate spiral galaxy shape
      const radius = Math.random() * 1.8 // Keep inside sphere radius of 2
      const spiralAngle = radius * 3 + Math.random() * Math.PI * 0.2
      const height = (Math.random() - 0.5) * 0.4 // Flatten the galaxy
      
      // Convert to cartesian coordinates
      positions[i3] = Math.cos(spiralAngle) * radius
      positions[i3 + 1] = height
      positions[i3 + 2] = Math.sin(spiralAngle) * radius
      
      // Color based on distance from center
      const distanceFromCenter = Math.sqrt(
        positions[i3] ** 2 + 
        positions[i3 + 1] ** 2 + 
        positions[i3 + 2] ** 2
      )
      
      // Color gradient from center to edge
      if (distanceFromCenter < 0.5) {
        // Core - bright white/yellow
        color.setHSL(0.15, 0.8, 0.9)
      } else if (distanceFromCenter < 1.0) {
        // Middle - blue/purple
        color.setHSL(0.7, 0.7, 0.7)
      } else {
        // Outer - red/orange
        color.setHSL(0.05, 0.9, 0.6)
      }
      
      colors_array[i3] = color.r
      colors_array[i3 + 1] = color.g
      colors_array[i3 + 2] = color.b
      
      // Size based on distance (closer = larger)
      sizes[i] = (2 - distanceFromCenter) * 0.02 + Math.random() * 0.01
    }
    
    return [positions, colors_array, sizes]
  }, [particleCount])
  
  // Animate the galaxy
  useFrame((state) => {
    if (!pointsRef.current || !visible) return
    
    const time = state.clock.elapsedTime
    
    // Rotate the entire galaxy slowly
    pointsRef.current.rotation.y = time * 0.05
    pointsRef.current.rotation.x = Math.sin(time * 0.02) * 0.1
    
    // Animate individual particles
    const positions_attr = pointsRef.current.geometry.attributes.position
    const colors_attr = pointsRef.current.geometry.attributes.color
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Get original position
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      
      // Add subtle floating animation
      const floatOffset = Math.sin(time * 0.5 + i * 0.01) * 0.02
      positions_attr.array[i3 + 1] = y + floatOffset
      
      // Add spiral motion
      const spiralSpeed = 0.01
      const angle = Math.atan2(z, x) + spiralSpeed * time
      const radius = Math.sqrt(x * x + z * z)
      
      positions_attr.array[i3] = Math.cos(angle) * radius
      positions_attr.array[i3 + 2] = Math.sin(angle) * radius
      
      // Animate colors for twinkling effect
      const twinkle = Math.sin(time * 2 + i * 0.1) * 0.3 + 0.7
      colors_attr.array[i3] = colors_array[i3] * twinkle
      colors_attr.array[i3 + 1] = colors_array[i3 + 1] * twinkle
      colors_attr.array[i3 + 2] = colors_array[i3 + 2] * twinkle
    }
    
    positions_attr.needsUpdate = true
    colors_attr.needsUpdate = true
  })
  
  if (!visible) return null
  
  return (
    <Points ref={pointsRef} positions={positions} colors={colors_array}>
      <PointMaterial
        transparent
        vertexColors
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}