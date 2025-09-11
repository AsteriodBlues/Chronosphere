import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function TestSphere() {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial 
        color="#0080ff" 
        metalness={0.7}
        roughness={0.2}
        emissive="#001122"
      />
    </mesh>
  )
}