import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function InternalGalaxySimple({ particleCount = 1000 }) {
  const pointsRef = useRef()
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const radius = Math.random() * 1.8
      const angle = radius * 3 + Math.random() * Math.PI * 2
      
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = (Math.random() - 0.5) * 0.4
      positions[i3 + 2] = Math.sin(angle) * radius
      
      colors[i3] = 0.5 + Math.random() * 0.5
      colors[i3 + 1] = 0.5 + Math.random() * 0.5
      colors[i3 + 2] = 1.0
    }
    
    return [positions, colors]
  }, [particleCount])
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function AnimatedSphere() {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      const breathe = 1 + Math.sin(state.clock.elapsedTime) * 0.05
      meshRef.current.scale.setScalar(breathe)
    }
  })
  
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhysicalMaterial 
          color="#0080ff"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          emissive="#001122"
          emissiveIntensity={0.05}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Internal galaxy particles */}
      <InternalGalaxySimple particleCount={2000} />
    </group>
  )
}

function WorkingApp() {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState('focus')
  
  useEffect(() => {
    let interval = null
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
      // Session complete
    }
    return () => clearInterval(interval)
  }, [isRunning, time])
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const handleStart = () => {
    setIsRunning(true)
  }
  
  const handlePause = () => {
    setIsRunning(false)
  }
  
  const handleStop = () => {
    setIsRunning(false)
    setTime(25 * 60)
  }
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <AnimatedSphere />
        </Suspense>
      </Canvas>
      
      {/* Timer UI */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black bg-opacity-50 rounded-2xl p-6 backdrop-blur-sm border border-white border-opacity-20 min-w-[320px]">
          <div className="text-center mb-6">
            <div className="text-4xl font-mono font-bold text-white mb-2">
              {formatTime(time)}
            </div>
            <div className="text-sm text-gray-300 mb-3">
              {isRunning ? 'Focus Session Active' : 'Ready to Focus'}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((25 * 60 - time) / (25 * 60)) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Start Focus
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                >
                  Pause
                </button>
                <button
                  onClick={handleStop}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkingApp