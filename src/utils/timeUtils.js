/**
 * Time calculation utilities with high precision
 * Handles all timer-related calculations and formatting
 */

export class TimerEngine {
  constructor() {
    this.startTime = null
    this.pausedTime = 0
    this.lastTick = null
    this.precision = 100 // 100ms precision for smooth updates
  }

  start(duration) {
    this.startTime = performance.now()
    this.pausedTime = 0
    this.lastTick = this.startTime
    this.duration = duration * 1000 // Convert to milliseconds
    return this.startTime
  }

  pause() {
    if (this.startTime && !this.pausedTime) {
      this.pausedTime = performance.now()
    }
  }

  resume() {
    if (this.pausedTime) {
      const pauseDuration = performance.now() - this.pausedTime
      this.startTime += pauseDuration
      this.lastTick = performance.now()
      this.pausedTime = 0
    }
  }

  getRemainingTime() {
    if (!this.startTime) return 0
    if (this.pausedTime) return this.duration - (this.pausedTime - this.startTime)
    
    const elapsed = performance.now() - this.startTime
    const remaining = Math.max(0, this.duration - elapsed)
    return Math.ceil(remaining / 1000) // Return in seconds
  }

  getProgress() {
    if (!this.startTime || !this.duration) return 0
    
    const elapsed = this.pausedTime ? 
      (this.pausedTime - this.startTime) : 
      (performance.now() - this.startTime)
    
    return Math.min(1, elapsed / this.duration)
  }

  isComplete() {
    return this.getRemainingTime() === 0
  }

  reset() {
    this.startTime = null
    this.pausedTime = 0
    this.lastTick = null
    this.duration = 0
  }
}

// Time formatting utilities
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`
  } else if (mins > 0) {
    return `${mins}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

// Preset durations
export const TIMER_PRESETS = {
  pomodoro: {
    focus: 25 * 60,      // 25 minutes
    shortBreak: 5 * 60,  // 5 minutes
    longBreak: 15 * 60,  // 15 minutes
    sessionsUntilLongBreak: 4
  },
  extended: {
    focus: 50 * 60,      // 50 minutes
    shortBreak: 10 * 60, // 10 minutes
    longBreak: 30 * 60,  // 30 minutes
    sessionsUntilLongBreak: 3
  },
  sprint: {
    focus: 15 * 60,      // 15 minutes
    shortBreak: 3 * 60,  // 3 minutes
    longBreak: 10 * 60,  // 10 minutes
    sessionsUntilLongBreak: 6
  },
  flow: {
    focus: 90 * 60,      // 90 minutes
    shortBreak: 20 * 60, // 20 minutes
    longBreak: 45 * 60,  // 45 minutes
    sessionsUntilLongBreak: 2
  },
  custom: {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    sessionsUntilLongBreak: 4
  }
}

// Session categories for tracking
export const SESSION_CATEGORIES = {
  work: { 
    name: 'Work', 
    color: '#0080ff', 
    icon: '💼',
    description: 'Professional tasks and projects' 
  },
  study: { 
    name: 'Study', 
    color: '#00d084', 
    icon: '📚',
    description: 'Learning and educational activities' 
  },
  creative: { 
    name: 'Creative', 
    color: '#7b2cbf', 
    icon: '🎨',
    description: 'Art, design, and creative work' 
  },
  fitness: { 
    name: 'Fitness', 
    color: '#ff6b35', 
    icon: '💪',
    description: 'Exercise and physical activities' 
  },
  personal: { 
    name: 'Personal', 
    color: '#ffd93d', 
    icon: '🏠',
    description: 'Personal tasks and life activities' 
  },
  coding: { 
    name: 'Coding', 
    color: '#4ecdc4', 
    icon: '💻',
    description: 'Programming and development' 
  },
  reading: { 
    name: 'Reading', 
    color: '#95a5a6', 
    icon: '📖',
    description: 'Reading books and articles' 
  },
  meditation: { 
    name: 'Meditation', 
    color: '#9b59b6', 
    icon: '🧘',
    description: 'Mindfulness and meditation practice' 
  }
}

// Time tracking utilities
export const calculateStreakStats = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return { current: 0, longest: 0, today: 0, week: 0 }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let todayCount = 0
  let weekCount = 0

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.endTime) - new Date(b.endTime))

  for (let i = 0; i < sortedSessions.length; i++) {
    const session = sortedSessions[i]
    const sessionDate = new Date(session.endTime)

    // Count today's sessions
    if (sessionDate >= today) {
      todayCount++
    }

    // Count this week's sessions
    if (sessionDate >= weekAgo) {
      weekCount++
    }

    // Calculate streaks (consecutive days with sessions)
    if (session.completed) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Current streak is the last consecutive completed sessions
  for (let i = sortedSessions.length - 1; i >= 0; i--) {
    if (sortedSessions[i].completed) {
      currentStreak++
    } else {
      break
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    today: todayCount,
    week: weekCount
  }
}

export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Productivity insights
export const calculateProductivityScore = (sessions, timeframe = 7) => {
  if (!sessions || sessions.length === 0) return 0

  const cutoff = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  const recentSessions = sessions.filter(s => new Date(s.endTime) >= cutoff && s.completed)
  
  if (recentSessions.length === 0) return 0

  const totalTime = recentSessions.reduce((sum, s) => sum + s.duration, 0)
  const averageTime = totalTime / recentSessions.length
  const consistency = recentSessions.length / timeframe
  
  // Score based on time spent and consistency (0-100)
  const timeScore = Math.min(100, (averageTime / (25 * 60)) * 50) // Max 50 points for 25+ min sessions
  const consistencyScore = Math.min(50, consistency * 10) // Max 50 points for 5+ sessions per day
  
  return Math.round(timeScore + consistencyScore)
}

export default TimerEngine