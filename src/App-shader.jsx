import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import './index.css'

// Extend OrbitControls
extend({ OrbitControls: ThreeOrbitControls })

// Simple Liquid Metal Sphere without external dependencies
function SimpleLiquidMetalSphere() {
  const meshRef = useRef()
  const materialRef = useRef()
  
  // Create shader material with simplified shaders
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x0080ff) },
        uMetalness: { value: 0.9 },
        uRoughness: { value: 0.1 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Simple displacement
          vec3 pos = position;
          float displacement = sin(position.x * 5.0 + uTime) * 0.05;
          displacement += sin(position.y * 5.0 + uTime * 1.1) * 0.05;
          displacement += sin(position.z * 5.0 + uTime * 0.9) * 0.05;
          pos += normal * displacement;
          
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
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
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(cameraPosition - vPosition);
          
          // Simple metallic effect
          float fresnel = 1.0 - dot(normal, viewDir);
          fresnel = pow(fresnel, 2.0);
          
          vec3 color = uColor;
          color += vec3(fresnel * 0.5);
          
          // Add shimmer
          color += sin(uTime * 2.0) * 0.05;
          
          gl_FragColor = vec4(color, 1.0);
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
          
          {/* Camera Controls */}
          <CameraControls />
        </Suspense>
      </Canvas>
      
      {/* Timer UI */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-2xl p-6 min-w-[380px] border border-white border-opacity-20">
          <div className="text-center mb-6">
            <div className="text-5xl font-mono font-bold text-white mb-2">
              {timer.formatTime(timer.time)}
            </div>
            
            <div className="text-sm text-gray-300 mb-3">
              {timer.sessionType === 'focus' ? '🎯 Focus Session' : '☕ Break Time'}
              {timer.isRunning ? ' • Active' : ' • Ready'}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Session Counter */}
            <div className="text-xs text-gray-400">
              Sessions completed: {timer.sessions}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            {!timer.isRunning ? (
              <button
                onClick={() => timer.setIsRunning(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Start {timer.sessionType === 'focus' ? 'Focus' : 'Break'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => timer.setIsRunning(false)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Pause
                </button>
                <button
                  onClick={() => {
                    timer.setIsRunning(false)
                    timer.setTime(25 * 60)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Stop
                </button>
              </>
            )}
          </div>
          
          {/* Session Type Switcher */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                timer.setSessionType('focus')
                timer.setTime(25 * 60)
                timer.setIsRunning(false)
              }}
              disabled={timer.isRunning}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                timer.sessionType === 'focus'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${timer.isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => {
                timer.setSessionType('break')
                timer.setTime(5 * 60)
                timer.setIsRunning(false)
              }}
              disabled={timer.isRunning}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                timer.sessionType === 'break'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${timer.isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Break (5m)
            </button>
          </div>
        </div>
      </div>
      
      {/* Shader Info */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-50 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="font-bold text-white">Liquid Metal Shader</div>
          <div>✨ Active Displacement</div>
          <div>🌊 Metallic Surface</div>
          <div>💎 Fresnel Effects</div>
          <div>🌌 Internal Galaxy</div>
        </div>
      </div>
    </div>
  )
}