import { useState, useRef } from 'react'
import Sphere from './Sphere'
import MouseInteraction from './MouseInteraction'
import SurfaceRipples from './SurfaceRipples'
import HoverEffects from './HoverEffects'
import SpherePhysics from './SpherePhysics'

export default function InteractiveSphere() {
  const sphereRef = useRef()
  const [mouseData, setMouseData] = useState(null)
  const [ripples, setRipples] = useState([])
  const [rotationData, setRotationData] = useState(null)
  
  const handleMouseUpdate = (data) => {
    setMouseData(data)
    
    // Update mouse position for advanced sphere material
    if (sphereRef.current && data.localPosition) {
      // This would update the shader uniforms
      if (sphereRef.current.material && sphereRef.current.material.uniforms) {
        sphereRef.current.material.uniforms.mousePosition.value.copy(data.localPosition)
        sphereRef.current.material.uniforms.mouseInfluence.value = data.isHovering ? 1.0 : 0.0
      }
    }
  }
  
  const handleClick = (intersectionPoint) => {
    // Create ripple at click position
    const newRipple = {
      position: intersectionPoint.clone(),
      life: 2.0,
      maxRadius: 0.8,
      speed: 2.0,
      intensity: 1.0,
      startTime: Date.now() * 0.001
    }
    
    setRipples(prev => [...prev.slice(-4), newRipple]) // Keep last 5 ripples
  }
  
  const handleRotationUpdate = (data) => {
    setRotationData(data)
  }
  
  // Clean up old ripples
  const activeRipples = ripples.filter(ripple => {
    const age = (Date.now() * 0.001) - ripple.startTime
    return age < ripple.life
  })
  
  return (
    <group>
      {/* Main sphere */}
      <Sphere ref={sphereRef} mouseData={mouseData} />
      
      {/* Mouse interaction layer */}
      <MouseInteraction 
        sphereRef={sphereRef}
        onMouseUpdate={handleMouseUpdate}
      />
      
      {/* Physics system */}
      <SpherePhysics
        sphereRef={sphereRef}
        mouseData={mouseData}
        onRotationUpdate={handleRotationUpdate}
      />
      
      {/* Surface ripples */}
      <SurfaceRipples 
        ripples={activeRipples}
        sphereRadius={2}
      />
      
      {/* Hover effects */}
      <HoverEffects
        mouseData={mouseData}
        isActive={mouseData?.isHovering}
        intensity={1.0}
      />
    </group>
  )
}