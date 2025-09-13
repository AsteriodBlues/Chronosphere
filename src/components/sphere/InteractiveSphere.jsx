import { useState, useRef } from 'react'
import Sphere from './Sphere'
import MouseInteraction from './MouseInteraction'
import SurfaceRipples from './SurfaceRipples'
import HoverEffects from './HoverEffects'
import SpherePhysics from './SpherePhysics'
import SphereSelector, { sphereThemes } from './SphereSelector'
import AnimatedSphere from './AnimatedSphere'

export default function InteractiveSphere() {
  const sphereRef = useRef()
  const [mouseData, setMouseData] = useState(null)
  const [ripples, setRipples] = useState([])
  const [rotationData, setRotationData] = useState(null)
  const [currentTheme, setCurrentTheme] = useState('power')
  
  const handleMouseUpdate = (data) => {
    setMouseData(data)
    
    // Update mouse position for sphere material deformation
    if (sphereRef.current && data.localPosition) {
      // Future: This will update shader uniforms for deformation
      if (sphereRef.current.material && sphereRef.current.material.uniforms) {
        if (sphereRef.current.material.uniforms.mousePosition) {
          sphereRef.current.material.uniforms.mousePosition.value.copy(data.localPosition)
        }
        if (sphereRef.current.material.uniforms.mouseInfluence) {
          sphereRef.current.material.uniforms.mouseInfluence.value = data.isHovering ? 1.0 : 0.0
        }
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
  
  const handleThemeChange = (theme) => {
    setCurrentTheme(theme.id)
  }

  const activeTheme = sphereThemes.find(t => t.id === currentTheme) || sphereThemes[0]

  return (
    <>
      {/* Sphere Theme Selector UI */}
      <SphereSelector 
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
      
      <group>
        {/* Animated wrapper for theme transitions */}
        <AnimatedSphere theme={activeTheme} sphereRef={sphereRef}>
          {/* Main sphere with internal galaxy */}
          <Sphere 
            ref={sphereRef} 
            mouseData={mouseData}
            theme={activeTheme}
          />
        </AnimatedSphere>
        
        {/* Mouse interaction system */}
        <MouseInteraction 
          sphereRef={sphereRef}
          onMouseUpdate={handleMouseUpdate}
          onClick={handleClick}
        />
        
        {/* Hover effects */}
        <HoverEffects
          mouseData={mouseData}
          isActive={mouseData?.isHovering}
          intensity={1.0}
        />
        
        {/* Physics system for momentum-based rotation */}
        <SpherePhysics
          sphereRef={sphereRef}
          mouseData={mouseData}
          onRotationUpdate={handleRotationUpdate}
        />
      </group>
    </>
  )
}