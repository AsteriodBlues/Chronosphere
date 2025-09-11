import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSettings } from '../../hooks'

export default function Sphere() {
  const sphereRef = useRef()
  const { effectiveColors } = useSettings()
  
  // Basic breathing animation
  useFrame((state) => {
    if (sphereRef.current) {
      const time = state.clock.getElapsedTime()
      const breathe = 1 + Math.sin(time * 0.5) * 0.1
      sphereRef.current.scale.setScalar(breathe)
      sphereRef.current.rotation.y = time * 0.1
    }
  })
  
  return (
    <mesh ref={sphereRef} position={[0, 0, 0]} castShadow receiveShadow>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial 
        color={effectiveColors?.primary || "#0080ff"}
        metalness={0.8}
        roughness={0.2}
        emissive={effectiveColors?.accent || "#001122"}
        emissiveIntensity={0.1}
      />
    </mesh>
  )
}