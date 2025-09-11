import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
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
      positions[i3 + 1] = height * (1 - radius / 2) // Compress center
      positions[i3 + 2] = Math.sin(spiralAngle) * radius
      
      // Color based on distance from center (hot center, cool edges)
      const distanceFromCenter = Math.sqrt(
        positions[i3] ** 2 + 
        positions[i3 + 1] ** 2 + 
        positions[i3 + 2] ** 2
      )
      
      // Create gradient from center (bright) to edge (dim)
      const intensity = 1 - (distanceFromCenter / 2)
      
      // Use effective colors from settings
      if (colors?.primary) {
        color.set(colors.primary)
      } else {
        // Fallback color gradient (blue to purple)
        color.setHSL(0.6 + distanceFromCenter * 0.2, 0.8, intensity)
      }
      
      colors_array[i3] = color.r
      colors_array[i3 + 1] = color.g
      colors_array[i3 + 2] = color.b
      
      // Particle size based on distance
      sizes[i] = Math.random() * 0.05 * (1 + intensity)
    }
    
    return [positions, colors_array, sizes]
  }, [particleCount, colors])
  
  // Animate galaxy rotation and pulsing
  useFrame((state) => {
    if (pointsRef.current && visible) {
      const time = state.clock.elapsedTime
      
      // Slow rotation
      pointsRef.current.rotation.y = time * 0.05
      
      // Gentle pulsing
      const pulse = 1 + Math.sin(time * 0.5) * 0.1
      pointsRef.current.scale.setScalar(pulse)
      
      // Update particle colors for shimmer effect
      const geometry = pointsRef.current.geometry
      const colors = geometry.attributes.color
      
      for (let i = 0; i < colors.count; i++) {
        const i3 = i * 3
        const shimmer = Math.sin(time * 2 + i * 0.1) * 0.2 + 0.8
        colors.array[i3] = colors_array[i3] * shimmer
        colors.array[i3 + 1] = colors_array[i3 + 1] * shimmer
        colors.array[i3 + 2] = colors_array[i3 + 2] * shimmer
      }
      
      colors.needsUpdate = true
    }
  })
  
  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geometry
  }, [positions, colors_array, sizes])
  
  const pointsMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  }, [])
  
  if (!visible) return null
  
  return (
    <points ref={pointsRef} geometry={pointsGeometry} material={pointsMaterial} />
  )
}