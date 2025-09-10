import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export default function Camera() {
  const controlsRef = useRef()
  const { camera } = useThree()
  
  useFrame((state) => {
    if (!controlsRef.current) return
    
    // Subtle automatic camera movement when not being controlled
    const time = state.clock.elapsedTime
    
    // Check if user is interacting
    const isInteracting = controlsRef.current.object.userData.isInteracting
    
    if (!isInteracting) {
      // Gentle orbital movement
      const radius = 8
      const speed = 0.1
      
      camera.position.x = Math.cos(time * speed) * radius
      camera.position.z = Math.sin(time * speed) * radius
      camera.position.y = Math.sin(time * speed * 0.5) * 2 + 2
      
      camera.lookAt(0, 0, 0)
    }
  })
  
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={20}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      autoRotate={false}
      autoRotateSpeed={0.5}
      dampingFactor={0.05}
      enableDamping={true}
      onStart={() => {
        if (controlsRef.current) {
          controlsRef.current.object.userData.isInteracting = true
        }
      }}
      onEnd={() => {
        if (controlsRef.current) {
          controlsRef.current.object.userData.isInteracting = false
        }
      }}
    />
  )
}