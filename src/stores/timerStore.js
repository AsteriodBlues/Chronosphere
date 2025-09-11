import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { TimerEngine, generateSessionId, TIMER_PRESETS, SESSION_CATEGORIES } from '../utils/timeUtils'

// Timer states with detailed definitions
const TIMER_STATES = {
  idle: { 
    name: 'Idle', 
    description: 'Ready to start a session',
    sphereMaterial: 'liquid',
    breathingRate: 4000,
    glowIntensity: 0.3
  },
  focus: { 
    name: 'Focus', 
    description: 'Deep work session in progress',
    sphereMaterial: 'crystal',
    breathingRate: 6000,
    glowIntensity: 0.8
  },
  break: { 
    name: 'Break', 
    description: 'Rest and recharge time',
    sphereMaterial: 'glass',
    breathingRate: 3000,
    glowIntensity: 0.4
  },
  pause: { 
    name: 'Paused', 
    description: 'Session temporarily paused',
    sphereMaterial: 'diamond',
    breathingRate: 8000,
    glowIntensity: 0.2
  },
  flow: { 
    name: 'Flow State', 
    description: 'Extended deep work session',
    sphereMaterial: 'plasma',
    breathingRate: 10000,
    glowIntensity: 1.0
  },
  quantum: { 
    name: 'Quantum Mode', 
    description: 'Adaptive session with AI optimization',
    sphereMaterial: 'liquid',
    breathingRate: 5000,
    glowIntensity: 0.9
  }
}

const DEFAULT_TIMER = {
  id: generateSessionId(),
  status: 'idle',
  timeRemaining: 25 * 60,
  totalTime: 25 * 60,
  sessionCount: 0,
  completedSessions: 0,
  currentStreak: 0,
  preset: 'pomodoro',
  category: 'work',
  isActive: false,
  isPaused: false,
  startTime: null,
  endTime: null,
  engine: new TimerEngine(),
}

const DEFAULT_SPHERE = {
  material: 'liquid', // 'liquid' | 'crystal' | 'plasma' | 'glass' | 'diamond'
  breathingRate: 4000, // 4 second cycle
  pulsing: false,
  exploding: false,
  reforming: false,
  glowIntensity: 0.5,
  particleCount: 1000,
}

export const useTimerStore = create()(
  devtools(
    persist(
      (set, get) => ({
        timer: DEFAULT_TIMER,
        sphere: DEFAULT_SPHERE,
        
        startTimer: (duration = 25 * 60) => {
          set((state) => ({
            timer: {
              ...state.timer,
              status: 'focus',
              timeRemaining: duration,
              totalTime: duration,
              id: crypto.randomUUID(),
            },
            sphere: {
              ...state.sphere,
              material: 'crystal',
              pulsing: true,
              glowIntensity: 0.8,
            }
          }))
        },
        
        pauseTimer: () => {
          set((state) => ({
            timer: { ...state.timer, status: 'pause' },
            sphere: { ...state.sphere, pulsing: false }
          }))
        },
        
        stopTimer: () => {
          set((state) => ({
            timer: { ...DEFAULT_TIMER, currentStreak: state.timer.currentStreak },
            sphere: { ...DEFAULT_SPHERE }
          }))
        },
        
        completeSession: () => {
          const { timer } = get()
          set((state) => ({
            timer: {
              ...state.timer,
              sessionCount: timer.sessionCount + 1,
              currentStreak: timer.currentStreak + 1,
              status: 'idle',
            },
            sphere: {
              ...state.sphere,
              exploding: true,
              material: 'plasma',
              glowIntensity: 1.0,
            }
          }))
          
          // Trigger explosion sequence
          get().triggerExplosion()
        },
        
        startBreak: (duration = 5 * 60) => {
          set((state) => ({
            timer: {
              ...state.timer,
              status: 'break',
              timeRemaining: duration,
              totalTime: duration,
            },
            sphere: {
              ...state.sphere,
              material: 'liquid',
              reforming: true,
              exploding: false,
              particleCount: 5000,
            }
          }))
        },
        
        enterFlowState: () => {
          const { timer } = get()
          if (timer.sessionCount >= 3) {
            set((state) => ({
              timer: { ...state.timer, status: 'flow' },
              sphere: {
                ...state.sphere,
                material: 'diamond',
                glowIntensity: 1.2,
                particleCount: 10000,
              }
            }))
          }
        },
        
        tick: () => {
          const { timer } = get()
          if (timer.status === 'focus' || timer.status === 'break') {
            if (timer.timeRemaining > 0) {
              set((state) => ({
                timer: { ...state.timer, timeRemaining: timer.timeRemaining - 1 }
              }))
            } else {
              if (timer.status === 'focus') {
                get().completeSession()
              } else {
                get().stopTimer()
              }
            }
          }
        },
        
        setSphereState: (newState) => {
          set((state) => ({
            sphere: { ...state.sphere, ...newState }
          }))
        },
        
        triggerExplosion: () => {
          set((state) => ({
            sphere: { ...state.sphere, exploding: true, reforming: false }
          }))
          
          // Auto-start reformation after explosion
          setTimeout(() => {
            get().triggerReformation()
          }, 3000)
        },
        
        triggerReformation: () => {
          set((state) => ({
            sphere: {
              ...state.sphere,
              exploding: false,
              reforming: true,
              particleCount: 1000,
            }
          }))
          
          // Complete reformation
          setTimeout(() => {
            set((state) => ({
              sphere: { ...state.sphere, reforming: false }
            }))
          }, 2000)
        },
        
        updateBreathing: (rate) => {
          set((state) => ({
            sphere: { ...state.sphere, breathingRate: rate }
          }))
        },
        
        setSessionDuration: (minutes) => {
          const seconds = minutes * 60
          set((state) => ({
            timer: {
              ...state.timer,
              timeRemaining: state.timer.status === 'idle' ? seconds : state.timer.timeRemaining,
              totalTime: seconds,
            }
          }))
        },
        
        setBreakDuration: (minutes) => {
          // Store for next break - will be implemented with settings store
        },
      }),
      {
        name: 'chronosphere-timer',
        partialize: (state) => ({
          timer: {
            sessionCount: state.timer.sessionCount,
            currentStreak: state.timer.currentStreak,
          },
          sphere: {
            material: state.sphere.material,
            breathingRate: state.sphere.breathingRate,
          }
        })
      }
    )
  )
)