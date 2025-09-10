import { useSettingsStore } from '../stores/settingsStore'
import { useEffect } from 'react'

export const useSettings = () => {
  const {
    timer,
    visual,
    audio,
    personality,
    ai,
    gestures,
    notifications,
    team,
    performance,
    accessibility,
    customColors,
    updateTimerSettings,
    updateVisualSettings,
    updateAudioSettings,
    updatePersonalitySettings,
    updateAISettings,
    updateGestureSettings,
    updateNotificationSettings,
    updateTeamSettings,
    updatePerformanceSettings,
    updateAccessibilitySettings,
    updateCustomColors,
    setParticleDensity,
    setMasterVolume,
    setPersonalityType,
    addCustomGesture,
    setFPSTarget,
    enableHighContrast,
    enableReducedMotion,
    resetToDefaults,
    exportSettings,
    importSettings,
    getEffectiveColors,
    getParticleCount
  } = useSettingsStore()
  
  // Auto-adjust performance based on device capabilities
  useEffect(() => {
    if (performance.adaptiveQuality) {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      
      if (gl) {
        const vendor = gl.getParameter(gl.VENDOR)
        const renderer = gl.getParameter(gl.RENDERER)
        
        // Simple device capability detection
        const isLowEnd = /mali|adreno [1-3]|powervr|intel/i.test(renderer)
        const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent)
        
        if (isLowEnd || isMobile) {
          updatePerformanceSettings({
            fpsTarget: 30,
            particleLimit: 1000
          })
          updateVisualSettings({
            particleDensity: 'low',
            postProcessing: false,
            shadows: false,
            reflections: false
          })
        }
      }
    }
  }, [performance.adaptiveQuality])
  
  // Auto-adjust colors based on time if enabled
  useEffect(() => {
    if (visual.colorTheme === 'auto' && personality.adaptiveColors) {
      const updateColors = () => {
        const colors = getEffectiveColors()
        // Colors are computed on-demand, no need to store them
      }
      
      // Update every hour
      const interval = setInterval(updateColors, 60 * 60 * 1000)
      updateColors() // Initial update
      
      return () => clearInterval(interval)
    }
  }, [visual.colorTheme, personality.adaptiveColors])
  
  // Accessibility adjustments
  useEffect(() => {
    if (accessibility.reducedMotion) {
      updatePerformanceSettings({
        fpsTarget: 30
      })
      updateVisualSettings({
        particleDensity: 'low'
      })
    }
  }, [accessibility.reducedMotion])
  
  useEffect(() => {
    if (accessibility.highContrast) {
      updateVisualSettings({
        bloomIntensity: 0.1,
        chromaticAberration: 0
      })
    }
  }, [accessibility.highContrast])
  
  // Computed settings
  const effectiveColors = getEffectiveColors()
  const particleCount = getParticleCount()
  
  const qualityPresets = {
    potato: {
      particleDensity: 'low',
      postProcessing: false,
      shadows: false,
      reflections: false,
      bloomIntensity: 0,
      fpsTarget: 30,
      particleLimit: 500
    },
    low: {
      particleDensity: 'low',
      postProcessing: false,
      shadows: false,
      reflections: true,
      bloomIntensity: 0.2,
      fpsTarget: 30,
      particleLimit: 1000
    },
    medium: {
      particleDensity: 'medium',
      postProcessing: true,
      shadows: true,
      reflections: true,
      bloomIntensity: 0.5,
      fpsTarget: 60,
      particleLimit: 5000
    },
    high: {
      particleDensity: 'high',
      postProcessing: true,
      shadows: true,
      reflections: true,
      bloomIntensity: 0.8,
      fpsTarget: 60,
      particleLimit: 10000
    },
    ultra: {
      particleDensity: 'insane',
      postProcessing: true,
      shadows: true,
      reflections: true,
      bloomIntensity: 1.0,
      fpsTarget: 120,
      particleLimit: 20000
    }
  }
  
  const applyQualityPreset = (preset) => {
    const settings = qualityPresets[preset]
    if (settings) {
      updateVisualSettings({
        particleDensity: settings.particleDensity,
        postProcessing: settings.postProcessing,
        shadows: settings.shadows,
        reflections: settings.reflections,
        bloomIntensity: settings.bloomIntensity
      })
      updatePerformanceSettings({
        fpsTarget: settings.fpsTarget,
        particleLimit: settings.particleLimit
      })
    }
  }
  
  const personalityPresets = {
    zen: {
      name: 'Zen Master',
      description: 'Minimal, calm, meditation-focused',
      settings: {
        encouragementLevel: 0.2,
        visualComplexity: 0.3,
        particleDensity: 'low',
        ambientEnabled: true,
        motivationalMessages: false
      }
    },
    warrior: {
      name: 'Productivity Warrior',
      description: 'Intense, competitive, achievement-driven',
      settings: {
        encouragementLevel: 0.9,
        visualComplexity: 0.8,
        particleDensity: 'high',
        motivationalMessages: true,
        sfxEnabled: true
      }
    },
    explorer: {
      name: 'Creative Explorer',
      description: 'Playful, discovery-oriented, visually rich',
      settings: {
        encouragementLevel: 0.6,
        visualComplexity: 0.9,
        particleDensity: 'insane',
        adaptiveColors: true,
        gesturesEnabled: true
      }
    },
    scientist: {
      name: 'Data Scientist',
      description: 'Analytical, data-heavy, precise',
      settings: {
        encouragementLevel: 0.4,
        visualComplexity: 0.6,
        particleDensity: 'medium',
        patternAnalysis: true,
        personalizedRecommendations: true
      }
    },
    artist: {
      name: 'Digital Artist',
      description: 'Beautiful, expressive, visually stunning',
      settings: {
        encouragementLevel: 0.7,
        visualComplexity: 1.0,
        particleDensity: 'high',
        adaptiveColors: true,
        postProcessing: true
      }
    }
  }
  
  const applyPersonalityPreset = (type) => {
    const preset = personalityPresets[type]
    if (preset) {
      setPersonalityType(type)
      // Additional settings from preset
      if (preset.settings.ambientEnabled !== undefined) {
        updateAudioSettings({ ambientEnabled: preset.settings.ambientEnabled })
      }
      if (preset.settings.gesturesEnabled !== undefined) {
        updateGestureSettings({ enabled: preset.settings.gesturesEnabled })
      }
      if (preset.settings.patternAnalysis !== undefined) {
        updateAISettings({ patternAnalysis: preset.settings.patternAnalysis })
      }
    }
  }
  
  const getDeviceOptimizedSettings = () => {
    const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent)
    const isLowRAM = navigator.deviceMemory && navigator.deviceMemory < 4
    const isSlowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4
    
    if (isMobile || isLowRAM || isSlowCPU) {
      return 'low'
    } else if (navigator.deviceMemory >= 8 && navigator.hardwareConcurrency >= 8) {
      return 'high'
    } else {
      return 'medium'
    }
  }
  
  const autoOptimizeForDevice = () => {
    const recommended = getDeviceOptimizedSettings()
    applyQualityPreset(recommended)
  }
  
  const validateSettings = () => {
    const issues = []
    
    if (performance.fpsTarget > 60 && visual.particleDensity === 'insane') {
      issues.push({
        type: 'performance',
        message: 'High FPS target with maximum particles may cause stuttering',
        severity: 'warning'
      })
    }
    
    if (accessibility.reducedMotion && visual.particleDensity !== 'low') {
      issues.push({
        type: 'accessibility',
        message: 'Reduced motion is enabled but particle density is high',
        severity: 'info'
      })
    }
    
    if (audio.masterVolume > 0.8) {
      issues.push({
        type: 'audio',
        message: 'High volume may be uncomfortable during long sessions',
        severity: 'info'
      })
    }
    
    return issues
  }
  
  const getRecommendations = () => {
    const recommendations = []
    
    if (performance.adaptiveQuality === false) {
      recommendations.push({
        title: 'Enable Adaptive Quality',
        description: 'Automatically adjust visual quality based on performance',
        action: () => updatePerformanceSettings({ adaptiveQuality: true })
      })
    }
    
    if (personality.type === 'balanced' && timer.focusDuration === 25) {
      recommendations.push({
        title: 'Customize Your Experience',
        description: 'Try different personality types to match your work style',
        action: () => {} // Would open personality selection
      })
    }
    
    return recommendations
  }
  
  return {
    // All settings
    timer,
    visual,
    audio,
    personality,
    ai,
    gestures,
    notifications,
    team,
    performance,
    accessibility,
    customColors,
    
    // Computed values
    effectiveColors,
    particleCount,
    qualityPresets,
    personalityPresets,
    
    // Update functions
    updateTimerSettings,
    updateVisualSettings,
    updateAudioSettings,
    updatePersonalitySettings,
    updateAISettings,
    updateGestureSettings,
    updateNotificationSettings,
    updateTeamSettings,
    updatePerformanceSettings,
    updateAccessibilitySettings,
    updateCustomColors,
    
    // Convenience functions
    setParticleDensity,
    setMasterVolume,
    setPersonalityType,
    addCustomGesture,
    setFPSTarget,
    enableHighContrast,
    enableReducedMotion,
    
    // Preset functions
    applyQualityPreset,
    applyPersonalityPreset,
    autoOptimizeForDevice,
    
    // Utilities
    validateSettings,
    getRecommendations,
    getDeviceOptimizedSettings,
    
    // Data management
    resetToDefaults,
    exportSettings,
    importSettings
  }
}