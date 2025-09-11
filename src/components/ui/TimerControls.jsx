import { useState, useEffect } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { useSessionStore } from '../../stores/sessionStore'
import { TIMER_PRESETS, SESSION_CATEGORIES, formatTime } from '../../utils/timeUtils'

export default function TimerControls() {
  const {
    timer,
    isActive,
    isPaused,
    timeRemaining,
    totalTime,
    progress,
    status,
    preset,
    category,
    start,
    pause,
    resume,
    stop,
    switchPreset,
    switchCategory,
    formatTime: timerFormat
  } = useTimer()

  const { currentSession } = useSessionStore()
  const [showPresets, setShowPresets] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [customDuration, setCustomDuration] = useState(25)

  // Gesture detection state
  const [gestureMode, setGestureMode] = useState(false)
  const [lastGesture, setLastGesture] = useState(null)

  // Format time display
  const displayTime = timerFormat(timeRemaining)
  const progressPercentage = (progress * 100).toFixed(1)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.target.tagName.toLowerCase() === 'input') return
      
      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault()
          if (isActive && !isPaused) {
            pause()
          } else if (isPaused) {
            resume()
          } else {
            start()
          }
          break
        case 'escape':
          event.preventDefault()
          stop()
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault()
          const presetKeys = ['pomodoro', 'extended', 'sprint', 'flow', 'custom']
          const presetIndex = parseInt(event.key) - 1
          if (presetKeys[presetIndex] && !isActive) {
            switchPreset(presetKeys[presetIndex])
          }
          break
        case 'f':
          event.preventDefault()
          if (!isActive) {
            const flowDuration = TIMER_PRESETS.flow.focus
            start(flowDuration, 'flow')
          }
          break
        case 'q':
          event.preventDefault()
          if (!isActive) {
            const quantumDuration = TIMER_PRESETS[preset].focus
            start(quantumDuration, 'quantum')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, isPaused, preset, start, pause, resume, stop, switchPreset])

  // Gesture recognition (simplified - would integrate with actual gesture library)
  const handleGesture = (gestureType) => {
    setLastGesture(gestureType)
    
    switch (gestureType) {
      case 'tap':
        if (isActive && !isPaused) pause()
        else if (isPaused) resume()
        else start()
        break
      case 'swipeUp':
        if (!isActive) {
          start(TIMER_PRESETS.flow.focus, 'flow')
        }
        break
      case 'swipeDown':
        stop()
        break
      case 'swipeLeft':
        if (!isActive) {
          const presets = Object.keys(TIMER_PRESETS)
          const currentIndex = presets.indexOf(preset)
          const prevPreset = presets[currentIndex - 1] || presets[presets.length - 1]
          switchPreset(prevPreset)
        }
        break
      case 'swipeRight':
        if (!isActive) {
          const presets = Object.keys(TIMER_PRESETS)
          const currentIndex = presets.indexOf(preset)
          const nextPreset = presets[currentIndex + 1] || presets[0]
          switchPreset(nextPreset)
        }
        break
      case 'pinch':
        setCustomDuration(Math.max(5, customDuration - 5))
        break
      case 'spread':
        setCustomDuration(Math.min(120, customDuration + 5))
        break
      case 'shake':
        // Emergency stop/reset
        stop()
        break
    }
  }

  // Quick start functions
  const quickStart = (minutes) => {
    start(minutes * 60)
  }

  const startBreak = (isLong = false) => {
    const duration = isLong ? 
      TIMER_PRESETS[preset].longBreak : 
      TIMER_PRESETS[preset].shortBreak
    start(duration, 'break')
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-panel rounded-2xl p-6 min-w-[320px] max-w-[480px]">
        {/* Main Timer Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-white mb-2">
            {displayTime}
          </div>
          <div className="text-sm text-gray-300 mb-3">
            {status.charAt(0).toUpperCase() + status.slice(1)} • {TIMER_PRESETS[preset]?.name || preset}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Session Info */}
          {currentSession && (
            <div className="text-xs text-gray-400">
              Session {timer.completedSessions + 1} • {SESSION_CATEGORIES[category]?.name || category}
            </div>
          )}
        </div>

        {/* Main Controls */}
        <div className="flex justify-center gap-4 mb-6">
          {!isActive ? (
            <button
              onClick={() => start()}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Start Focus
            </button>
          ) : isPaused ? (
            <button
              onClick={resume}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={pause}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Pause
            </button>
          )}
          
          {isActive && (
            <button
              onClick={stop}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Stop
            </button>
          )}
        </div>

        {/* Quick Actions */}
        {!isActive && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => quickStart(15)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Quick 15min
            </button>
            <button
              onClick={() => quickStart(45)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Deep 45min
            </button>
            <button
              onClick={() => startBreak(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Short Break
            </button>
            <button
              onClick={() => startBreak(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Long Break
            </button>
          </div>
        )}

        {/* Preset Selector */}
        <div className="mb-4">
          <button
            onClick={() => setShowPresets(!showPresets)}
            disabled={isActive}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm transition-colors flex justify-between items-center"
          >
            <span>Preset: {TIMER_PRESETS[preset]?.name || preset}</span>
            <span className={`transform transition-transform ${showPresets ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showPresets && !isActive && (
            <div className="mt-2 space-y-1">
              {Object.entries(TIMER_PRESETS).map(([key, presetData]) => (
                <button
                  key={key}
                  onClick={() => {
                    switchPreset(key)
                    setShowPresets(false)
                  }}
                  className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                    preset === key 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  }`}
                >
                  <div className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <div className="text-xs opacity-75">
                    {presetData.focus / 60}min focus • {presetData.shortBreak / 60}min break
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Selector */}
        <div className="mb-4">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition-colors flex justify-between items-center"
          >
            <span className="flex items-center gap-2">
              <span>{SESSION_CATEGORIES[category]?.icon}</span>
              <span>{SESSION_CATEGORIES[category]?.name || category}</span>
            </span>
            <span className={`transform transition-transform ${showCategories ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showCategories && (
            <div className="mt-2 space-y-1">
              {Object.entries(SESSION_CATEGORIES).map(([key, categoryData]) => (
                <button
                  key={key}
                  onClick={() => {
                    switchCategory(key)
                    setShowCategories(false)
                  }}
                  className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                    category === key 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{categoryData.icon}</span>
                    <div>
                      <div className="font-medium">{categoryData.name}</div>
                      <div className="text-xs opacity-75">{categoryData.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Modes */}
        {!isActive && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => start(TIMER_PRESETS.flow.focus, 'flow')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              🌊 Flow Mode
            </button>
            <button
              onClick={() => start(TIMER_PRESETS[preset].focus, 'quantum')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              ⚡ Quantum Mode
            </button>
          </div>
        )}

        {/* Gesture Mode Toggle */}
        <div className="flex justify-between items-center text-sm">
          <button
            onClick={() => setGestureMode(!gestureMode)}
            className={`py-1 px-3 rounded-full transition-colors ${
              gestureMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {gestureMode ? '👋 Gestures On' : '✋ Gestures Off'}
          </button>
          
          {lastGesture && (
            <div className="text-gray-400">
              Last: {lastGesture}
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 text-center">
            <div className="mb-1">Shortcuts: Space (start/pause) • Esc (stop) • F (flow) • Q (quantum)</div>
            <div>1-5 (presets) • ← → (change preset)</div>
          </div>
        </div>
      </div>

      {/* Gesture Instructions Overlay */}
      {gestureMode && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="glass-panel rounded-lg p-3 text-xs text-gray-300 whitespace-nowrap">
            <div>Tap: Play/Pause • Swipe ↑: Flow • Swipe ↓: Stop</div>
            <div>Swipe ←→: Change Preset • Pinch/Spread: Adjust Time</div>
          </div>
        </div>
      )}
    </div>
  )
}