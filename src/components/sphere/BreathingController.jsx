import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTimerStore } from '../../stores/timerStore'

export default function BreathingController({ sphereRef, onBreathingUpdate }) {
  const { sphere, timer } = useTimerStore()
  const breathingState = useRef({
    phase: 0,
    intensity: 1,
    targetIntensity: 1,
    lastBreathTime: 0
  })
  
  const calculateBreathingPattern = useCallback((status) => {
    switch (status) {
      case 'idle':
        return { rate: 4000, intensity: 0.05, pattern: 'sine' }
      case 'focus':
        return { rate: 3000, intensity: 0.03, pattern: 'focused' }
      case 'break':
        return { rate: 5000, intensity: 0.08, pattern: 'relaxed' }
      case 'flow':
        return { rate: 2500, intensity: 0.02, pattern: 'flow' }
      case 'pause':
        return { rate: 6000, intensity: 0.07, pattern: 'pause' }
      default:
        return { rate: 4000, intensity: 0.05, pattern: 'sine' }
    }
  }, [])
  
  useFrame((state) => {
    if (!sphereRef.current || sphere.exploding) return
    
    const time = state.clock.elapsedTime * 1000
    const breathingConfig = calculateBreathingPattern(timer.status)
    
    // Update breathing phase
    breathingState.current.phase = (time / breathingConfig.rate) * Math.PI * 2
    
    // Smooth intensity changes
    breathingState.current.targetIntensity = breathingConfig.intensity
    breathingState.current.intensity += (
      breathingState.current.targetIntensity - breathingState.current.intensity
    ) * 0.02
    
    let scale = 1
    let rotation = { x: 0, y: 0, z: 0 }
    
    // Apply breathing pattern
    switch (breathingConfig.pattern) {
      case 'sine':
        scale = 1 + Math.sin(breathingState.current.phase) * breathingState.current.intensity
        break
        
      case 'focused':
        // Sharp inhale, slow exhale for focus
        const focusedPhase = breathingState.current.phase % (Math.PI * 2)
        if (focusedPhase < Math.PI * 0.3) {
          scale = 1 + (focusedPhase / (Math.PI * 0.3)) * breathingState.current.intensity
        } else {
          const exhalePhase = (focusedPhase - Math.PI * 0.3) / (Math.PI * 1.7)
          scale = 1 + (1 - exhalePhase) * breathingState.current.intensity
        }
        break
        
      case 'relaxed':
        // Slow, deep breathing for breaks
        scale = 1 + (Math.sin(breathingState.current.phase) * 0.5 + 0.5) * breathingState.current.intensity
        rotation.y = Math.sin(breathingState.current.phase * 0.5) * 0.01
        break
        
      case 'flow':
        // Steady, minimal breathing for flow state
        scale = 1 + Math.sin(breathingState.current.phase) * breathingState.current.intensity * 0.5
        rotation.z = Math.sin(breathingState.current.phase * 0.3) * 0.005
        break
        
      case 'pause':
        // Irregular breathing pattern
        const pausePhase = breathingState.current.phase % (Math.PI * 2)
        scale = 1 + Math.sin(pausePhase) * breathingState.current.intensity
        if (Math.random() < 0.1) {
          scale += Math.random() * 0.01 - 0.005
        }
        break
    }
    
    // Apply transformations
    sphereRef.current.scale.setScalar(scale)
    sphereRef.current.rotation.x += rotation.x
    sphereRef.current.rotation.y += rotation.y
    sphereRef.current.rotation.z += rotation.z
    
    // Pulsing effect during focus
    if (sphere.pulsing && timer.status === 'focus') {
      const pulseIntensity = 0.02
      const pulseSpeed = 2
      const pulse = Math.sin(time * 0.001 * pulseSpeed * Math.PI * 2) * pulseIntensity
      sphereRef.current.scale.setScalar(scale + pulse)
    }
    
    // Notify parent component of breathing updates
    if (onBreathingUpdate) {
      onBreathingUpdate({
        phase: breathingState.current.phase,
        intensity: breathingState.current.intensity,
        scale,
        pattern: breathingConfig.pattern
      })
    }
    
    // Trigger breath events
    const breathCycleTime = breathingConfig.rate
    if (time - breathingState.current.lastBreathTime > breathCycleTime) {
      breathingState.current.lastBreathTime = time
      
      // Could trigger breath sound here
      if (timer.status === 'focus' && Math.random() < 0.3) {
        // Occasional deeper breath during focus
        breathingState.current.intensity *= 1.5
        setTimeout(() => {
          breathingState.current.intensity /= 1.5
        }, 1000)
      }
    }
  })
  
  return null // This is a controller component, no visual output
}