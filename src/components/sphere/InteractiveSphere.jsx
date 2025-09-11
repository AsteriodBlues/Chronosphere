import { useRef } from 'react'
import Sphere from './Sphere'

export default function InteractiveSphere() {
  const sphereRef = useRef()
  
  return (
    <group>
      {/* Main sphere only - debug version */}
      <Sphere ref={sphereRef} />
    </group>
  )
}