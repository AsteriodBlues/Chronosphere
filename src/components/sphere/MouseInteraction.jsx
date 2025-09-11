import { useRef, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function MouseInteraction({ sphereRef, onMouseUpdate, onClick }) {
  const { viewport, camera, raycaster, pointer } = useThree()
  const [isHovering, setIsHovering] = useState(false)
  const [clickPosition, setClickPosition] = useState(null)
  const mouseWorldPosition = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3())
  const momentum = useRef(new THREE.Vector3())
  
  // Mouse tracking
  useFrame(() => {
    if (!sphereRef.current) return
    
    // Update raycaster with current mouse position
    raycaster.setFromCamera(pointer, camera)
    
    // Check intersection with sphere
    const intersects = raycaster.intersectObject(sphereRef.current)
    
    if (intersects.length > 0) {
      const intersection = intersects[0]
      
      // Update mouse world position
      targetPosition.current.copy(intersection.point)
      
      // Smooth interpolation for natural feel
      mouseWorldPosition.current.lerp(targetPosition.current, 0.1)
      
      if (!isHovering) {
        setIsHovering(true)
      }
      
      // Notify parent of mouse position update
      if (onMouseUpdate) {
        onMouseUpdate({
          worldPosition: mouseWorldPosition.current.clone(),
          localPosition: sphereRef.current.worldToLocal(mouseWorldPosition.current.clone()),
          intersectionPoint: intersection.point,
          normal: intersection.face.normal,
          isHovering: true,
          uv: intersection.uv
        })
      }
    } else {
      if (isHovering) {
        setIsHovering(false)
        
        if (onMouseUpdate) {
          onMouseUpdate({
            worldPosition: null,
            localPosition: null,
            intersectionPoint: null,
            normal: null,
            isHovering: false,
            uv: null
          })
        }
      }
    }
  })
  
  const handlePointerDown = useCallback((event) => {
    if (!sphereRef.current) return
    
    const intersection = raycaster.intersectObject(sphereRef.current)[0]
    if (intersection) {
      setClickPosition(intersection.point.clone())
      
      // Add momentum to sphere rotation
      const force = new THREE.Vector3()
        .subVectors(intersection.point, sphereRef.current.position)
        .normalize()
        .multiplyScalar(0.02)
      
      momentum.current.add(force)
    }
  }, [])
  
  const handlePointerUp = useCallback(() => {
    setClickPosition(null)
  }, [])
  
  // Apply momentum physics
  useFrame(() => {
    if (!sphereRef.current || !momentum.current) return
    
    // Apply momentum to sphere rotation
    sphereRef.current.rotation.x += momentum.current.y * 0.5
    sphereRef.current.rotation.y += momentum.current.x * 0.5
    sphereRef.current.rotation.z += momentum.current.z * 0.5
    
    // Damping
    momentum.current.multiplyScalar(0.95)
  })
  
  return (
    <mesh
      ref={sphereRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
      visible={false} // Invisible interaction layer
    >
      <sphereGeometry args={[2.1, 64, 64]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}