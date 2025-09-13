import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useSettings } from '../../hooks'
import { performanceMonitor } from '../../utils/performance'
import LoadingFallback from './LoadingFallback'
import Lights from './Lights'
import InteractiveSphere from './InteractiveSphere'
import Camera from './Camera'
import Environment from './Environment'

export default function Scene() {
  const { performance, visual } = useSettings()

  const canvasProps = {
    gl: {
      antialias: performance.fpsTarget > 30,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    },
    camera: {
      position: [0, 0, 15],
      fov: 45,
      near: 0.1,
      far: 1000
    },
    onCreated: ({ gl, scene, camera }) => {
      // Setup performance monitoring
      performanceMonitor.startTiming('scene-setup')
      
      // Configure renderer
      gl.setClearColor('#000000', 0)
      gl.shadowMap.enabled = visual.shadows
      gl.shadowMap.type = gl.PCFSoftShadowMap
      gl.outputEncoding = gl.sRGBEncoding
      gl.toneMapping = gl.ACESFilmicToneMapping
      gl.toneMappingExposure = 1.2
      
      // Setup scene
      scene.fog = null // We'll handle this manually for better control
      
      performanceMonitor.endTiming('scene-setup')
    }
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas {...canvasProps}>
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting setup */}
          <Lights />
          
          {/* Environment */}
          <Environment />
          
          {/* Camera controls */}
          <Camera />
          
          {/* Interactive sphere with all effects */}
          <InteractiveSphere />
          
          {/* Performance stats overlay */}
          {process.env.NODE_ENV === 'development' && (
            <mesh position={[5, 4, 0]}>
              <planeGeometry args={[2, 1]} />
              <meshBasicMaterial color="#000" opacity={0.5} transparent />
            </mesh>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}