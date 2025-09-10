import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SurfaceRipples({ ripples = [], sphereRadius = 2 }) {
  const ripplesRef = useRef()
  
  // Create ripple geometries
  const rippleGeometries = useMemo(() => {
    return ripples.map((ripple, index) => {
      const geometry = new THREE.RingGeometry(
        0.1, // inner radius
        0.5, // outer radius
        32   // segments
      )
      
      // Position on sphere surface
      const position = ripple.position.clone().normalize().multiplyScalar(sphereRadius + 0.01)
      
      // Create lookAt matrix to orient ripple to sphere surface
      const lookAtMatrix = new THREE.Matrix4()
      const up = new THREE.Vector3(0, 1, 0)
      const normal = position.clone().normalize()
      
      // Create rotation to align with sphere surface
      if (Math.abs(normal.dot(up)) > 0.99) {
        up.set(1, 0, 0) // Use different up vector if too aligned
      }
      
      const tangent = new THREE.Vector3().crossVectors(normal, up).normalize()
      const bitangent = new THREE.Vector3().crossVectors(normal, tangent)
      
      lookAtMatrix.makeBasis(tangent, bitangent, normal)
      
      return {
        geometry,
        position,
        rotation: new THREE.Euler().setFromRotationMatrix(lookAtMatrix),
        life: ripple.life || 1.0,
        maxRadius: ripple.maxRadius || 0.8,
        speed: ripple.speed || 2.0,
        intensity: ripple.intensity || 1.0,
        startTime: ripple.startTime || 0
      }
    })
  }, [ripples, sphereRadius])
  
  useFrame((state) => {
    if (!ripplesRef.current) return
    
    const time = state.clock.elapsedTime
    
    rippleGeometries.forEach((rippleData, index) => {
      const mesh = ripplesRef.current.children[index]
      if (!mesh) return
      
      const age = time - rippleData.startTime
      const normalizedAge = Math.min(age / rippleData.life, 1)
      
      if (normalizedAge >= 1) {
        mesh.visible = false
        return
      }
      
      mesh.visible = true
      
      // Update ripple expansion
      const currentRadius = normalizedAge * rippleData.maxRadius
      const ringThickness = 0.1 + normalizedAge * 0.2
      
      // Update geometry
      mesh.geometry.dispose()
      mesh.geometry = new THREE.RingGeometry(
        Math.max(0, currentRadius - ringThickness),
        currentRadius,
        32
      )
      
      // Update position and rotation
      mesh.position.copy(rippleData.position)
      mesh.rotation.copy(rippleData.rotation)
      
      // Update material opacity based on age
      const opacity = rippleData.intensity * (1 - normalizedAge) * 0.8
      mesh.material.opacity = opacity
      
      // Color shift over time
      const hue = 0.6 + normalizedAge * 0.4 // Blue to purple
      mesh.material.color.setHSL(hue, 0.8, 0.6)
      
      // Scale pulsing effect
      const pulseScale = 1 + Math.sin(age * rippleData.speed * 10) * 0.1 * (1 - normalizedAge)
      mesh.scale.setScalar(pulseScale)
    })
  })
  
  return (
    <group ref={ripplesRef}>
      {rippleGeometries.map((_, index) => (
        <mesh key={index}>
          <ringGeometry args={[0.1, 0.5, 32]} />
          <meshBasicMaterial
            transparent
            opacity={0.8}
            color="#4ecdc4"
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}