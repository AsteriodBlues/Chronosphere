import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LiquidMetalShader, ShaderStates } from '../../shaders/LiquidMetalShader'
import { useTimerStore } from '../../stores/timerStore'

export default function ShaderController({ children, envMap }) {
  const shaderRef = useRef()
  const meshRef = useRef()
  const { camera } = useThree()
  
  const { 
    timerState, 
    timeRemaining, 
    duration,
    sessionType 
  } = useTimerStore()
  
  useEffect(() => {
    // Initialize shader
    if (!shaderRef.current) {
      shaderRef.current = new LiquidMetalShader({
        envMapIntensity: 1.0
      })
    }
    
    // Set environment map if provided
    if (envMap && shaderRef.current) {
      shaderRef.current.setEnvironmentMap(envMap)
    }
    
    return () => {
      if (shaderRef.current) {
        shaderRef.current.dispose()
      }
    }
  }, [envMap])
  
  // Update shader state based on timer state
  useEffect(() => {
    if (!shaderRef.current) return
    
    let targetState = ShaderStates.LIQUID
    
    if (timerState === 'focus' || timerState === 'flow') {
      targetState = ShaderStates.CRYSTAL
    } else if (timerState === 'break' || timerState === 'completed') {
      targetState = ShaderStates.PLASMA
    } else {
      targetState = ShaderStates.LIQUID
    }
    
    shaderRef.current.setState(targetState, 2.0)
  }, [timerState])
  
  // Animate breathing based on timer progress
  useEffect(() => {
    if (!shaderRef.current) return
    
    const progress = duration > 0 ? (duration - timeRemaining) / duration : 0
    const breathingIntensity = timerState === 'idle' ? 0.08 : 0.12
    const breathingSpeed = timerState === 'focus' ? 0.8 : 0.5
    
    shaderRef.current.setBreathing(breathingIntensity, breathingSpeed)
    
    // Modulate displacement based on progress
    const displacementScale = 0.8 + progress * 0.4
    shaderRef.current.animateUniform('uDisplacementScale', displacementScale, 1.0)
  }, [timerState, timeRemaining, duration])
  
  // Animate rim lighting based on session type
  useEffect(() => {
    if (!shaderRef.current) return
    
    let rimColor, rimPower, rimIntensity
    
    switch (sessionType) {
      case 'focus':
        rimColor = 0x4080ff // Blue
        rimPower = 3.0
        rimIntensity = 0.8
        break
      case 'break':
        rimColor = 0x00ff80 // Green
        rimPower = 2.5
        rimIntensity = 0.6
        break
      case 'longBreak':
        rimColor = 0xff8040 // Orange
        rimPower = 2.0
        rimIntensity = 0.7
        break
      default:
        rimColor = 0xffffff // White
        rimPower = 3.0
        rimIntensity = 0.5
    }
    
    shaderRef.current.setRimLighting(rimPower, rimIntensity, rimColor)
  }, [sessionType])
  
  // Animation loop
  useFrame((state, delta) => {
    if (!shaderRef.current) return
    
    // Update shader time and camera
    shaderRef.current.update(delta, camera)
    
    // Apply material to mesh if available
    if (meshRef.current && !meshRef.current.material) {
      meshRef.current.material = shaderRef.current.material
    }
    
    // Dynamic effects based on timer state
    if (timerState === 'focus' || timerState === 'flow') {
      // Increase chromatic aberration during intense focus
      const aberration = 0.01 + Math.sin(state.clock.elapsedTime * 2) * 0.005
      shaderRef.current.setChromaticAberration(aberration)
    }
    
    // Pulse effect when timer is about to end
    if (timeRemaining < 60 && timeRemaining > 0) {
      const pulseIntensity = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5
      shaderRef.current.animateUniform('uRimIntensity', 0.5 + pulseIntensity * 0.5, 0.1)
    }
  })
  
  return (
    <mesh ref={meshRef}>
      {children}
    </mesh>
  )
}