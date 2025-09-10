import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const DEFAULT_PRODUCTIVITY_DATA = {
  sessions: [],
  streaks: {
    current: 0,
    longest: 0,
    weeklyStreak: 0,
    monthlyAverage: 0,
    milestones: []
  },
  analytics: {
    totalFocusTime: 0,
    averageSessionLength: 0,
    bestFocusHour: 14, // 2 PM default
    productivityTrend: 'stable',
    weeklyGoalProgress: 0,
    monthlyStats: {
      focusHours: 0,
      completedSessions: 0,
      averageEfficiency: 0,
      longestStreak: 0,
      achievements: []
    }
  }
}

export const useProductivityStore = create()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_PRODUCTIVITY_DATA,
        
        // Session Management
        addSession: (sessionData) => {
          const newSession = {
            id: crypto.randomUUID(),
            startTime: new Date(),
            planned: sessionData.planned || 25 * 60,
            actual: sessionData.actual || 0,
            category: sessionData.category || 'general',
            efficiency: sessionData.efficiency || 1.0,
            distractions: sessionData.distractions || 0,
            mood: sessionData.mood || 'neutral',
            ...sessionData
          }
          
          set((state) => ({
            sessions: [...state.sessions, newSession],
            analytics: {
              ...state.analytics,
              totalFocusTime: state.analytics.totalFocusTime + newSession.actual,
              completedSessions: state.sessions.length + 1
            }
          }))
          
          // Update analytics after adding session
          get().updateAnalytics()
        },
        
        updateSession: (sessionId, updates) => {
          set((state) => ({
            sessions: state.sessions.map(session => 
              session.id === sessionId 
                ? { ...session, ...updates, endTime: new Date() }
                : session
            )
          }))
          get().updateAnalytics()
        },
        
        // Streak Management
        updateStreak: (increment = true) => {
          set((state) => {
            const newCurrent = increment ? state.streaks.current + 1 : 0
            return {
              streaks: {
                ...state.streaks,
                current: newCurrent,
                longest: Math.max(state.streaks.longest, newCurrent)
              }
            }
          })
        },
        
        addMilestone: (milestone) => {
          set((state) => ({
            streaks: {
              ...state.streaks,
              milestones: [...state.streaks.milestones, {
                id: crypto.randomUUID(),
                achieved: true,
                unlockedAt: new Date(),
                ...milestone
              }]
            }
          }))
        },
        
        // Analytics
        updateAnalytics: () => {
          const { sessions } = get()
          if (sessions.length === 0) return
          
          const totalTime = sessions.reduce((sum, s) => sum + s.actual, 0)
          const avgLength = totalTime / sessions.length
          
          // Calculate best focus hour
          const hourMap = {}
          sessions.forEach(session => {
            const hour = new Date(session.startTime).getHours()
            hourMap[hour] = (hourMap[hour] || 0) + session.efficiency
          })
          
          const bestHour = Object.entries(hourMap).reduce((best, [hour, efficiency]) => 
            efficiency > best.efficiency ? { hour: parseInt(hour), efficiency } : best,
            { hour: 14, efficiency: 0 }
          ).hour
          
          // Calculate trend (last 7 days vs previous 7 days)
          const now = new Date()
          const last7Days = sessions.filter(s => 
            (now - new Date(s.startTime)) / (1000 * 60 * 60 * 24) <= 7
          )
          const prev7Days = sessions.filter(s => {
            const daysDiff = (now - new Date(s.startTime)) / (1000 * 60 * 60 * 24)
            return daysDiff > 7 && daysDiff <= 14
          })
          
          const recentAvg = last7Days.reduce((sum, s) => sum + s.efficiency, 0) / (last7Days.length || 1)
          const prevAvg = prev7Days.reduce((sum, s) => sum + s.efficiency, 0) / (prev7Days.length || 1)
          
          let trend = 'stable'
          if (recentAvg > prevAvg * 1.1) trend = 'increasing'
          else if (recentAvg < prevAvg * 0.9) trend = 'decreasing'
          
          set((state) => ({
            analytics: {
              ...state.analytics,
              totalFocusTime: totalTime,
              averageSessionLength: avgLength,
              bestFocusHour: bestHour,
              productivityTrend: trend,
              monthlyStats: {
                ...state.analytics.monthlyStats,
                focusHours: Math.round(totalTime / 3600),
                completedSessions: sessions.length,
                averageEfficiency: sessions.reduce((sum, s) => sum + s.efficiency, 0) / sessions.length
              }
            }
          }))
        },
        
        // Data Management
        getSessionsByDate: (date) => {
          const { sessions } = get()
          const targetDate = new Date(date).toDateString()
          return sessions.filter(session => 
            new Date(session.startTime).toDateString() === targetDate
          )
        },
        
        getWeeklyData: () => {
          const { sessions } = get()
          const now = new Date()
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
          
          return sessions.filter(session => 
            new Date(session.startTime) >= weekAgo
          )
        },
        
        getMonthlyData: () => {
          const { sessions } = get()
          const now = new Date()
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          
          return sessions.filter(session => 
            new Date(session.startTime) >= monthAgo
          )
        },
        
        // Efficiency Tracking
        calculateEfficiency: (planned, actual, distractions) => {
          const timeEfficiency = Math.min(actual / planned, 1.0)
          const focusEfficiency = Math.max(0, 1 - (distractions * 0.1))
          return (timeEfficiency * 0.7) + (focusEfficiency * 0.3)
        },
        
        // Achievements
        checkAchievements: () => {
          const { streaks, analytics } = get()
          const achievements = []
          
          // Streak achievements
          if (streaks.current === 7) achievements.push({ name: 'Week Warrior', type: 'streak' })
          if (streaks.current === 30) achievements.push({ name: 'Monthly Master', type: 'streak' })
          if (streaks.current === 100) achievements.push({ name: 'Centurion', type: 'streak' })
          
          // Time achievements
          if (analytics.totalFocusTime >= 100 * 3600) {
            achievements.push({ name: 'Century of Focus', type: 'time' })
          }
          
          // Efficiency achievements
          if (analytics.monthlyStats.averageEfficiency >= 0.9) {
            achievements.push({ name: 'Efficiency Expert', type: 'efficiency' })
          }
          
          achievements.forEach(achievement => get().addMilestone(achievement))
        },
        
        // Reset functions
        resetAllData: () => {
          set(DEFAULT_PRODUCTIVITY_DATA)
        },
        
        exportData: () => {
          const state = get()
          return {
            sessions: state.sessions,
            streaks: state.streaks,
            analytics: state.analytics,
            exportDate: new Date().toISOString()
          }
        },
        
        importData: (data) => {
          set({
            sessions: data.sessions || [],
            streaks: data.streaks || DEFAULT_PRODUCTIVITY_DATA.streaks,
            analytics: data.analytics || DEFAULT_PRODUCTIVITY_DATA.analytics
          })
          get().updateAnalytics()
        }
      }),
      {
        name: 'chronosphere-productivity',
        partialize: (state) => ({
          sessions: state.sessions,
          streaks: state.streaks,
          analytics: state.analytics
        })
      }
    )
  )
)