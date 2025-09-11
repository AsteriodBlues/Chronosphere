import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTimerStore } from '../../stores/timerStore'
import * as THREE from 'three'

/**
 * HeartbeatController - Creates realistic heartbeat pulsing effects
 * Synchronizes sphere pulsing with timer states and focus intensity
 */
export default function HeartbeatController({ sphereRef }) {
  const { timer, sphere } = useTimerStore()
  const heartbeatRef = useRef({
    baseScale: 1.0,
    pulseIntensity: 0.05,
    currentBeat: 0,
    beatPattern: 'normal', // 'normal' | 'focus' | 'flow' | 'stressed'
    lastBeatTime: 0,
    beatInterval: 1000, // milliseconds between beats
    isBeating: false
  })

  // Heartbeat patterns for different states
  const HEARTBEAT_PATTERNS = {
    idle: {
      bpm: 60,           // 60 beats per minute
      intensity: 0.02,   // Very subtle
      rhythm: [1.0, 0.3], // Systole/Diastole pattern
      duration: [200, 300] // Beat duration in ms
    },
    focus: {
      bpm: 75,           // Slightly elevated during focus
      intensity: 0.04,   // More noticeable
      rhythm: [1.0, 0.4],
      duration: [180, 280]
    },
    break: {
      bpm: 65,           // Relaxed during break
      intensity: 0.03,   // Gentle
      rhythm: [1.0, 0.3],
      duration: [220, 320]
    },
    flow: {
      bpm: 85,           // Elevated in flow state
      intensity: 0.06,   // Strong pulsing
      rhythm: [1.0, 0.5],
      duration: [160, 240]
    },
    quantum: {
      bpm: 90,           // High energy quantum mode
      intensity: 0.08,   // Very strong
      rhythm: [1.0, 0.6, 0.3], // Triple beat pattern
      duration: [150, 200, 100]
    },
    pause: {
      bpm: 55,           // Slower when paused
      intensity: 0.015,  // Very subtle
      rhythm: [1.0, 0.2],
      duration: [250, 400]
    }
  }

  // Update heartbeat pattern based on timer state
  useEffect(() => {
    const pattern = HEARTBEAT_PATTERNS[timer.status] || HEARTBEAT_PATTERNS.idle
    heartbeatRef.current.beatInterval = 60000 / pattern.bpm // Convert BPM to milliseconds
    heartbeatRef.current.pulseIntensity = pattern.intensity
    heartbeatRef.current.currentPattern = pattern
  }, [timer.status])

  // Heartbeat animation loop
  useFrame((state) => {
    if (!sphereRef.current || !sphere.pulsing) return

    const time = state.clock.getElapsedTime() * 1000 // Convert to milliseconds
    const heartbeat = heartbeatRef.current
    const pattern = heartbeat.currentPattern

    if (!pattern) return

    // Check if it's time for next beat
    if (time - heartbeat.lastBeatTime >= heartbeat.beatInterval) {
      heartbeat.lastBeatTime = time
      heartbeat.currentBeat = 0
      heartbeat.isBeating = true
    }

    if (heartbeat.isBeating) {
      const beatTime = time - heartbeat.lastBeatTime
      let scale = heartbeat.baseScale
      let beatIndex = 0
      let cumulativeDuration = 0

      // Find which part of the rhythm we're in
      for (let i = 0; i < pattern.rhythm.length; i++) {
        cumulativeDuration += pattern.duration[i]
        if (beatTime <= cumulativeDuration) {
          beatIndex = i
          break
        }
      }

      // Calculate beat phase within current rhythm segment
      const segmentStart = cumulativeDuration - pattern.duration[beatIndex]
      const segmentProgress = (beatTime - segmentStart) / pattern.duration[beatIndex]

      if (segmentProgress <= 1.0) {
        // Apply heartbeat curve for this segment
        const beatStrength = pattern.rhythm[beatIndex]
        const beatCurve = Math.sin(segmentProgress * Math.PI) * beatStrength
        const pulseScale = heartbeat.pulseIntensity * beatCurve

        scale = heartbeat.baseScale + pulseScale

        // Add some variation based on timer progress for focus sessions
        if (timer.status === 'focus' && timer.progress) {
          const focusIntensity = 0.5 + (timer.progress * 0.5) // Increase intensity as session progresses
          scale += pulseScale * focusIntensity * 0.3
        }

        // Apply breathing synchronization
        const breathingPhase = (time / sphere.breathingRate) * Math.PI * 2
        const breathingScale = Math.sin(breathingPhase) * 0.02
        scale += breathingScale

      } else if (beatTime > cumulativeDuration) {
        // Beat sequence complete
        heartbeat.isBeating = false
        scale = heartbeat.baseScale
      }

      // Apply scale to sphere
      sphereRef.current.scale.setScalar(scale)

      // Add subtle color pulsing for quantum mode
      if (timer.status === 'quantum' && sphereRef.current.material) {
        const pulseColor = Math.sin(beatTime * 0.01) * 0.3 + 0.7
        sphereRef.current.material.emissiveIntensity = sphere.glowIntensity * pulseColor
      }

      // Particle synchronization for flow state
      if (timer.status === 'flow') {
        const particleIntensity = 1.0 + (beatCurve * 0.5)
        // This would affect particle system if we have a ref to it
        // particleSystemRef.current?.setIntensity(particleIntensity)
      }
    }
  })

  // Advanced heartbeat effects based on session context
  useEffect(() => {
    if (!timer.isActive) return

    const updateHeartbeatContext = () => {
      const heartbeat = heartbeatRef.current
      
      // Adapt to remaining time (stress response)
      if (timer.timeRemaining < 300 && timer.status === 'focus') { // Last 5 minutes
        const stressLevel = (300 - timer.timeRemaining) / 300
        heartbeat.pulseIntensity = HEARTBEAT_PATTERNS.focus.intensity * (1 + stressLevel * 0.5)
        heartbeat.beatInterval = Math.max(
          60000 / (HEARTBEAT_PATTERNS.focus.bpm + stressLevel * 20),
          400 // Don't go faster than 150 BPM
        )
      }
      
      // Flow state adaptation
      if (timer.status === 'flow' && timer.progress > 0.3) {
        const flowLevel = (timer.progress - 0.3) / 0.7
        heartbeat.pulseIntensity = HEARTBEAT_PATTERNS.flow.intensity * (1 + flowLevel * 0.3)
      }
      
      // Break relaxation
      if (timer.status === 'break' && timer.progress > 0.5) {
        const relaxationLevel = (timer.progress - 0.5) / 0.5
        heartbeat.beatInterval = 60000 / Math.max(
          HEARTBEAT_PATTERNS.break.bpm - relaxationLevel * 10,
          45 // Don't go slower than 45 BPM
        )
      }
    }

    const interval = setInterval(updateHeartbeatContext, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [timer.isActive, timer.status, timer.timeRemaining, timer.progress])

  // Handle special heartbeat events
  useEffect(() => {
    const handleSessionComplete = () => {
      if (!sphereRef.current) return
      
      // Victory heartbeat sequence
      const victoryBeats = [
        { scale: 1.15, duration: 200 },
        { scale: 0.95, duration: 100 },
        { scale: 1.10, duration: 150 },
        { scale: 0.98, duration: 100 },
        { scale: 1.05, duration: 200 },
        { scale: 1.00, duration: 300 }
      ]
      
      let beatIndex = 0
      const playVictoryBeat = () => {
        if (beatIndex >= victoryBeats.length) return
        
        const beat = victoryBeats[beatIndex]
        sphereRef.current.scale.setScalar(beat.scale)
        
        setTimeout(() => {
          beatIndex++
          playVictoryBeat()
        }, beat.duration)
      }
      
      playVictoryBeat()
    }

    // Listen for session completion
    if (timer.timeRemaining === 0 && timer.isActive) {
      handleSessionComplete()
    }
  }, [timer.timeRemaining, timer.isActive])

  // Stress detection and adaptation
  const detectStressPattern = (clickFrequency, pauseCount) => {
    const heartbeat = heartbeatRef.current
    
    if (clickFrequency > 10 || pauseCount > 3) { // High interaction = potential stress
      heartbeat.beatInterval = Math.max(heartbeat.beatInterval * 0.9, 500) // Increase BPM
      heartbeat.pulseIntensity = Math.min(heartbeat.pulseIntensity * 1.2, 0.1) // Stronger pulse
    }
  }

  // Wellness integration
  const adaptToWellnessData = (hrv, stressLevel) => {
    const heartbeat = heartbeatRef.current
    const pattern = heartbeat.currentPattern
    
    if (hrv && pattern) {
      // Adapt rhythm to match user's actual heart rate variability
      heartbeat.beatInterval = 60000 / Math.max(pattern.bpm * (1 + stressLevel * 0.2), 40)
      heartbeat.pulseIntensity = pattern.intensity * (1 + stressLevel * 0.3)
    }
  }

  return null // This component only controls animations, renders nothing
}

// Utility functions for external integration
export const getHeartbeatMetrics = (sphereRef) => {
  if (!sphereRef.current) return null
  
  const scale = sphereRef.current.scale.x
  const isBeating = scale !== 1.0
  
  return {
    currentScale: scale,
    isBeating,
    intensity: Math.abs(scale - 1.0),
    timestamp: Date.now()
  }
}

export const triggerCustomHeartbeat = (sphereRef, pattern) => {
  if (!sphereRef.current || !pattern) return
  
  const { intensity, duration } = pattern
  const originalScale = sphereRef.current.scale.x
  
  // Custom beat animation
  const animate = (progress) => {
    const curve = Math.sin(progress * Math.PI)
    const scale = originalScale + (intensity * curve)
    sphereRef.current.scale.setScalar(scale)
    
    if (progress < 1) {
      requestAnimationFrame(() => animate(progress + 0.02))
    } else {
      sphereRef.current.scale.setScalar(originalScale)
    }
  }
  
  animate(0)
}