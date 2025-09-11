import { useEffect, useState } from 'react'
import { useTimerStore } from '../../stores/timerStore'
import { useSessionStore } from '../../stores/sessionStore'
import { notificationSystem } from '../../utils/audioEngine'

export default function NotificationManager() {
  const { timer } = useTimerStore()
  const { currentSession, stats } = useSessionStore()
  const [lastNotification, setLastNotification] = useState(null)
  const [warningsSent, setWarningsSent] = useState(new Set())

  // Initialize notification system
  useEffect(() => {
    notificationSystem.initialize()
  }, [])

  // Monitor timer state changes for notifications
  useEffect(() => {
    const handleStateChange = async () => {
      const now = Date.now()
      
      // Avoid duplicate notifications
      if (lastNotification && now - lastNotification < 1000) return

      switch (timer.status) {
        case 'focus':
          if (timer.isActive && !timer.isPaused) {
            await notificationSystem.notify('sessionStart', {
              title: 'Focus Session Started',
              message: `${timer.totalTime / 60} minute ${currentSession?.category || 'work'} session`,
              sound: true,
              desktop: true
            })
          }
          break

        case 'break':
          if (timer.isActive && !timer.isPaused) {
            const isLongBreak = timer.totalTime > 10 * 60
            await notificationSystem.notify('breakStart', {
              title: `${isLongBreak ? 'Long' : 'Short'} Break Started`,
              message: `Time to relax for ${timer.totalTime / 60} minutes`,
              sound: true,
              desktop: true
            })
          }
          break

        case 'idle':
          // Check if this was a completion
          if (timer.completedSessions > 0) {
            const wasBreak = currentSession?.type === 'break'
            await notificationSystem.notify(wasBreak ? 'breakComplete' : 'sessionComplete', {
              title: wasBreak ? 'Break Complete!' : 'Session Complete!',
              message: wasBreak 
                ? 'Ready to get back to work?' 
                : `Great work! You've completed ${timer.completedSessions} session${timer.completedSessions === 1 ? '' : 's'} today.`,
              sound: true,
              desktop: true
            })

            // Check for milestones
            checkMilestones()
          }
          break
      }

      setLastNotification(now)
    }

    handleStateChange()
  }, [timer.status, timer.isActive, timer.isPaused, timer.completedSessions])

  // Monitor time remaining for warnings
  useEffect(() => {
    if (!timer.isActive || timer.isPaused || timer.status !== 'focus') {
      setWarningsSent(new Set())
      return
    }

    const checkWarnings = async () => {
      const minutesRemaining = Math.ceil(timer.timeRemaining / 60)
      
      // 5-minute warning
      if (minutesRemaining === 5 && !warningsSent.has(5)) {
        await notificationSystem.notify('warning', {
          title: '5 Minutes Remaining',
          message: 'Start wrapping up your current task',
          sound: true,
          desktop: false,
          minutesRemaining: 5
        })
        setWarningsSent(prev => new Set(prev).add(5))
      }

      // 1-minute warning
      if (minutesRemaining === 1 && !warningsSent.has(1)) {
        await notificationSystem.notify('warning', {
          title: '1 Minute Remaining',
          message: 'Almost done! Finish your current thought',
          sound: true,
          desktop: false,
          minutesRemaining: 1
        })
        setWarningsSent(prev => new Set(prev).add(1))
      }

      // Final 10 seconds
      if (timer.timeRemaining <= 10 && timer.timeRemaining > 0 && !warningsSent.has(0)) {
        await notificationSystem.notify('warning', {
          title: 'Session Ending',
          message: `${timer.timeRemaining} seconds remaining`,
          sound: true,
          desktop: false,
          minutesRemaining: 0
        })
        setWarningsSent(prev => new Set(prev).add(0))
      }
    }

    const interval = setInterval(checkWarnings, 1000)
    return () => clearInterval(interval)
  }, [timer.timeRemaining, timer.isActive, timer.isPaused, timer.status, warningsSent])

  // Check for achievement milestones
  const checkMilestones = async () => {
    const { current: currentStreak, longest: longestStreak } = stats.streaks
    const completedToday = stats.streaks.today

    // Streak milestones
    if (currentStreak > 0 && currentStreak % 5 === 0) {
      await notificationSystem.notify('milestone', {
        title: `${currentStreak} Session Streak!`,
        message: `You're on fire! Keep the momentum going.`,
        sound: true,
        desktop: true
      })
    }

    // Daily completion milestones
    if (completedToday === 8) { // Full work day
      await notificationSystem.notify('milestone', {
        title: 'Full Day Complete!',
        message: `You've completed 8 focus sessions today. Outstanding work!`,
        sound: true,
        desktop: true
      })
    }

    // First session of the day
    if (completedToday === 1) {
      const hour = new Date().getHours()
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
      
      await notificationSystem.notify('milestone', {
        title: `${greeting}! First Session Complete`,
        message: `Great start to your productive day!`,
        sound: true,
        desktop: true
      })
    }

    // Personal record
    if (currentStreak > longestStreak && currentStreak > 1) {
      await notificationSystem.notify('milestone', {
        title: 'New Personal Record!',
        message: `${currentStreak} sessions is your new best streak!`,
        sound: true,
        desktop: true
      })
    }
  }

  // Handle break auto-start notifications
  useEffect(() => {
    if (timer.status === 'idle' && timer.timeRemaining === 0) {
      // Timer just completed, check if we should auto-start break
      const shouldAutoStartBreak = true // This would come from settings
      
      if (shouldAutoStartBreak) {
        // Give user a moment to see completion, then start break
        setTimeout(async () => {
          await notificationSystem.notify('breakStart', {
            title: 'Break Time!',
            message: 'Starting your well-deserved break automatically',
            sound: true,
            desktop: true
          })
        }, 3000)
      }
    }
  }, [timer.status, timer.timeRemaining])

  // Productivity insights notifications
  useEffect(() => {
    const checkProductivityInsights = async () => {
      const { productivityScore } = stats
      const hour = new Date().getHours()

      // High productivity achievement
      if (productivityScore >= 90 && completedToday >= 3) {
        await notificationSystem.notify('milestone', {
          title: 'Peak Performance!',
          message: `Productivity score: ${productivityScore}%. You're in the zone!`,
          sound: true,
          desktop: true
        })
      }

      // End of work day summary
      if (hour === 17 && completedToday > 0) { // 5 PM
        await notificationSystem.notify('milestone', {
          title: 'Work Day Summary',
          message: `You completed ${completedToday} focus sessions today. Time to unwind!`,
          sound: false,
          desktop: true
        })
      }
    }

    // Check productivity insights every hour
    const interval = setInterval(checkProductivityInsights, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [stats, completedToday])

  // Handle emergency/distraction notifications
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && timer.isActive && !timer.isPaused && timer.status === 'focus') {
        // User switched away during focus session
        setTimeout(async () => {
          if (document.hidden) {
            await notificationSystem.notify('warning', {
              title: 'Stay Focused!',
              message: 'You have an active focus session running',
              sound: false,
              desktop: true
            })
          }
        }, 30000) // Wait 30 seconds before notifying
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [timer.isActive, timer.isPaused, timer.status])

  // Custom notification for flow state entry
  useEffect(() => {
    if (timer.status === 'flow' && timer.isActive) {
      const notifyFlowEntry = async () => {
        await notificationSystem.notify('milestone', {
          title: 'Flow State Activated',
          message: 'Extended focus session for deep work. You got this!',
          sound: true,
          desktop: true
        })
      }
      notifyFlowEntry()
    }
  }, [timer.status, timer.isActive])

  // Quantum mode notifications
  useEffect(() => {
    if (timer.status === 'quantum' && timer.isActive) {
      const notifyQuantumEntry = async () => {
        await notificationSystem.notify('milestone', {
          title: 'Quantum Mode Engaged',
          message: 'AI-optimized session with adaptive features active',
          sound: true,
          desktop: true
        })
      }
      notifyQuantumEntry()
    }
  }, [timer.status, timer.isActive])

  return null // This component only manages notifications
}

// Toast notification component for in-app notifications
export function ToastNotification() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const handleNotification = (event) => {
      const { type, title, message, duration } = event.detail
      const id = Date.now()
      
      const notification = {
        id,
        type,
        title,
        message,
        duration
      }

      setNotifications(prev => [...prev, notification])

      // Auto-remove after duration
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, duration)
    }

    window.addEventListener('chronosphere-notification', handleNotification)
    return () => window.removeEventListener('chronosphere-notification', handleNotification)
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`glass-panel rounded-lg p-4 max-w-sm transform transition-all duration-300 ${
            notification.type === 'warning' ? 'border-yellow-500' :
            notification.type === 'milestone' ? 'border-purple-500' :
            'border-blue-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {notification.type === 'warning' ? '⚠️' :
               notification.type === 'milestone' ? '🎉' :
               notification.type === 'sessionComplete' ? '✅' :
               notification.type === 'breakComplete' ? '☕' :
               '🔔'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">
                {notification.title}
              </div>
              <div className="text-gray-300 text-xs mt-1">
                {notification.message}
              </div>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}