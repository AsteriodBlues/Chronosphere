import { useMemo } from 'react'
import * as THREE from 'three'
import { useSettings } from '../../hooks'

export default function Environment() {
  const { visual, getEffectiveColors } = useSettings()
  const colors = getEffectiveColors()
  
  // Create starfield background
  const starfield = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const starCount = 2000
    const positions = new Float32Array(starCount * 3)
    const colors_array = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    
    for (let i = 0; i < starCount; i++) {
      // Distribute stars on a large sphere
      const radius = 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Star colors - mostly white with some colored ones
      const color = new THREE.Color()
      if (Math.random() < 0.8) {
        // White stars
        color.setHSL(0, 0, Math.random() * 0.3 + 0.7)
      } else {
        // Colored stars
        color.setHSL(Math.random(), 0.3, 0.8)
      }
      
      colors_array[i * 3] = color.r
      colors_array[i * 3 + 1] = color.g
      colors_array[i * 3 + 2] = color.b
      
      sizes[i] = Math.random() * 2 + 1
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    return geometry
  }, [])
  
  // Create nebula clouds
  const nebulaClouds = useMemo(() => {
    if (visual.backgroundType === 'minimal') return null
    
    const clouds = []
    const cloudCount = 5
    
    for (let i = 0; i < cloudCount; i++) {
      const geometry = new THREE.SphereGeometry(20, 16, 16)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.5, 0.3),
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 200
      )
      
      clouds.push(mesh)
    }
    
    return clouds
  }, [visual.backgroundType])
  
  return (
    <group>
      {/* Starfield */}
      <points geometry={starfield}>
        <pointsMaterial
          vertexColors
          size={2}
          sizeAttenuation={false}
          transparent
          alphaTest={0.5}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Nebula clouds */}
      {nebulaClouds && nebulaClouds.map((cloud, index) => (
        <primitive key={index} object={cloud} />
      ))}
      
      {/* Ambient fog for depth */}
      {visual.backgroundType !== 'minimal' && (
        <fog 
          attach="fog" 
          color={colors.background || '#1a1a2e'} 
          near={50} 
          far={200} 
        />
      )}
    </group>
  )
}