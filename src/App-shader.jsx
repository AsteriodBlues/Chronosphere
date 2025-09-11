import { Suspense, useRef } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import LiquidMetalSphere from './components/sphere/LiquidMetalSphere'
import { useTimerStore } from './stores/timerStore'
import './index.css'

// Extend OrbitControls
extend({ OrbitControls: ThreeOrbitControls })

// Enhanced Environment with starfield
function EnhancedEnvironment() {
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const starCount = 2000
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
    <>
      <points geometry={starsGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={2}
          sizeAttenuation={false}
          transparent
          opacity={0.8}
        />
      </points>
      
      {/* Nebula clouds */}
      <mesh position={[20, 10, -30]} scale={[30, 20, 20]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#4a0080"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      <mesh position={[-30, -10, -40]} scale={[25, 25, 25]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#004080"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}

// Timer Controls UI
function TimerControlsUI() {
  const {
    timerState,
    timeRemaining,
    duration,
    sessionType,
    startTimer,
    pauseTimer,
    stopTimer,
    setSessionType,
    completedSessions
  } = useTimerStore()
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0
  
  const isRunning = timerState === 'focus' || timerState === 'break' || timerState === 'flow'
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-panel rounded-2xl p-6 min-w-[400px]">
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-white mb-2">
            {formatTime(timeRemaining)}
          </div>
          
          <div className="text-sm text-gray-300 mb-3">
            {timerState === 'idle' && 'Ready to Focus'}
            {timerState === 'focus' && '🎯 Focus Session'}
            {timerState === 'break' && '☕ Break Time'}
            {timerState === 'flow' && '🌊 Flow State'}
            {timerState === 'quantum' && '⚡ Quantum Mode'}
            {timerState === 'completed' && '✅ Session Complete'}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                sessionType === 'focus' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : sessionType === 'break'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500'
                  : 'bg-gradient-to-r from-orange-500 to-red-500'
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
              onClick={startTimer}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              Start {sessionType === 'focus' ? 'Focus' : 'Break'}
            </button>
          ) : (
            <>
              <button
                onClick={pauseTimer}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Pause
              </button>
              <button
                onClick={stopTimer}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Stop
              </button>
            </>
          )}
        </div>
        
        {/* Session Type Switcher */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSessionType('focus')}
            disabled={isRunning}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              sessionType === 'focus'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => setSessionType('break')}
            disabled={isRunning}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              sessionType === 'break'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Break (5m)
          </button>
          <button
            onClick={() => setSessionType('longBreak')}
            disabled={isRunning}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              sessionType === 'longBreak'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Long (15m)
          </button>
        </div>
      </div>
    </div>
  )
}

// Stats Overlay
function StatsOverlay() {
  const { completedSessions, totalFocusTime, currentStreak } = useTimerStore()
  
  return (
    <div className="fixed top-4 left-4 glass-panel rounded-lg p-3">
      <div className="text-xs text-gray-400 space-y-1">
        <div>🔥 Streak: {currentStreak}</div>
        <div>⏱️ Total Focus: {Math.floor(totalFocusTime / 60)}min</div>
        <div>✅ Sessions: {completedSessions}</div>
      </div>
    </div>
  )
}

// Main App with Liquid Metal Shader
export default function AppWithShader() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* 3D Scene */}
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputEncoding: THREE.sRGBEncoding,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4ecdc4" />
        <pointLight position={[0, 0, 0]} intensity={0.3} color="#ffffff" />
        <spotLight
          position={[0, 10, 0]}
          angle={Math.PI / 6}
          penumbra={0.5}
          intensity={0.5}
          color="#ffd93d"
          castShadow
        />
        
        <Suspense fallback={null}>
          {/* Liquid Metal Sphere with advanced shaders */}
          <LiquidMetalSphere />
          
          {/* Environment */}
          <EnhancedEnvironment />
        </Suspense>
      </Canvas>
      
      {/* Timer Controls */}
      <TimerControlsUI />
      
      {/* Stats Overlay */}
      <StatsOverlay />
      
      {/* Shader Info (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 glass-panel rounded-lg p-3">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="font-bold text-white">Liquid Metal Shader</div>
            <div>✨ PBR Metallic Lighting</div>
            <div>🌊 Perlin Noise Displacement</div>
            <div>🎨 Chromatic Aberration</div>
            <div>💎 Fresnel Rim Effects</div>
            <div>🌈 Iridescent Surface</div>
            <div>⚡ 3 Shader States</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add missing import
import { useMemo } from 'react'