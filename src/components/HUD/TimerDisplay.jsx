import { useEffect, useRef } from 'react'
import { useTimerStore } from '../../stores/timerStore'

export default function TimerDisplay() {
  const displayRef = useRef()
  const progressRef = useRef()
  
  const {
    timer,
    startTimer,
    pauseTimer,
    stopTimer
  } = useTimerStore()
  
  const timeRemaining = timer.timeRemaining
  const duration = timer.totalTime
  const timerState = timer.status
  const sessionType = timer.category || 'focus'
  const completedSessions = timer.completedSessions || 0
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Calculate progress percentage
  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0
  
  // Determine if timer is running
  const isRunning = ['focus', 'break', 'flow'].includes(timerState)
  
  // Pulse effect when timer is about to end
  useEffect(() => {
    if (timeRemaining < 60 && timeRemaining > 0 && isRunning) {
      displayRef.current?.classList.add('text-pulse-glow')
    } else {
      displayRef.current?.classList.remove('text-pulse-glow')
    }
  }, [timeRemaining, isRunning])
  
  // Session type configurations
  const sessionConfig = {
    focus: {
      label: '🎯 Focus Session',
      duration: 25,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    break: {
      label: '☕ Break Time',
      duration: 5,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    longBreak: {
      label: '🌴 Long Break',
      duration: 15,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700'
    }
  }
  
  const currentConfig = sessionConfig[sessionType] || sessionConfig.focus
  
  return (
    <div className="glass-content text-center">
      {/* Main Timer Display */}
      <div className="mb-6">
        <div 
          ref={displayRef}
          className="text-timer-large text-primary mb-2 transition-all duration-300"
        >
          {formatTime(timeRemaining)}
        </div>
        
        {/* Session Status */}
        <div className="text-ui text-secondary mb-3">
          {currentConfig.label}
          {isRunning ? ' • Active' : ' • Ready'}
        </div>
        
        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg 
            className="w-32 h-32 transform -rotate-90"
            viewBox="0 0 120 120"
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              ref={progressRef}
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              className="transition-all duration-300 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={sessionType === 'focus' ? '#4080ff' : sessionType === 'break' ? '#00ff80' : '#ff8040'} />
                <stop offset="100%" stopColor={sessionType === 'focus' ? '#8040ff' : sessionType === 'break' ? '#40ff80' : '#ff4080'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center completion indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        
        {/* Session Counter */}
        <div className="text-caption text-tertiary">
          Sessions completed today: {completedSessions}
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex justify-center gap-3 mb-6">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className={`${currentConfig.bgColor} ${currentConfig.hoverColor} text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg`}
          >
            Start {currentConfig.label.split(' ')[1]}
          </button>
        ) : (
          <>
            <button
              onClick={pauseTimer}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
            >
              Pause
            </button>
            <button
              onClick={stopTimer}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
            >
              Stop
            </button>
          </>
        )}
      </div>
      
      {/* Session Type Switcher */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Object.entries(sessionConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => {
              // Session type switching would be handled differently
              if (isRunning) stopTimer() // Auto-stop when switching during active session
            }}
            disabled={isRunning}
            className={`py-2 px-4 rounded-lg text-small font-medium transition-all ${
              sessionType === key
                ? `${config.bgColor} text-white shadow-lg`
                : 'glass-panel--tertiary text-tertiary hover:text-secondary hover:glass-panel--secondary'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-105'}`}
          >
            <div className="font-semibold">
              {key === 'longBreak' ? 'Long' : key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
            <div className="text-micro opacity-75">
              {config.duration}min
            </div>
          </button>
        ))}
      </div>
      
      {/* Advanced Controls */}
      <div className="flex justify-center gap-2">
        <button className="glass-panel--tertiary glass-panel--hover px-3 py-1 rounded text-caption text-tertiary hover:text-secondary transition-all">
          +5 min
        </button>
        <button className="glass-panel--tertiary glass-panel--hover px-3 py-1 rounded text-caption text-tertiary hover:text-secondary transition-all">
          Settings
        </button>
        <button className="glass-panel--tertiary glass-panel--hover px-3 py-1 rounded text-caption text-tertiary hover:text-secondary transition-all">
          Sound
        </button>
      </div>
      
      {/* Keyboard Shortcuts Hint */}
      <div className="text-micro text-quaternary mt-4">
        Space: Start/Pause • Esc: Stop • F: Focus • B: Break
      </div>
    </div>
  )
}