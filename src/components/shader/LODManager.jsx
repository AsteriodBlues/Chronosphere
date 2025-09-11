import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { lodConfigurations, performanceProfiles } from '../../utils/shaderPresets'

export default function LODManager({ children, profile = 'high', onLODChange }) {
  const { camera, gl } = useThree()
  const [currentLOD, setCurrentLOD] = useState('LOD0')
  const [averageFPS, setAverageFPS] = useState(60)
  
  const fpsHistoryRef = useRef([])
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const lodTimeoutRef = useRef(null)
  
  const config = performanceProfiles[profile] || performanceProfiles.high
  
  // Calculate FPS
  useFrame(() => {
    frameCountRef.current++
    const now = performance.now()
    const delta = now - lastTimeRef.current
    
    // Calculate FPS every 60 frames
    if (frameCountRef.current >= 60) {
      const fps = (frameCountRef.current / delta) * 1000
      fpsHistoryRef.current.push(fps)
      
      // Keep only last 10 samples
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift()
      }
      
      // Calculate average FPS
      const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
      setAverageFPS(avgFPS)
      
      frameCountRef.current = 0
      lastTimeRef.current = now
      
      // Adjust LOD based on performance
      if (config.dynamicLOD) {
        adjustLOD(avgFPS)
      }
    }
  })
  
  const adjustLOD = (fps) => {
    // Clear existing timeout
    if (lodTimeoutRef.current) {
      clearTimeout(lodTimeoutRef.current)
    }
    
    // Delay LOD changes to avoid rapid switching
    lodTimeoutRef.current = setTimeout(() => {
      let newLOD = currentLOD
      
      if (fps < config.minFPS) {
        // Performance is too low, decrease quality
        if (currentLOD === 'LOD0') newLOD = 'LOD1'
        else if (currentLOD === 'LOD1') newLOD = 'LOD2'
        else if (currentLOD === 'LOD2') newLOD = 'LOD3'
      } else if (fps > config.targetFPS + 10) {
        // Performance is good, increase quality
        if (currentLOD === 'LOD3') newLOD = 'LOD2'
        else if (currentLOD === 'LOD2') newLOD = 'LOD1'
        else if (currentLOD === 'LOD1') newLOD = 'LOD0'
      }
      
      if (newLOD !== currentLOD) {
        setCurrentLOD(newLOD)
        if (onLODChange) {
          onLODChange(newLOD, lodConfigurations[newLOD])
        }
      }
    }, 2000) // Wait 2 seconds before changing LOD
  }
  
  // Set initial LOD
  useEffect(() => {
    const initialLOD = config.defaultLOD
    setCurrentLOD(initialLOD)
    if (onLODChange) {
      onLODChange(initialLOD, lodConfigurations[initialLOD])
    }
  }, [profile])
  
  // Distance-based LOD
  useEffect(() => {
    if (!camera) return
    
    const checkDistance = () => {
      const distance = camera.position.length()
      let distanceLOD = 'LOD0'
      
      if (distance > 20) distanceLOD = 'LOD3'
      else if (distance > 15) distanceLOD = 'LOD2'
      else if (distance > 10) distanceLOD = 'LOD1'
      
      // Combine distance and performance LOD
      const lodLevels = ['LOD0', 'LOD1', 'LOD2', 'LOD3']
      const performanceIndex = lodLevels.indexOf(currentLOD)
      const distanceIndex = lodLevels.indexOf(distanceLOD)
      const finalIndex = Math.max(performanceIndex, distanceIndex)
      const finalLOD = lodLevels[finalIndex]
      
      if (finalLOD !== currentLOD) {
        setCurrentLOD(finalLOD)
        if (onLODChange) {
          onLODChange(finalLOD, lodConfigurations[finalLOD])
        }
      }
    }
    
    const interval = setInterval(checkDistance, 1000)
    return () => clearInterval(interval)
  }, [camera, currentLOD])
  
  return (
    <>
      {children}
      {/* Performance HUD (optional) */}
      {process.env.NODE_ENV === 'development' && (
        <group>
          <Html position={[0, 3, 0]}>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '5px',
              borderRadius: '3px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              FPS: {Math.round(averageFPS)} | LOD: {currentLOD}
            </div>
          </Html>
        </group>
      )}
    </>
  )
}

// HTML component for debug display
function Html({ children, position }) {
  return <div>{children}</div>
}