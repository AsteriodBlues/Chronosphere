import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { portalConfigurations } from '../../constants/portalTypes'

export default function Wormhole({ 
  portalData,
  sphereRadius = 2,
  onHover,
  onClick,
  isHovered = false
}) {
  const wormholeRef = useRef()
  const particlesRef = useRef()
  const energyRingRef = useRef()
  const distortionRef = useRef()
  
  const config = portalConfigurations[portalData.type]
  
  // Calculate world position from spherical coordinates
  const worldPosition = useMemo(() => {
    const theta = portalData.position.theta
    const phi = portalData.position.phi
    const radius = sphereRadius + 0.1
    
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }, [portalData.position, sphereRadius])
  
  // Create wormhole geometry with spiral effect
  const wormholeGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(
      0, // Top radius (entry point)
      portalData.currentSize * 2, // Bottom radius
      portalData.currentSize * 4, // Height (depth)
      32, // Radial segments
      8, // Height segments
      true // Open ended
    )
    
    // Modify vertices for spiral effect
    const positions = geometry.attributes.position.array
    const vertexCount = positions.length / 3
    
    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      
      // Create spiral distortion
      const radius = Math.sqrt(x * x + z * z)
      const angle = Math.atan2(z, x)
      const spiralFactor = y * 0.5
      
      const newAngle = angle + spiralFactor * 2
      positions[i3] = radius * Math.cos(newAngle) * (1 + spiralFactor * 0.1)
      positions[i3 + 2] = radius * Math.sin(newAngle) * (1 + spiralFactor * 0.1)
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    return geometry
  }, [portalData.currentSize])
  
  // Create particle system for energy streams
  const particleSystem = useMemo(() => {
    if (!config.effects.hasParticles) return null
    
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const color = new THREE.Color(config.colorPalette.primary)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Spiral particle positions
      const t = (i / particleCount) * Math.PI * 4
      const radius = (Math.random() * 0.5 + 0.5) * portalData.currentSize
      const height = (Math.random() - 0.5) * portalData.currentSize * 4
      
      positions[i3] = radius * Math.cos(t)
      positions[i3 + 1] = height
      positions[i3 + 2] = radius * Math.sin(t)
      
      // Particle velocities (inward spiral)
      velocities[i3] = -positions[i3] * 0.01
      velocities[i3 + 1] = -0.02
      velocities[i3 + 2] = -positions[i3 + 2] * 0.01
      
      // Color variations
      colors[i3] = color.r * (0.8 + Math.random() * 0.4)
      colors[i3 + 1] = color.g * (0.8 + Math.random() * 0.4)
      colors[i3 + 2] = color.b * (0.8 + Math.random() * 0.4)
      
      sizes[i] = Math.random() * 0.01 + 0.005
    }
    
    return {
      positions: new THREE.BufferAttribute(positions, 3),
      velocities,
      colors: new THREE.BufferAttribute(colors, 3),
      sizes: new THREE.BufferAttribute(sizes, 1)
    }
  }, [config, portalData.currentSize])
  
  // Create energy ring geometry
  const energyRingGeometry = useMemo(() => {
    return new THREE.RingGeometry(
      portalData.currentSize * 1.5,
      portalData.currentSize * 2,
      32
    )
  }, [portalData.currentSize])
  
  // Wormhole material with shader
  const wormholeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(config.colorPalette.primary) },
        uDepth: { value: portalData.currentSize * 4 },
        uIntensity: { value: config.glowIntensity },
        uDistortion: { value: config.effects.hasDistortion ? 0.1 : 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float uTime;
        uniform float uDistortion;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          
          vec3 pos = position;
          
          // Add distortion effect
          if (uDistortion > 0.0) {
            float wave = sin(pos.y * 10.0 + uTime * 3.0) * uDistortion;
            pos.x += wave * sin(uTime * 2.0);
            pos.z += wave * cos(uTime * 2.0);
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uDepth;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          // Create depth illusion
          float depth = (vPosition.y + uDepth * 0.5) / uDepth;
          depth = clamp(depth, 0.0, 1.0);
          
          // Spiral pattern
          vec2 center = vec2(0.5, 0.5);
          vec2 pos = vUv - center;
          float angle = atan(pos.y, pos.x);
          float radius = length(pos);
          
          float spiral = sin(angle * 8.0 + radius * 20.0 - uTime * 5.0);
          spiral = (spiral + 1.0) * 0.5;
          
          // Energy glow
          float glow = 1.0 - radius * 2.0;
          glow = pow(glow, 3.0);
          
          // Final color
          vec3 color = uColor * spiral * glow * uIntensity;
          color += uColor * 0.3 * (1.0 - depth);
          
          float alpha = glow * (1.0 - depth * 0.7);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  }, [config, portalData.currentSize])
  
  // Energy ring material
  const energyRingMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(config.colorPalette.accent) },
        uIntensity: { value: config.glowIntensity * 0.5 },
        uPulse: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uPulse;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          float ring = 1.0 - smoothstep(0.3, 0.5, dist);
          ring *= smoothstep(0.2, 0.3, dist);
          
          float pulse = sin(uTime * 4.0 + uPulse) * 0.5 + 0.5;
          float intensity = uIntensity * (0.7 + pulse * 0.3);
          
          vec3 color = uColor * ring * intensity;
          gl_FragColor = vec4(color, ring);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  }, [config])
  
  // Animation loop
  useFrame((state, delta) => {
    if (!wormholeRef.current) return
    
    // Update time uniforms
    if (wormholeMaterial.uniforms) {
      wormholeMaterial.uniforms.uTime.value = state.clock.elapsedTime
    }
    
    if (energyRingMaterial.uniforms) {
      energyRingMaterial.uniforms.uTime.value = state.clock.elapsedTime
      energyRingMaterial.uniforms.uPulse.value = portalData.pulsePhase
    }
    
    // Rotate wormhole
    wormholeRef.current.rotation.y += delta * 0.5
    
    if (energyRingRef.current) {
      energyRingRef.current.rotation.z += delta * 1.0
    }
    
    // Animate particles
    if (particlesRef.current && particleSystem) {
      const positions = particlesRef.current.geometry.attributes.position.array
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += particleSystem.velocities[i]
        positions[i + 1] += particleSystem.velocities[i + 1]
        positions[i + 2] += particleSystem.velocities[i + 2]
        
        // Reset particles that have moved too far
        if (positions[i + 1] < -portalData.currentSize * 2) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * portalData.currentSize
          positions[i] = radius * Math.cos(angle)
          positions[i + 1] = portalData.currentSize * 2
          positions[i + 2] = radius * Math.sin(angle)
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // Hover effects
    if (isHovered) {
      const hoverScale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1
      wormholeRef.current.scale.setScalar(hoverScale)
    } else {
      wormholeRef.current.scale.setScalar(1)
    }
  })
  
  // Position wormhole on sphere surface
  useEffect(() => {
    if (wormholeRef.current) {
      wormholeRef.current.position.copy(worldPosition)
      
      // Orient wormhole to face outward from sphere
      const normal = worldPosition.clone().normalize()
      wormholeRef.current.lookAt(
        worldPosition.clone().add(normal)
      )
    }
  }, [worldPosition])
  
  if (!portalData.isVisible) return null
  
  return (
    <group
      ref={wormholeRef}
      onPointerEnter={() => onHover?.(portalData.id)}
      onPointerLeave={() => onHover?.(null)}
      onClick={() => onClick?.(portalData.id)}
    >
      {/* Main wormhole structure */}
      <mesh geometry={wormholeGeometry} material={wormholeMaterial} />
      
      {/* Energy ring */}
      <mesh
        ref={energyRingRef}
        geometry={energyRingGeometry}
        material={energyRingMaterial}
        position={[0, 0, 0.01]}
      />
      
      {/* Particle system */}
      {config.effects.hasParticles && particleSystem && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              {...particleSystem.positions}
            />
            <bufferAttribute
              attach="attributes-color"
              {...particleSystem.colors}
            />
            <bufferAttribute
              attach="attributes-size"
              {...particleSystem.sizes}
            />
          </bufferGeometry>
          <pointsMaterial
            vertexColors
            transparent
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      )}
      
      {/* Magnetic field visualization */}
      {config.effects.hasMagneticField && portalData.effectsActive && (
        <mesh>
          <sphereGeometry args={[portalData.currentSize * 3, 16, 16]} />
          <meshBasicMaterial
            color={config.colorPalette.secondary}
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
    </group>
  )
}