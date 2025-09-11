import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

function SimpleSphere() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#0080ff" />
    </mesh>
  )
}

function SimpleApp() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} />
        <SimpleSphere />
      </Canvas>
      
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black bg-opacity-50 rounded-2xl p-6 backdrop-blur-sm border border-white border-opacity-20">
          <div className="text-center mb-4">
            <div className="text-4xl font-mono font-bold text-white mb-2">
              25:00
            </div>
            <div className="text-sm text-gray-300">
              Ready to Focus
            </div>
          </div>
          
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors w-full">
            Start Focus Session
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleApp