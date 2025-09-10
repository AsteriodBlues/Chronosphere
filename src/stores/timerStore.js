import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const DEFAULT_TIMER = {
  id: crypto.randomUUID(),
  status: 'idle', // 'idle' | 'focus' | 'break' | 'pause' | 'flow' | 'quantum'
  timeRemaining: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  sessionCount: 0,
  currentStreak: 0,
  isBreathing: true,
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