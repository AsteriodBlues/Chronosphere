import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'

// Extend OrbitControls
extend({ OrbitControls: ThreeOrbitControls })

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

// Internal Galaxy Component
function InternalGalaxy({ particleCount = 2000, isRunning }) {
  const pointsRef = useRef()
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const radius = Math.random() * 1.8
      const spiralAngle = radius * 3 + Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 0.4
      
      positions[i3] = Math.cos(spiralAngle) * radius
      positions[i3 + 1] = height * (1 - radius / 2)
      positions[i3 + 2] = Math.sin(spiralAngle) * radius
      
      const intensity = 1 - (radius / 2)
      const hue = 0.6 + radius * 0.2
      const color = new THREE.Color().setHSL(hue, 0.8, intensity)
      
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
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
      const time = state.clock.elapsedTime
      pointsRef.current.rotation.y = time * 0.05
      
      // Faster rotation when timer is running
      if (isRunning) {
        pointsRef.current.rotation.y += time * 0.02
      }
      
      // Pulsing
      const pulse = 1 + Math.sin(time * 0.5) * 0.1
      pointsRef.current.scale.setScalar(pulse)
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
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

// Main Sphere Component
function ChronoSphere({ isRunning, sessionType }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      
      // Breathing animation
      const breatheRate = isRunning ? 3 : 4 // Faster breathing when active
      const breathe = 1 + Math.sin(time * (Math.PI / breatheRate)) * 0.08
      meshRef.current.scale.setScalar(breathe)
      
      // Rotation
      meshRef.current.rotation.y = time * 0.1
      if (isRunning) {
        meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
      }
    }
  })
  
  // Different colors for different states
  const sphereColor = sessionType === 'focus' ? '#0080ff' : 
                      sessionType === 'break' ? '#00ff80' : '#ff8000'
  
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhysicalMaterial 
          color={sphereColor}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          emissive={sphereColor}
          emissiveIntensity={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Internal galaxy particles */}
      <InternalGalaxy particleCount={2000} isRunning={isRunning} />
    </group>
  )
}

// Environment
function Environment() {
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const starCount = 1000
    const positions = new Float32Array(starCount * 3)
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const radius = 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [])
  
  return (
    <points geometry={starsGeometry}>
      <pointsMaterial
        color="#ffffff"
        size={2}
        sizeAttenuation={false}
        transparent
        opacity={0.8}
      />
    </points>
  )
}

// Main App
export default function FinalApp() {
  const [time, setTime] = useState(25 * 60)
  const [totalTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState('focus')
  const [completedSessions, setCompletedSessions] = useState(0)
  
  useEffect(() => {
    let interval = null
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0) {
      // Session complete
      setIsRunning(false)
      setCompletedSessions(prev => prev + 1)
      
      // Play completion sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 523.25 // C5
      gainNode.gain.value = 0.3
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
      
      // Auto-start break
      if (sessionType === 'focus') {
        setTimeout(() => {
          setSessionType('break')
          setTime(5 * 60) // 5 minute break
        }, 1000)
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, time, sessionType])
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const progress = ((totalTime - time) / totalTime) * 100
  
  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleStop = () => {
    setIsRunning(false)
    setTime(sessionType === 'focus' ? 25 * 60 : 5 * 60)
  }
  
  const switchToFocus = () => {
    setSessionType('focus')
    setTime(25 * 60)
    setIsRunning(false)
  }
  
  const switchToBreak = () => {
    setSessionType('break')
    setTime(5 * 60)
    setIsRunning(false)
  }
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4ecdc4" />
        <pointLight position={[0, 0, 0]} intensity={0.3} color="#ffffff" />
        
        <Suspense fallback={null}>
          <ChronoSphere isRunning={isRunning} sessionType={sessionType} />
          <Environment />
        </Suspense>
        
        <CameraControls />
      </Canvas>
      
      {/* Timer Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-panel rounded-2xl p-6 min-w-[380px]">
          <div className="text-center mb-6">
            <div className="text-5xl font-mono font-bold text-white mb-2">
              {formatTime(time)}
            </div>
            <div className="text-sm text-gray-300 mb-3">
              {sessionType === 'focus' ? '🎯 Focus Session' : '☕ Break Time'}
              {isRunning ? ' • Active' : ' • Ready'}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  sessionType === 'focus' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-green-500 to-teal-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Session Counter */}
            <div className="text-xs text-gray-400">
              Sessions completed today: {completedSessions}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Start {sessionType === 'focus' ? 'Focus' : 'Break'}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Pause
                </button>
                <button
                  onClick={handleStop}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Stop
                </button>
              </>
            )}
          </div>
          
          {/* Session Type Switcher */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={switchToFocus}
              disabled={isRunning}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                sessionType === 'focus'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Focus (25min)
            </button>
            <button
              onClick={switchToBreak}
              disabled={isRunning}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                sessionType === 'break'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Break (5min)
            </button>
          </div>
          
          {/* Keyboard Shortcuts */}
          <div className="text-xs text-gray-500 text-center">
            Space: Start/Pause • Esc: Stop • F: Focus • B: Break
          </div>
        </div>
      </div>
      
      {/* Stats Overlay */}
      <div className="fixed top-4 left-4 glass-panel rounded-lg p-3">
        <div className="text-xs text-gray-400">
          <div>🔥 Streak: {completedSessions > 0 ? completedSessions : 0}</div>
          <div>⏱️ Total Focus: {completedSessions * 25}min</div>
        </div>
      </div>
    </div>
  )
}