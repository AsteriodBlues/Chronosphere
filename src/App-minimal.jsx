import { Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function AnimatedSphere() {
  const sphereRef = useRef()
  
  useFrame((state) => {
    if (sphereRef.current) {
      const time = state.clock.getElapsedTime()
      // Breathing animation
      const breathe = 1 + Math.sin(time * 0.5) * 0.1
      sphereRef.current.scale.setScalar(breathe)
      // Gentle rotation
      sphereRef.current.rotation.y = time * 0.1
    }
  })
  
  return (
    <mesh ref={sphereRef} position={[0, 0, 0]} castShadow receiveShadow>
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
  )
}

function TimerInterface() {
  const [time, setTime] = useState('25:00')
  const [isRunning, setIsRunning] = useState(false)
  
  const toggleTimer = () => {
    setIsRunning(!isRunning)
    // Simple demo - in real app this would connect to timer store
  }
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black bg-opacity-50 rounded-2xl p-6 backdrop-blur-sm border border-white border-opacity-20 min-w-[320px]">
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-white mb-2">
            {time}
          </div>
          <div className="text-sm text-gray-300 mb-3">
            {isRunning ? 'Focus Session Active' : 'Ready to Focus'}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: isRunning ? '25%' : '0%' }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-xl font-semibold transition-colors ${
              isRunning 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </button>
          
          {isRunning && (
            <button
              onClick={() => setIsRunning(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Stop
            </button>
          )}
        </div>
        
        {/* Quick actions */}
        {!isRunning && (
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
              Quick 15min
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
              Deep 45min
            </button>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 text-center">
            Space: Start/Pause • Esc: Stop • F: Flow Mode
          </div>
        </div>
      </div>
    </div>
  )
}

function MinimalApp() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance' 
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Main sphere */}
        <Suspense fallback={null}>
          <AnimatedSphere />
        </Suspense>
      </Canvas>
      
      {/* Timer Interface */}
      <TimerInterface />
      
      {/* Stats overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-black bg-opacity-50 text-green-400 text-xs font-mono p-2 rounded">
            FPS: 60 | Particles: 0 | Memory: OK
          </div>
        </div>
      )}
    </div>
  )
}

export default MinimalApp