import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTimerStore } from '../../stores/timerStore'
import { useSettings } from '../../hooks'
import * as THREE from 'three'

// Import shaders
import sphereVertexShader from '../../shaders/sphereVertex.glsl?raw'
import sphereFragmentShader from '../../shaders/sphereFragment.glsl?raw'

export default function AdvancedSphereMaterial({ mousePosition = { x: 0, y: 0, z: 0 } }) {
  const materialRef = useRef()
  const { sphere } = useTimerStore()
  const { effectiveColors } = useSettings()
  
  const colors = effectiveColors
  
  // Material type mapping
  const materialTypes = {
    liquid: 0,
    crystal: 1,
    plasma: 2,
    glass: 3,
    diamond: 4
  }
  
  // Create environment map
  const envMap = useMemo(() => {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256)
    // For now, we'll use a simple procedural environment
    // In production, this would be a proper HDR environment map
    return cubeRenderTarget.texture
  }, [])
  
  // Shader uniforms
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    breathingPhase: { value: 0 },
    color: { value: new THREE.Color(colors.primary || '#ffffff') },
    metalness: { value: 0.5 },
    roughness: { value: 0.1 },
    opacity: { value: 0.8 },
    glowIntensity: { value: sphere.glowIntensity },
    emissiveColor: { value: new THREE.Color(colors.accent || '#ff0080') },
    materialType: { value: materialTypes[sphere.material] || 0 },
    deformationStrength: { value: 0.1 },
    mousePosition: { value: new THREE.Vector3(mousePosition.x, mousePosition.y, mousePosition.z) },
    mouseInfluence: { value: 0.5 },
    envMap: { value: envMap }
  }), [sphere.material, sphere.glowIntensity, colors, envMap, mousePosition])
  
  // Material configurations for different types
  const materialConfigs = {
    liquid: { metalness: 0.9, roughness: 0.1, opacity: 0.8 },
    crystal: { metalness: 0.1, roughness: 0.0, opacity: 0.7 },
    plasma: { metalness: 0.0, roughness: 0.2, opacity: 0.9 },
    glass: { metalness: 0.0, roughness: 0.0, opacity: 0.3 },
    diamond: { metalness: 0.0, roughness: 0.0, opacity: 0.8 }
  }
  
  const config = materialConfigs[sphere.material] || materialConfigs.liquid
  
  // Update uniforms
  useFrame((state) => {
    if (!materialRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Update time-based uniforms
    materialRef.current.uniforms.time.value = time
    materialRef.current.uniforms.breathingPhase.value = (time * 1000) / sphere.breathingRate * Math.PI * 2
    
    // Update material properties based on sphere state
    materialRef.current.uniforms.metalness.value = config.metalness
    materialRef.current.uniforms.roughness.value = config.roughness
    materialRef.current.uniforms.opacity.value = config.opacity
    materialRef.current.uniforms.glowIntensity.value = sphere.glowIntensity
    materialRef.current.uniforms.materialType.value = materialTypes[sphere.material] || 0
    
    // Update colors
    materialRef.current.uniforms.color.value.set(colors.primary || '#ffffff')
    materialRef.current.uniforms.emissiveColor.value.set(colors.accent || '#ff0080')
    
    // Update mouse position
    materialRef.current.uniforms.mousePosition.value.set(
      mousePosition.x, 
      mousePosition.y, 
      mousePosition.z
    )
  })
  
  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={sphereVertexShader}
      fragmentShader={sphereFragmentShader}
      uniforms={uniforms}
      transparent={true}
      side={THREE.DoubleSide}
      depthWrite={false}
      blending={THREE.NormalBlending}
    />
  )
}