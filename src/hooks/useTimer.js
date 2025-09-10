import { useEffect, useRef } from 'react'
import { useTimerStore } from '../stores/timerStore'
import { useProductivityStore } from '../stores/productivityStore'
import { useSettingsStore } from '../stores/settingsStore'

export const useTimer = () => {
  const intervalRef = useRef(null)
  
  const {
    timer,
    sphere,
    startTimer,
    pauseTimer,
    stopTimer,
    completeSession,
    startBreak,
    enterFlowState,
    tick,
    setSphereState,
    triggerExplosion,
    triggerReformation,
    updateBreathing,
    setSessionDuration,
    setBreakDuration
  } = useTimerStore()
  
  const { addSession, updateSession, updateStreak, checkAchievements } = useProductivityStore()
  const { timer: timerSettings, audio: audioSettings } = useSettingsStore()
  
  // Timer tick effect
  useEffect(() => {
    if (timer.status === 'focus' || timer.status === 'break') {
      intervalRef.current = setInterval(() => {
        tick()
        
        // Play tick sound if enabled
        if (audioSettings.tickSound && audioSettings.sfxEnabled) {
          playTickSound()
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timer.status, tick, audioSettings.tickSound, audioSettings.sfxEnabled])
  
  // Session completion effects
  useEffect(() => {
    if (timer.timeRemaining === 0 && timer.status === 'focus') {
      handleSessionComplete()
    } else if (timer.timeRemaining === 0 && timer.status === 'break') {
      handleBreakComplete()
    }
  }, [timer.timeRemaining, timer.status])
  
  const handleSessionComplete = () => {
    // Add session to productivity data
    const sessionData = {
      planned: timer.totalTime,
      actual: timer.totalTime,
      category: 'focus',
      efficiency: calculateEfficiency(),
      mood: 'good'
    }
    
    addSession(sessionData)
    updateStreak(true)
    checkAchievements()
    
    // Play completion sound
    if (audioSettings.completionSound && audioSettings.sfxEnabled) {
      playCompletionSound()
    }
    
    // Auto-start break if enabled
    if (timerSettings.autoStartBreaks) {
      const breakDuration = shouldTakeLongBreak() 
        ? timerSettings.longBreakDuration * 60
        : timerSettings.shortBreakDuration * 60
      
      setTimeout(() => {
        startBreak(breakDuration)
      }, 1000)
    }
    
    // Check for flow state
    if (timer.sessionCount >= 2) {
      enterFlowState()
    }
  }
  
  const handleBreakComplete = () => {
    // Auto-start next session if enabled
    if (timerSettings.autoStartFocus) {
      setTimeout(() => {
        startTimer(timerSettings.focusDuration * 60)
      }, 1000)
    }
  }
  
  const shouldTakeLongBreak = () => {
    return timer.sessionCount % timerSettings.sessionsUntilLongBreak === 0
  }
  
  const calculateEfficiency = () => {
    // Basic efficiency calculation - can be enhanced with distraction tracking
    return timer.totalTime > 0 ? 1.0 : 0.0
  }
  
  const playTickSound = () => {
    // Simple tick sound - will be enhanced with Tone.js
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(audioSettings.tickVolume * audioSettings.masterVolume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }
  
  const playCompletionSound = () => {
    // Completion chord - will be enhanced with Tone.js
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const frequencies = [523.25, 659.25, 783.99] // C-E-G chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
      gainNode.gain.setValueAtTime(
        (audioSettings.completionVolume * audioSettings.masterVolume) / frequencies.length,
        audioContext.currentTime + index * 0.1
      )
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5)
      
      oscillator.start(audioContext.currentTime + index * 0.1)
      oscillator.stop(audioContext.currentTime + 1.5)
    })
  }
  
  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const getProgress = () => {
    if (timer.totalTime === 0) return 0
    return (timer.totalTime - timer.timeRemaining) / timer.totalTime
  }
  
  const getTimeRemaining = () => {
    return formatTime(timer.timeRemaining)
  }
  
  const isActive = () => {
    return timer.status === 'focus' || timer.status === 'break'
  }
  
  const isPaused = () => {
    return timer.status === 'pause'
  }
  
  const isBreak = () => {
    return timer.status === 'break'
  }
  
  const isFocusing = () => {
    return timer.status === 'focus'
  }
  
  const isFlowState = () => {
    return timer.status === 'flow'
  }
  
  const startFocusSession = (duration) => {
    const sessionDuration = duration || timerSettings.focusDuration * 60
    startTimer(sessionDuration)
  }
  
  const startBreakSession = (duration) => {
    const breakDuration = duration || timerSettings.shortBreakDuration * 60
    startBreak(breakDuration)
  }
  
  return {
    // State
    timer,
    sphere,
    
    // Actions
    startFocusSession,
    startBreakSession,
    pauseTimer,
    stopTimer,
    setSphereState,
    triggerExplosion,
    triggerReformation,
    updateBreathing,
    setSessionDuration,
    setBreakDuration,
    
    // Computed values
    progress: getProgress(),
    timeRemaining: getTimeRemaining(),
    isActive: isActive(),
    isPaused: isPaused(),
    isBreak: isBreak(),
    isFocusing: isFocusing(),
    isFlowState: isFlowState(),
    
    // Utilities
    formatTime,
    shouldTakeLongBreak: shouldTakeLongBreak()
  }
}