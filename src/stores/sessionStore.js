import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { calculateStreakStats, calculateProductivityScore, generateSessionId } from '../utils/timeUtils'

const DEFAULT_SESSION_STATE = {
  sessions: [],
  currentSession: null,
  stats: {
    totalSessions: 0,
    totalFocusTime: 0,
    totalBreakTime: 0,
    averageSessionLength: 0,
    productivityScore: 0,
    streaks: {
      current: 0,
      longest: 0,
      today: 0,
      week: 0
    }
  },
  insights: {
    mostProductiveHour: null,
    preferredCategory: null,
    averageBreakLength: 0,
    focusTimeToday: 0,
    sessionsThisWeek: 0
  }
}

export const useSessionStore = create()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_SESSION_STATE,

        // Session Management
        startSession: (timerData) => {
          const session = {
            id: generateSessionId(),
            type: timerData.status, // 'focus' | 'break' | 'flow' | 'quantum'
            category: timerData.category,
            preset: timerData.preset,
            plannedDuration: timerData.totalTime,
            actualDuration: 0,
            startTime: new Date().toISOString(),
            endTime: null,
            completed: false,
            paused: false,
            pausedDuration: 0,
            interruptions: 0,
            quality: null, // User rating 1-5
            notes: '',
            tags: [],
            mood: null, // 'focused' | 'distracted' | 'energetic' | 'tired' | 'motivated'
            environment: 'home', // 'home' | 'office' | 'cafe' | 'library' | 'other'
            achievements: []
          }

          set((state) => ({
            currentSession: session,
            sessions: [...state.sessions, session]
          }))

          return session.id
        },

        updateCurrentSession: (updates) => {
          set((state) => {
            if (!state.currentSession) return state

            const updatedSession = { ...state.currentSession, ...updates }
            const updatedSessions = state.sessions.map(session =>
              session.id === state.currentSession.id ? updatedSession : session
            )

            return {
              currentSession: updatedSession,
              sessions: updatedSessions
            }
          })
        },

        completeSession: (actualDuration, quality = null, notes = '') => {
          set((state) => {
            if (!state.currentSession) return state

            const completedSession = {
              ...state.currentSession,
              endTime: new Date().toISOString(),
              actualDuration,
              completed: true,
              quality,
              notes
            }

            const updatedSessions = state.sessions.map(session =>
              session.id === state.currentSession.id ? completedSession : session
            )

            // Calculate updated stats
            const stats = get().calculateStats(updatedSessions)
            const insights = get().calculateInsights(updatedSessions)

            return {
              currentSession: null,
              sessions: updatedSessions,
              stats,
              insights
            }
          })
        },

        pauseSession: () => {
          set((state) => {
            if (!state.currentSession) return state
            return {
              currentSession: {
                ...state.currentSession,
                paused: true,
                interruptions: state.currentSession.interruptions + 1
              }
            }
          })
        },

        resumeSession: () => {
          set((state) => {
            if (!state.currentSession) return state
            return {
              currentSession: {
                ...state.currentSession,
                paused: false
              }
            }
          })
        },

        cancelSession: () => {
          set((state) => {
            if (!state.currentSession) return state

            const cancelledSession = {
              ...state.currentSession,
              endTime: new Date().toISOString(),
              completed: false,
              notes: state.currentSession.notes + ' [CANCELLED]'
            }

            const updatedSessions = state.sessions.map(session =>
              session.id === state.currentSession.id ? cancelledSession : session
            )

            return {
              currentSession: null,
              sessions: updatedSessions
            }
          })
        },

        // Analytics and Insights
        calculateStats: (sessions = null) => {
          const sessionList = sessions || get().sessions
          if (!sessionList.length) return DEFAULT_SESSION_STATE.stats

          const completedSessions = sessionList.filter(s => s.completed)
          const focusSessions = completedSessions.filter(s => s.type === 'focus' || s.type === 'flow')
          const breakSessions = completedSessions.filter(s => s.type === 'break')

          const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.actualDuration, 0)
          const totalBreakTime = breakSessions.reduce((sum, s) => sum + s.actualDuration, 0)
          const averageSessionLength = completedSessions.length > 0 ? 
            completedSessions.reduce((sum, s) => sum + s.actualDuration, 0) / completedSessions.length : 0

          const streaks = calculateStreakStats(completedSessions)
          const productivityScore = calculateProductivityScore(completedSessions)

          return {
            totalSessions: completedSessions.length,
            totalFocusTime,
            totalBreakTime,
            averageSessionLength: Math.round(averageSessionLength),
            productivityScore,
            streaks
          }
        },

        calculateInsights: (sessions = null) => {
          const sessionList = sessions || get().sessions
          const completedSessions = sessionList.filter(s => s.completed)
          
          if (!completedSessions.length) return DEFAULT_SESSION_STATE.insights

          // Most productive hour
          const hourCounts = {}
          completedSessions.forEach(session => {
            const hour = new Date(session.startTime).getHours()
            hourCounts[hour] = (hourCounts[hour] || 0) + session.actualDuration
          })
          const mostProductiveHour = Object.keys(hourCounts).reduce((a, b) => 
            hourCounts[a] > hourCounts[b] ? a : b, 0)

          // Preferred category
          const categoryCounts = {}
          completedSessions.forEach(session => {
            categoryCounts[session.category] = (categoryCounts[session.category] || 0) + 1
          })
          const preferredCategory = Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b, 'work')

          // Average break length
          const breakSessions = completedSessions.filter(s => s.type === 'break')
          const averageBreakLength = breakSessions.length > 0 ? 
            breakSessions.reduce((sum, s) => sum + s.actualDuration, 0) / breakSessions.length : 0

          // Focus time today
          const today = new Date().toDateString()
          const todaysSessions = completedSessions.filter(s => 
            new Date(s.startTime).toDateString() === today && 
            (s.type === 'focus' || s.type === 'flow')
          )
          const focusTimeToday = todaysSessions.reduce((sum, s) => sum + s.actualDuration, 0)

          // Sessions this week
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          const sessionsThisWeek = completedSessions.filter(s => 
            new Date(s.startTime) >= weekAgo
          ).length

          return {
            mostProductiveHour: parseInt(mostProductiveHour),
            preferredCategory,
            averageBreakLength: Math.round(averageBreakLength),
            focusTimeToday,
            sessionsThisWeek
          }
        },

        // Session Queries
        getSessionsByCategory: (category) => {
          return get().sessions.filter(session => session.category === category)
        },

        getSessionsByDateRange: (startDate, endDate) => {
          const start = new Date(startDate)
          const end = new Date(endDate)
          return get().sessions.filter(session => {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= start && sessionDate <= end
          })
        },

        getSessionsByType: (type) => {
          return get().sessions.filter(session => session.type === type)
        },

        getTodaysSessions: () => {
          const today = new Date().toDateString()
          return get().sessions.filter(session => 
            new Date(session.startTime).toDateString() === today
          )
        },

        getWeeklyReport: () => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          const weekSessions = get().sessions.filter(s => 
            new Date(s.startTime) >= weekAgo && s.completed
          )

          const dailyStats = {}
          weekSessions.forEach(session => {
            const day = new Date(session.startTime).toDateString()
            if (!dailyStats[day]) {
              dailyStats[day] = { sessions: 0, focusTime: 0, breakTime: 0 }
            }
            dailyStats[day].sessions++
            if (session.type === 'focus' || session.type === 'flow') {
              dailyStats[day].focusTime += session.actualDuration
            } else if (session.type === 'break') {
              dailyStats[day].breakTime += session.actualDuration
            }
          })

          return {
            totalSessions: weekSessions.length,
            dailyStats,
            averageDailyFocus: Object.values(dailyStats).reduce((sum, day) => sum + day.focusTime, 0) / 7,
            averageDailySessions: weekSessions.length / 7
          }
        },

        // Data Management
        exportSessions: (format = 'json') => {
          const data = {
            sessions: get().sessions,
            stats: get().stats,
            insights: get().insights,
            exportDate: new Date().toISOString(),
            version: '1.0'
          }

          if (format === 'csv') {
            // Convert to CSV format
            const headers = 'ID,Type,Category,Start Time,End Time,Duration,Completed,Quality,Notes'
            const rows = get().sessions.map(s => 
              `${s.id},${s.type},${s.category},${s.startTime},${s.endTime},${s.actualDuration},${s.completed},${s.quality || ''},${s.notes.replace(/,/g, ';')}`
            )
            return [headers, ...rows].join('\n')
          }

          return JSON.stringify(data, null, 2)
        },

        importSessions: (data) => {
          try {
            const imported = typeof data === 'string' ? JSON.parse(data) : data
            if (imported.sessions && Array.isArray(imported.sessions)) {
              set((state) => ({
                sessions: [...state.sessions, ...imported.sessions],
                stats: get().calculateStats(),
                insights: get().calculateInsights()
              }))
              return true
            }
          } catch (error) {
            console.error('Failed to import sessions:', error)
          }
          return false
        },

        clearAllSessions: () => {
          set(DEFAULT_SESSION_STATE)
        },

        // Achievement System
        checkAchievements: (session) => {
          const achievements = []
          const stats = get().stats

          // First session
          if (stats.totalSessions === 1) {
            achievements.push('first_session')
          }

          // Streak achievements
          if (stats.streaks.current === 7) {
            achievements.push('week_streak')
          }
          if (stats.streaks.current === 30) {
            achievements.push('month_streak')
          }

          // Time achievements
          if (session.actualDuration >= 3600) { // 1 hour
            achievements.push('hour_session')
          }

          // Productivity achievements
          if (stats.productivityScore >= 80) {
            achievements.push('productivity_master')
          }

          return achievements
        }
      }),
      {
        name: 'chronosphere-sessions',
        version: 1
      }
    ),
    {
      name: 'SessionStore'
    }
  )
)