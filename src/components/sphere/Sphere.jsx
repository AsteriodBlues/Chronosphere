import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTimerStore } from '../../stores/timerStore'
import { useSettings } from '../../hooks'
import * as THREE from 'three'
import SphereGeometry from './SphereGeometry'
import AdvancedSphereMaterial from './AdvancedSphereMaterial'
import InternalGalaxy from './InternalGalaxy'
import BreathingController from './BreathingController'
import TranslucentSections from './TranslucentSections'
import EnvironmentReflections from './EnvironmentReflections'

export default function Sphere() {
  const sphereRef = useRef()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, z: 0 })
  const [breathingData, setBreathingData] = useState(null)
  const { sphere, timer } = useTimerStore()
  const { visual, getEffectiveColors } = useSettings()
  
  const colors = getEffectiveColors()
  
  // Create highly subdivided sphere geometry for smooth deformation
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(
      2, // radius
      128, // width segments (high for smooth deformation)
      64   // height segments
    )
  }, [])
  
  const handleBreathingUpdate = (data) => {
    setBreathingData(data)
  }
  
  return (
    <EnvironmentReflections>
      {(envMap) => (
        <group>
          {/* Main sphere with advanced materials */}
          <mesh 
            ref={sphereRef}
            geometry={geometry}
            castShadow={visual.shadows}
            receiveShadow={visual.shadows}
          >
            <AdvancedSphereMaterial 
              mousePosition={mousePosition}
            />
          </mesh>
          
          {/* Breathing animation controller */}
          <BreathingController 
            sphereRef={sphereRef}
            onBreathingUpdate={handleBreathingUpdate}
          />
          
          {/* Translucent sections revealing interior */}
          <TranslucentSections />
          
          {/* Internal galaxy particle system */}
          <InternalGalaxy 
            particleCount={sphere.particleCount}
            visible={!sphere.exploding}
            breathingData={breathingData}
          />
        </group>
      )}
    </EnvironmentReflections>
  )
}