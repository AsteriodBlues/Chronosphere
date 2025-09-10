import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SpherePhysics({ 
  sphereRef, 
  mouseData, 
  onRotationUpdate,
  momentumDecay = 0.98,
  clickForce = 0.02
}) {
  const momentum = useRef(new THREE.Vector3(0, 0, 0))
  const angularVelocity = useRef(new THREE.Vector3(0, 0, 0))
  const lastMousePosition = useRef(new THREE.Vector3())
  const isDragging = useRef(false)
  
  useFrame((state, delta) => {
    if (!sphereRef.current) return
    
    // Mouse drag rotation
    if (mouseData && mouseData.isHovering) {
      const currentMousePos = mouseData.worldPosition
      
      if (isDragging.current && lastMousePosition.current) {
        // Calculate mouse movement
        const mouseDelta = new THREE.Vector3()
          .subVectors(currentMousePos, lastMousePosition.current)
        
        // Convert mouse movement to rotation
        const rotationSensitivity = 2.0
        angularVelocity.current.x += mouseDelta.y * rotationSensitivity * delta
        angularVelocity.current.y += mouseDelta.x * rotationSensitivity * delta
      }
      
      lastMousePosition.current.copy(currentMousePos)
    }
    
    // Apply angular velocity to sphere rotation
    sphereRef.current.rotation.x += angularVelocity.current.x * delta
    sphereRef.current.rotation.y += angularVelocity.current.y * delta
    sphereRef.current.rotation.z += angularVelocity.current.z * delta
    
    // Apply momentum decay
    angularVelocity.current.multiplyScalar(momentumDecay)
    momentum.current.multiplyScalar(momentumDecay)
    
    // Automatic slow rotation when no interaction
    if (!mouseData || !mouseData.isHovering) {
      const autoRotationSpeed = 0.1
      sphereRef.current.rotation.y += autoRotationSpeed * delta
    }
    
    // Mouse influence on sphere shape (for shader)
    if (mouseData && mouseData.isHovering) {
      const influence = Math.max(0, 1 - mouseData.worldPosition.length() / 5)
      // This would be passed to the shader for deformation
    }
    
    // Notify parent of rotation changes
    if (onRotationUpdate) {
      onRotationUpdate({
        rotation: sphereRef.current.rotation.clone(),
        angularVelocity: angularVelocity.current.clone(),
        momentum: momentum.current.clone()
      })
    }
  })
  
  const handlePointerDown = (event) => {
    isDragging.current = true
    event.stopPropagation()
  }
  
  const handlePointerUp = (event) => {
    isDragging.current = false
    
    // Add click impulse
    if (mouseData && mouseData.worldPosition) {
      const impulse = mouseData.worldPosition.clone()
        .normalize()
        .multiplyScalar(clickForce)
      
      momentum.current.add(impulse)
    }
  }
  
  const handlePointerMove = (event) => {
    // Mouse movement handling is done in useFrame
  }
  
  return (
    <mesh
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      visible={false} // Invisible physics interaction layer
    >
      <sphereGeometry args={[2.2, 32, 32]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}