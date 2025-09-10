import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

export default function SphereMaterial({ 
  material = 'liquid', 
  glowIntensity = 0.5, 
  colors = {} 
}) {
  const materialRef = useRef()
  
  // Create environment map for reflections
  const envMap = useMemo(() => {
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    // For now, create a simple gradient environment
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    // Create gradient from dark to light
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#87ceeb')
    gradient.addColorStop(1, '#1a1a2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])
  
  // Material configurations for different types
  const materialConfigs = useMemo(() => ({
    liquid: {
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 1.5,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1
    },
    crystal: {
      metalness: 0.1,
      roughness: 0.0,
      transparent: true,
      opacity: 0.7,
      envMapIntensity: 2.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      transmission: 0.95,
      thickness: 0.5
    },
    plasma: {
      metalness: 0.0,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 0.5,
      emissive: colors.primary || '#ff0080',
      emissiveIntensity: glowIntensity * 2
    },
    glass: {
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.3,
      envMapIntensity: 1.0,
      transmission: 0.98,
      thickness: 0.2
    },
    diamond: {
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 3.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      transmission: 0.8,
      ior: 2.4
    }
  }), [glowIntensity, colors])
  
  const config = materialConfigs[material] || materialConfigs.liquid
  
  // Animate material properties
  useFrame((state) => {
    if (!materialRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Animate based on material type
    switch (material) {
      case 'liquid':
        // Subtle metalness variation for liquid mercury effect
        materialRef.current.metalness = config.metalness + Math.sin(time * 2) * 0.05
        break
        
      case 'plasma':
        // Pulsing emissive for plasma effect
        materialRef.current.emissiveIntensity = config.emissiveIntensity + Math.sin(time * 4) * 0.5
        break
        
      case 'crystal':
        // Subtle opacity variation for breathing crystal
        materialRef.current.opacity = config.opacity + Math.sin(time * 1.5) * 0.1
        break
        
      default:
        break
    }
    
    // Global glow intensity animation
    if (materialRef.current.emissive) {
      const baseEmissive = new THREE.Color(colors.primary || '#ffffff')
      const intensity = glowIntensity + Math.sin(time * 3) * 0.2
      materialRef.current.emissive = baseEmissive.multiplyScalar(intensity)
    }
  })
  
  return (
    <meshPhysicalMaterial
      ref={materialRef}
      color={colors.primary || '#ffffff'}
      envMap={envMap}
      side={THREE.DoubleSide}
      {...config}
    />
  )
}