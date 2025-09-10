import { useMemo } from 'react'
import { useProductivityStore } from '../stores/productivityStore'

export const useProductivity = () => {
  const {
    sessions,
    streaks,
    analytics,
    addSession,
    updateSession,
    updateStreak,
    addMilestone,
    updateAnalytics,
    getSessionsByDate,
    getWeeklyData,
    getMonthlyData,
    calculateEfficiency,
    checkAchievements,
    resetAllData,
    exportData,
    importData
  } = useProductivityStore()
  
  // Computed values
  const todaySessions = useMemo(() => {
    return getSessionsByDate(new Date())
  }, [sessions])
  
  const weeklyData = useMemo(() => {
    return getWeeklyData()
  }, [sessions])
  
  const monthlyData = useMemo(() => {
    return getMonthlyData()
  }, [sessions])
  
  const todayStats = useMemo(() => {
    const today = todaySessions
    const totalTime = today.reduce((sum, session) => sum + session.actual, 0)
    const avgEfficiency = today.length > 0 
      ? today.reduce((sum, session) => sum + session.efficiency, 0) / today.length 
      : 0
    
    return {
      sessions: today.length,
      focusTime: totalTime,
      averageEfficiency: avgEfficiency,
      completionRate: today.length > 0 ? today.filter(s => s.actual >= s.planned * 0.8).length / today.length : 0
    }
  }, [todaySessions])
  
  const weeklyStats = useMemo(() => {
    const weekly = weeklyData
    const totalTime = weekly.reduce((sum, session) => sum + session.actual, 0)
    const avgEfficiency = weekly.length > 0 
      ? weekly.reduce((sum, session) => sum + session.efficiency, 0) / weekly.length 
      : 0
    
    // Group by day for weekly chart
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayKey = date.toDateString()
      
      const daySessions = weekly.filter(session => 
        new Date(session.startTime).toDateString() === dayKey
      )
      
      return {
        date: date,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        sessions: daySessions.length,
        focusTime: daySessions.reduce((sum, s) => sum + s.actual, 0),
        efficiency: daySessions.length > 0 
          ? daySessions.reduce((sum, s) => sum + s.efficiency, 0) / daySessions.length 
          : 0
      }
    })
    
    return {
      sessions: weekly.length,
      focusTime: totalTime,
      averageEfficiency: avgEfficiency,
      dailyData
    }
  }, [weeklyData])
  
  const productivityTrend = useMemo(() => {
    if (sessions.length < 14) return 'insufficient_data'
    
    const recent = sessions.slice(-7)
    const previous = sessions.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, s) => sum + s.efficiency, 0) / recent.length
    const previousAvg = previous.reduce((sum, s) => sum + s.efficiency, 0) / previous.length
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100
    
    if (change > 10) return 'improving'
    if (change < -10) return 'declining'
    return 'stable'
  }, [sessions])
  
  const bestPerformanceHour = useMemo(() => {
    if (sessions.length === 0) return 14 // 2 PM default
    
    const hourMap = {}
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours()
      if (!hourMap[hour]) {
        hourMap[hour] = { total: 0, count: 0 }
      }
      hourMap[hour].total += session.efficiency
      hourMap[hour].count += 1
    })
    
    let bestHour = 14
    let bestAvg = 0
    
    Object.entries(hourMap).forEach(([hour, data]) => {
      const avg = data.total / data.count
      if (avg > bestAvg) {
        bestAvg = avg
        bestHour = parseInt(hour)
      }
    })
    
    return bestHour
  }, [sessions])
  
  const streakMilestones = useMemo(() => {
    const current = streaks.current
    const milestones = [
      { days: 3, name: 'Getting Started', achieved: current >= 3 },
      { days: 7, name: 'Week Warrior', achieved: current >= 7 },
      { days: 21, name: 'Habit Former', achieved: current >= 21 },
      { days: 30, name: 'Monthly Master', achieved: current >= 30 },
      { days: 66, name: 'Habit Locked', achieved: current >= 66 },
      { days: 100, name: 'Centurion', achieved: current >= 100 },
      { days: 365, name: 'Year Legend', achieved: current >= 365 }
    ]
    
    return milestones
  }, [streaks.current])
  
  const nextMilestone = useMemo(() => {
    return streakMilestones.find(m => !m.achieved) || streakMilestones[streakMilestones.length - 1]
  }, [streakMilestones])
  
  const categoryStats = useMemo(() => {
    const categoryMap = {}
    
    sessions.forEach(session => {
      const category = session.category || 'general'
      if (!categoryMap[category]) {
        categoryMap[category] = {
          sessions: 0,
          totalTime: 0,
          totalEfficiency: 0
        }
      }
      
      categoryMap[category].sessions += 1
      categoryMap[category].totalTime += session.actual
      categoryMap[category].totalEfficiency += session.efficiency
    })
    
    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      sessions: data.sessions,
      totalTime: data.totalTime,
      averageEfficiency: data.totalEfficiency / data.sessions,
      percentage: (data.sessions / sessions.length) * 100
    })).sort((a, b) => b.sessions - a.sessions)
  }, [sessions])
  
  const moodDistribution = useMemo(() => {
    const moodMap = { excellent: 0, good: 0, neutral: 0, struggling: 0 }
    
    sessions.forEach(session => {
      const mood = session.mood || 'neutral'
      moodMap[mood] += 1
    })
    
    const total = sessions.length || 1
    return Object.entries(moodMap).map(([mood, count]) => ({
      mood,
      count,
      percentage: (count / total) * 100
    }))
  }, [sessions])
  
  // Utility functions
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  
  const getProductivityScore = () => {
    if (sessions.length === 0) return 0
    
    const recentSessions = sessions.slice(-10) // Last 10 sessions
    const avgEfficiency = recentSessions.reduce((sum, s) => sum + s.efficiency, 0) / recentSessions.length
    const streakBonus = Math.min(streaks.current / 30, 1) * 0.2 // Up to 20% bonus
    
    return Math.min((avgEfficiency + streakBonus) * 100, 100)
  }
  
  const getPredictiveInsights = () => {
    const insights = []
    
    // Best time insight
    const bestHour = bestPerformanceHour
    const timeStr = new Date().setHours(bestHour, 0, 0, 0).toLocaleTimeString('en', { 
      hour: 'numeric', 
      hour12: true 
    })
    insights.push({
      type: 'timing',
      message: `You perform best around ${timeStr}`,
      confidence: sessions.length > 10 ? 'high' : 'medium'
    })
    
    // Streak insight
    if (streaks.current > 0) {
      const daysToNext = nextMilestone.days - streaks.current
      insights.push({
        type: 'streak',
        message: `${daysToNext} more days to reach "${nextMilestone.name}"`,
        confidence: 'high'
      })
    }
    
    // Productivity trend
    if (productivityTrend === 'improving') {
      insights.push({
        type: 'trend',
        message: 'Your productivity is trending upward!',
        confidence: 'high'
      })
    } else if (productivityTrend === 'declining') {
      insights.push({
        type: 'trend',
        message: 'Consider adjusting your approach',
        confidence: 'medium'
      })
    }
    
    return insights
  }
  
  return {
    // Core data
    sessions,
    streaks,
    analytics,
    
    // Computed stats
    todayStats,
    weeklyStats,
    productivityTrend,
    bestPerformanceHour,
    streakMilestones,
    nextMilestone,
    categoryStats,
    moodDistribution,
    productivityScore: getProductivityScore(),
    
    // Insights
    predictiveInsights: getPredictiveInsights(),
    
    // Actions
    addSession,
    updateSession,
    updateStreak,
    addMilestone,
    updateAnalytics,
    calculateEfficiency,
    checkAchievements,
    
    // Data management
    exportData,
    importData,
    resetAllData,
    
    // Utilities
    formatTime,
    getSessionsByDate,
    getWeeklyData,
    getMonthlyData
  }
}