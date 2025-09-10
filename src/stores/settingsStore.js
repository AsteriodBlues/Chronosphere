import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const DEFAULT_SETTINGS = {
  // Timer Settings
  timer: {
    focusDuration: 25, // minutes
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartFocus: false,
    tickSound: true,
    completionSound: true
  },
  
  // Sphere & Visual Settings
  visual: {
    particleDensity: 'medium', // 'low' | 'medium' | 'high' | 'insane'
    postProcessing: true,
    shadows: true,
    reflections: true,
    bloomIntensity: 0.5,
    chromaticAberration: 0.1,
    sphereMaterial: 'liquid',
    backgroundType: 'gradient', // 'gradient' | 'space' | 'minimal'
    colorTheme: 'auto' // 'auto' | 'custom'
  },
  
  // Audio Settings
  audio: {
    masterVolume: 0.7,
    ambientEnabled: true,
    sfxEnabled: true,
    spatialAudio: true,
    binaural: false,
    customSoundPack: 'default',
    tickVolume: 0.3,
    completionVolume: 0.8
  },
  
  // Personalization
  personality: {
    type: 'balanced', // 'zen' | 'warrior' | 'explorer' | 'scientist' | 'artist' | 'balanced'
    encouragementLevel: 0.5,
    visualComplexity: 0.7,
    adaptiveColors: true,
    motivationalMessages: true
  },
  
  // AI & Learning
  ai: {
    learningEnabled: true,
    predictiveBreaks: true,
    adaptiveTimers: true,
    encouragementTiming: 'optimal', // 'optimal' | 'regular' | 'minimal'
    patternAnalysis: true,
    personalizedRecommendations: true
  },
  
  // Gestures & Controls
  gestures: {
    enabled: true,
    sensitivity: 0.7,
    hapticFeedback: true,
    customGestures: {
      'circle': 'speedUpTime',
      'swipeLeft': 'previousMode',
      'swipeRight': 'nextMode',
      'shake': 'scrambleAndReform'
    }
  },
  
  // Notifications
  notifications: {
    sessionStart: true,
    sessionEnd: true,
    breakReminder: true,
    streakMilestone: true,
    teamUpdates: false,
    encouragement: true,
    desktop: true,
    sound: true
  },
  
  // Team Settings
  team: {
    enabled: false,
    autoJoinSessions: false,
    shareProductivity: true,
    competitiveMode: false,
    collaborativeMode: true
  },
  
  // Performance
  performance: {
    fpsTarget: 60,
    adaptiveQuality: true,
    backgroundThrottling: true,
    particleLimit: 10000,
    lodEnabled: true
  },
  
  // Accessibility
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    oneHandedMode: false,
    colorBlindMode: 'none' // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
  },
  
  // Custom Colors (when colorTheme is 'custom')
  customColors: {
    primary: '#0080FF',
    secondary: '#00D084',
    accent: '#7B2CBF',
    glow: '#FFFFFF',
    particles: '#FFD93D',
    background: '#1a1a2e'
  }
}

export const useSettingsStore = create()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_SETTINGS,
        
        // Timer Settings
        updateTimerSettings: (updates) => {
          set((state) => ({
            timer: { ...state.timer, ...updates }
          }))
        },
        
        // Visual Settings
        updateVisualSettings: (updates) => {
          set((state) => ({
            visual: { ...state.visual, ...updates }
          }))
        },
        
        setParticleDensity: (density) => {
          const particleCounts = {
            low: 500,
            medium: 2000,
            high: 8000,
            insane: 20000
          }
          
          set((state) => ({
            visual: { ...state.visual, particleDensity: density },
            performance: { 
              ...state.performance, 
              particleLimit: particleCounts[density] 
            }
          }))
        },
        
        // Audio Settings
        updateAudioSettings: (updates) => {
          set((state) => ({
            audio: { ...state.audio, ...updates }
          }))
        },
        
        setMasterVolume: (volume) => {
          set((state) => ({
            audio: { ...state.audio, masterVolume: Math.max(0, Math.min(1, volume)) }
          }))
        },
        
        // Personality Settings
        updatePersonalitySettings: (updates) => {
          set((state) => ({
            personality: { ...state.personality, ...updates }
          }))
        },
        
        setPersonalityType: (type) => {
          const presets = {
            zen: {
              encouragementLevel: 0.2,
              visualComplexity: 0.3,
              particleDensity: 'low'
            },
            warrior: {
              encouragementLevel: 0.9,
              visualComplexity: 0.8,
              particleDensity: 'high'
            },
            explorer: {
              encouragementLevel: 0.6,
              visualComplexity: 0.9,
              particleDensity: 'insane'
            },
            scientist: {
              encouragementLevel: 0.4,
              visualComplexity: 0.6,
              particleDensity: 'medium'
            },
            artist: {
              encouragementLevel: 0.7,
              visualComplexity: 1.0,
              particleDensity: 'high'
            },
            balanced: {
              encouragementLevel: 0.5,
              visualComplexity: 0.7,
              particleDensity: 'medium'
            }
          }
          
          const preset = presets[type] || presets.balanced
          
          set((state) => ({
            personality: { ...state.personality, type, ...preset },
            visual: { ...state.visual, particleDensity: preset.particleDensity }
          }))
        },
        
        // AI Settings
        updateAISettings: (updates) => {
          set((state) => ({
            ai: { ...state.ai, ...updates }
          }))
        },
        
        // Gesture Settings
        updateGestureSettings: (updates) => {
          set((state) => ({
            gestures: { ...state.gestures, ...updates }
          }))
        },
        
        addCustomGesture: (gesture, action) => {
          set((state) => ({
            gestures: {
              ...state.gestures,
              customGestures: {
                ...state.gestures.customGestures,
                [gesture]: action
              }
            }
          }))
        },
        
        // Notification Settings
        updateNotificationSettings: (updates) => {
          set((state) => ({
            notifications: { ...state.notifications, ...updates }
          }))
        },
        
        // Team Settings
        updateTeamSettings: (updates) => {
          set((state) => ({
            team: { ...state.team, ...updates }
          }))
        },
        
        // Performance Settings
        updatePerformanceSettings: (updates) => {
          set((state) => ({
            performance: { ...state.performance, ...updates }
          }))
        },
        
        setFPSTarget: (fps) => {
          set((state) => ({
            performance: { ...state.performance, fpsTarget: fps }
          }))
        },
        
        // Accessibility Settings
        updateAccessibilitySettings: (updates) => {
          set((state) => ({
            accessibility: { ...state.accessibility, ...updates }
          }))
        },
        
        enableHighContrast: () => {
          set((state) => ({
            accessibility: { ...state.accessibility, highContrast: true },
            visual: { 
              ...state.visual, 
              particleDensity: 'low',
              postProcessing: false,
              bloomIntensity: 0.1
            }
          }))
        },
        
        enableReducedMotion: () => {
          set((state) => ({
            accessibility: { ...state.accessibility, reducedMotion: true },
            visual: { 
              ...state.visual, 
              particleDensity: 'low'
            },
            performance: {
              ...state.performance,
              fpsTarget: 30
            }
          }))
        },
        
        // Custom Colors
        updateCustomColors: (colors) => {
          set((state) => ({
            customColors: { ...state.customColors, ...colors }
          }))
        },
        
        // Utility Functions
        resetToDefaults: () => {
          set(DEFAULT_SETTINGS)
        },
        
        exportSettings: () => {
          const state = get()
          return {
            ...state,
            exportDate: new Date().toISOString()
          }
        },
        
        importSettings: (settings) => {
          set({
            ...DEFAULT_SETTINGS,
            ...settings
          })
        },
        
        // Get computed values
        getEffectiveColors: () => {
          const { visual, customColors } = get()
          if (visual.colorTheme === 'custom') {
            return customColors
          }
          
          // Auto color based on time of day
          const hour = new Date().getHours()
          if (hour >= 5 && hour < 9) {
            return { primary: '#FF6B35', secondary: '#4ECDC4', accent: '#FFD93D' }
          } else if (hour >= 9 && hour < 14) {
            return { primary: '#0080FF', secondary: '#00D084', accent: '#7B2CBF' }
          } else if (hour >= 14 && hour < 18) {
            return { primary: '#008B8B', secondary: '#FF6B6B', accent: '#FFC107' }
          } else if (hour >= 18 && hour < 22) {
            return { primary: '#6B5B95', secondary: '#D4A5A5', accent: '#87A96B' }
          } else {
            return { primary: '#191970', secondary: '#DC143C', accent: '#C0C0C0' }
          }
        },
        
        getParticleCount: () => {
          const { visual, performance } = get()
          const densityMap = {
            low: 500,
            medium: 2000,
            high: 8000,
            insane: 20000
          }
          return Math.min(densityMap[visual.particleDensity], performance.particleLimit)
        }
      }),
      {
        name: 'chronosphere-settings'
      }
    )
  )
)