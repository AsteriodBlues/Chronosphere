import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import './index.css'

// Extend OrbitControls
extend({ OrbitControls: ThreeOrbitControls })

// Simple Liquid Metal Sphere
function SimpleLiquidMetalSphere() {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  
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
  
  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
    
    if (meshRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      meshRef.current.scale.setScalar(breathe)
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  const handleSphereClick = () => {
    setIsClicked(true)
    console.log('Entering sphere...')
    setTimeout(() => setIsClicked(false), 1000)
  }

  return (
    <mesh 
      ref={meshRef} 
      material={material}
      onClick={handleSphereClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={{ cursor: isHovered ? 'pointer' : 'default' }}
    >
      <sphereGeometry args={[2, 64, 64]} />
    </mesh>
  )
}

// Camera Controls
function CameraControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })
  
  return <orbitControls ref={controlsRef} args={[camera, gl.domElement]} />
}

// Internal Galaxy Particles
function InternalGalaxy({ count = 1500 }) {
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
      
      const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.5)
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

// Simple HUD without complex imports
function SimpleHUD() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < 768
  
  const panelStyle = {
    position: 'fixed',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: isMobile ? '8px' : '12px',
    padding: isMobile ? '12px' : '16px',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
    fontSize: isMobile ? '14px' : '16px'
  }

  return (
    <>
      {/* Top Bar */}
      <div style={{ ...panelStyle, top: '16px', left: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
          CHRONO.SPHERE
        </div>
        <div style={{ fontSize: '14px', opacity: 0.75 }}>
          Advanced Pomodoro Timer
        </div>
      </div>
      
      {/* Timer Display */}
      <div style={{ 
        ...panelStyle, 
        bottom: '32px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        textAlign: 'center',
        minWidth: '200px'
      }}>
        <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
          25:00
        </div>
        <div style={{ fontSize: '14px', marginBottom: '16px', opacity: 0.8 }}>
          Ready to Focus
        </div>
        <button 
          onClick={() => console.log('Timer started!')}
          onMouseEnter={(e) => e.target.style.background = '#2563eb'}
          onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 24px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: 'scale(1)'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          Start Timer
        </button>
      </div>
      
      {/* Stats Panel */}
      <div style={{ ...panelStyle, top: '16px', right: '16px' }}>
        <div style={{ fontSize: '14px', opacity: 0.75, marginBottom: '8px' }}>
          Today's Progress
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>
          0 sessions completed
        </div>
      </div>
    </>
  )
}

// Main App
export default function AppProgressive() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.3} color="#b3d9ff" />
        <directionalLight position={[5, 5, 5]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-3, -2, 4]} intensity={0.6} color="#4a90e2" />
        <pointLight position={[0, 0, 0]} intensity={0.4} color="#80e0ff" />
        <pointLight position={[10, -10, -5]} intensity={0.3} color="#a0c4ff" />
        <pointLight position={[-8, 8, 3]} intensity={0.25} color="#e0f0ff" />
        
        <Suspense fallback={null}>
          <SimpleLiquidMetalSphere />
          <InternalGalaxy count={1500} />
          <CameraControls />
        </Suspense>
      </Canvas>
      
      {/* Simple HUD */}
      <SimpleHUD />
    </div>
  )
}