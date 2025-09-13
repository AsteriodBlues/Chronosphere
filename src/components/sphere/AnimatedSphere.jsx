import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three'

export default function AnimatedSphere({ theme, sphereRef, children }) {
  const transitionRef = useRef({
    fromColor: new THREE.Color('#0080ff'),
    toColor: new THREE.Color('#0080ff'),
    fromEmissive: new THREE.Color('#001122'),
    toEmissive: new THREE.Color('#001122'),
    progress: 1
  })
  
  const particleTransitionRef = useRef(0)
  const explosionRef = useRef(null)
  
  // Spring animation for smooth transitions
  const [springs, api] = useSpring(() => ({
    scale: 1,
    rotation: 0,
    intensity: 1,
    config: { tension: 120, friction: 14 }
  }))
  
  useEffect(() => {
    if (theme) {
      // Store current colors as "from"
      if (sphereRef.current?.material) {
        transitionRef.current.fromColor.copy(sphereRef.current.material.color)
        transitionRef.current.fromEmissive.copy(sphereRef.current.material.emissive)
      }
      
      // Set new colors as "to"
      transitionRef.current.toColor = new THREE.Color(theme.color)
      transitionRef.current.toEmissive = new THREE.Color(theme.accent)
      transitionRef.current.progress = 0
      
      // Trigger animation effects
      api.start({
        scale: [1, 1.2, 1],
        rotation: Math.PI * 2,
        intensity: [1, 2, 1],
        config: { duration: 800 }
      })
      
      // Create explosion particles effect
      createTransitionEffect()
    }
  }, [theme, api])
  
  const createTransitionEffect = () => {
    const particleCount = 100
    const particles = []
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 2.2
      
      particles.push({
        position: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        life: 1.0,
        size: Math.random() * 0.1 + 0.05
      })
    }
    
    explosionRef.current = particles
  }
  
  useFrame((state, delta) => {
    // Animate color transition
    if (transitionRef.current.progress < 1) {
      transitionRef.current.progress = Math.min(1, transitionRef.current.progress + delta * 2)
      
      if (sphereRef.current?.material) {
        sphereRef.current.material.color.lerpColors(
          transitionRef.current.fromColor,
          transitionRef.current.toColor,
          transitionRef.current.progress
        )
        sphereRef.current.material.emissive.lerpColors(
          transitionRef.current.fromEmissive,
          transitionRef.current.toEmissive,
          transitionRef.current.progress
        )
        
        // Pulse emissive intensity during transition
        const pulse = Math.sin(transitionRef.current.progress * Math.PI) * 0.1
        sphereRef.current.material.emissiveIntensity = 0.05 + pulse
      }
    }
    
    // Animate explosion particles
    if (explosionRef.current) {
      let allDead = true
      
      explosionRef.current.forEach(particle => {
        if (particle.life > 0) {
          particle.life -= delta
          particle.position.add(particle.velocity)
          particle.velocity.multiplyScalar(0.98)
          allDead = false
        }
      })
      
      if (allDead) {
        explosionRef.current = null
      }
    }
    
    // Add rotation during transition
    if (sphereRef.current && transitionRef.current.progress < 1) {
      sphereRef.current.rotation.y += delta * 2
    }
  })
  
  return (
    <>
      {children}
      
      {/* Transition particles */}
      {explosionRef.current && (
        <group>
          {explosionRef.current.map((particle, i) => (
            particle.life > 0 && (
              <mesh key={i} position={particle.position}>
                <sphereGeometry args={[particle.size * particle.life, 8, 6]} />
                <meshBasicMaterial 
                  color={theme?.color || '#ffffff'}
                  transparent
                  opacity={particle.life * 0.6}
                />
              </mesh>
            )
          ))}
        </group>
      )}
      
      {/* Glow sphere during transition */}
      {transitionRef.current.progress < 1 && (
        <mesh scale={[2.1, 2.1, 2.1]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={theme?.color || '#ffffff'}
            transparent
            opacity={0.1 * (1 - transitionRef.current.progress)}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </>
  )
}