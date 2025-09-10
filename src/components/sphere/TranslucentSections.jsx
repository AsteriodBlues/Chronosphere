import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTimerStore } from '../../stores/timerStore'
import { useSettings } from '../../hooks'

export default function TranslucentSections() {
  const groupRef = useRef()
  const { sphere } = useTimerStore()
  const { getEffectiveColors } = useSettings()
  
  const colors = getEffectiveColors()
  
  // Create translucent sections that reveal the interior
  const sections = useMemo(() => {
    const sectionCount = 6
    const sections = []
    
    for (let i = 0; i < sectionCount; i++) {
      // Create sections at different positions around the sphere
      const angle = (i / sectionCount) * Math.PI * 2
      const height = (Math.random() - 0.5) * 2
      
      const geometry = new THREE.SphereGeometry(
        2.1, // Slightly larger than main sphere
        32, 
        32,
        angle, // phi start
        Math.PI / 3, // phi length (60 degrees)
        Math.PI * 0.3 + height * 0.1, // theta start
        Math.PI * 0.4 // theta length
      )
      
      const material = new THREE.MeshPhysicalMaterial({
        transparent: true,
        opacity: 0.1,
        transmission: 0.9,
        thickness: 0.1,
        roughness: 0.0,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        color: new THREE.Color(colors.accent || '#4ecdc4'),
        side: THREE.DoubleSide
      })
      
      sections.push({
        geometry,
        material,
        initialAngle: angle,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacityPhase: Math.random() * Math.PI * 2
      })
    }
    
    return sections
  }, [colors])
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.elapsedTime
    
    sections.forEach((section, index) => {
      const mesh = groupRef.current.children[index]
      if (!mesh) return
      
      // Rotate sections independently
      mesh.rotation.y = section.initialAngle + time * section.rotationSpeed
      mesh.rotation.x = Math.sin(time * 0.3 + index) * 0.1
      
      // Animate opacity based on sphere state
      let targetOpacity = 0.1
      
      if (sphere.material === 'crystal') {
        targetOpacity = 0.2
      } else if (sphere.material === 'glass') {
        targetOpacity = 0.05
      } else if (sphere.material === 'plasma') {
        targetOpacity = 0.3
      }
      
      // Breathing effect on translucency
      const breathingPhase = (time * 1000) / sphere.breathingRate * Math.PI * 2
      const breathingMultiplier = 1 + Math.sin(breathingPhase + section.opacityPhase) * 0.3
      
      const currentOpacity = targetOpacity * breathingMultiplier
      section.material.opacity = currentOpacity
      
      // Update transmission for different materials
      if (sphere.material === 'crystal') {
        section.material.transmission = 0.95
        section.material.thickness = 0.2
      } else if (sphere.material === 'glass') {
        section.material.transmission = 0.98
        section.material.thickness = 0.05
      } else {
        section.material.transmission = 0.9
        section.material.thickness = 0.1
      }
      
      // Color animation
      const hue = (time * 0.1 + index * 0.1) % 1
      section.material.color.setHSL(hue, 0.5, 0.7)
    })
    
    // Hide sections during explosion
    groupRef.current.visible = !sphere.exploding
  })
  
  return (
    <group ref={groupRef}>
      {sections.map((section, index) => (
        <mesh
          key={index}
          geometry={section.geometry}
          material={section.material}
        />
      ))}
    </group>
  )
}