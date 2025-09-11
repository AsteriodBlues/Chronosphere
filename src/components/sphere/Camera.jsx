import { useRef, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Extend to make OrbitControls available as a JSX element
extend({ OrbitControls: ThreeOrbitControls })

export default function Camera() {
  const controlsRef = useRef()
  const { camera, gl } = useThree()
  
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = 3
      controlsRef.current.maxDistance = 20
      controlsRef.current.enableDamping = true
      controlsRef.current.dampingFactor = 0.05
    }
  }, [])
  
  useFrame((state) => {
    if (!controlsRef.current) return
    
    controlsRef.current.update()
    
    // Subtle automatic camera movement when not being controlled
    const time = state.clock.elapsedTime
    
    // Check if user is interacting
    const isInteracting = controlsRef.current.userData?.isInteracting
    
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
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
    />
  )
}