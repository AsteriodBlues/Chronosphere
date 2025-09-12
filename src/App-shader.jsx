import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import HUD from './components/HUD'
import Wormhole from './components/Portal/Wormhole'
import { usePortalStore } from './systems/PortalManager'
import './index.css'
import './styles/glass/glassmorphism.css'
import './styles/typography.css'
import './styles/animations/micro-interactions.css'
import './styles/responsive.css'

// Extend OrbitControls
extend({ OrbitControls: ThreeOrbitControls })

// Beautiful Blue-to-White Liquid Metal Sphere
function SimpleLiquidMetalSphere() {
  const meshRef = useRef()
  
  // Create beautiful blue-to-white shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x0040ff) },
        uMetalness: { value: 0.9 },
        uRoughness: { value: 0.1 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        uniform float uTime;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Smooth liquid displacement
          vec3 pos = position;
          float displacement = sin(position.x * 5.0 + uTime) * 0.05;
          displacement += sin(position.y * 5.0 + uTime * 1.1) * 0.05;
          displacement += sin(position.z * 5.0 + uTime * 0.9) * 0.05;
          pos += normal * displacement;
          
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uMetalness;
        uniform float uRoughness;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          
          // Beautiful balanced fresnel effect
          float fresnel = 1.0 - max(0.0, dot(normal, viewDir));
          fresnel = pow(fresnel, 2.0); // Balanced curve
          
          // Perfect blue to white gradient - balanced
          vec3 baseColor = uColor; // Deep blue
          vec3 fresnelColor = vec3(0.9, 0.95, 1.0); // Near-white highlights
          
          // Balanced metallic reflection
          float metallic = smoothstep(0.5, 0.85, fresnel); // Moderate metallic threshold
          vec3 metallicColor = mix(baseColor, fresnelColor, metallic * 0.8);
          
          // Balanced shimmer
          float shimmer = sin(uTime * 2.0 + vPosition.x * 8.0) * 0.08;
          shimmer += sin(uTime * 1.5 + vPosition.y * 6.0) * 0.06;
          
          // Beautiful balanced gradient
          float gradient = (vWorldPosition.y + 2.0) / 4.0;
          vec3 gradientColor = mix(baseColor * 1.1, fresnelColor * 0.8, gradient * 0.5);
          
          // Perfectly balanced combination
          vec3 finalColor = mix(gradientColor, metallicColor, fresnel * 0.6);
          finalColor += shimmer * mix(baseColor, fresnelColor, 0.4); // Balanced shimmer color
          
          // Balanced rim lighting
          float rim = pow(fresnel, 0.8) * 0.5;
          finalColor += rim * fresnelColor;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    })
  }, [])
  
  // Animation loop
  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
    
    if (meshRef.current) {
      // Breathing animation
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      meshRef.current.scale.setScalar(breathe)
      
      // Rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[2, 64, 64]} />
    </mesh>
  )
}

// Camera Controls
function CameraControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = 3
      controlsRef.current.maxDistance = 20
      controlsRef.current.enableDamping = true
      controlsRef.current.dampingFactor = 0.05
    }
  }, [])
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })
  
  return <orbitControls ref={controlsRef} args={[camera, gl.domElement]} />
}

// Internal Galaxy Particles
function InternalGalaxy({ count = 1000 }) {
  const pointsRef = useRef()
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = radius * Math.cos(phi)
      
      const color = new THREE.Color().setHSL(0.6, 0.8, 0.5 + Math.random() * 0.5)
      col[i3] = color.r
      col[i3 + 1] = color.g
      col[i3 + 2] = color.b
    }
    
    return [pos, col]
  }, [count])
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      pointsRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// Timer state (simplified)
function useTimer() {
  const [time, setTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState('focus')
  const [sessions, setSessions] = useState(0)
  
  useEffect(() => {
    if (isRunning && time > 0) {
      const interval = setInterval(() => {
        setTime(t => t - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (time === 0) {
      setIsRunning(false)
      setSessions(s => s + 1)
    }
  }, [isRunning, time])
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return {
    time,
    setTime,
    isRunning,
    setIsRunning,
    sessionType,
    setSessionType,
    sessions,
    formatTime
  }
}

// Portal System Integration
function PortalSystem() {
  const { portals, initializePortals, setHoveredPortal } = usePortalStore()
  
  useEffect(() => {
    initializePortals()
  }, [initializePortals])
  
  const visiblePortals = Array.from(portals.values()).filter(portal => portal.isVisible)
  
  return (
    <group>
      {visiblePortals.map(portal => (
        <Wormhole
          key={portal.id}
          portalData={portal}
          onHover={setHoveredPortal}
          onClick={(portalId) => console.log('Portal clicked:', portalId)}
          isHovered={portal.effectsActive}
        />
      ))}
    </group>
  )
}

// Main App
export default function AppWithShader() {
  const timer = useTimer()
  const progress = ((25 * 60 - timer.time) / (25 * 60)) * 100
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4ecdc4" />
        <pointLight position={[0, 0, 0]} intensity={0.3} />
        
        <Suspense fallback={null}>
          {/* Liquid Metal Sphere */}
          <SimpleLiquidMetalSphere />
          
          {/* Internal Galaxy */}
          <InternalGalaxy count={1500} />
          
          {/* Portal System */}
          <PortalSystem />
          
          {/* Camera Controls */}
          <CameraControls />
        </Suspense>
      </Canvas>
      
      {/* Advanced HUD System */}
      <HUD />
      
    </div>
  )
}