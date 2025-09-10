import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSettings } from '../../hooks'

export default function Lights() {
  const { visual } = useSettings()
  const mainLightRef = useRef()
  const fillLightRef = useRef()
  const rimLightRef = useRef()
  
  useFrame((state) => {
    if (mainLightRef.current) {
      // Subtle light movement for dynamic shadows
      mainLightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2
      mainLightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.3) * 3
    }
    
    if (rimLightRef.current) {
      // Rim light orbits slowly for dramatic effect
      const time = state.clock.elapsedTime * 0.2
      rimLightRef.current.position.x = Math.cos(time) * 8
      rimLightRef.current.position.z = Math.sin(time) * 8
    }
  })

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight 
        intensity={0.1} 
        color="#1a1a2e" 
      />
      
      {/* Main directional light */}
      <directionalLight
        ref={mainLightRef}
        position={[5, 5, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow={visual.shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light for softer shadows */}
      <directionalLight
        ref={fillLightRef}
        position={[-3, 2, -2]}
        intensity={0.4}
        color="#4ecdc4"
      />
      
      {/* Rim light for dramatic silhouette */}
      <directionalLight
        ref={rimLightRef}
        position={[8, 0, -8]}
        intensity={0.8}
        color="#ff6b35"
      />
      
      {/* Point lights for particle interaction */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.3}
        color="#ffffff"
        distance={10}
        decay={2}
      />
      
      {/* Hemisphere light for realistic sky lighting */}
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#1a1a2e"
        intensity={0.2}
      />
      
      {/* Spot lights for focused dramatic lighting */}
      <spotLight
        position={[0, 10, 0]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.5}
        color="#ffd93d"
        castShadow={visual.shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Additional accent lights */}
      <pointLight
        position={[-5, -5, 5]}
        intensity={0.3}
        color="#7b2cbf"
        distance={15}
      />
      
      <pointLight
        position={[5, -5, -5]}
        intensity={0.3}
        color="#00d084"
        distance={15}
      />
    </>
  )
}