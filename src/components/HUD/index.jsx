import { useState, useEffect } from 'react'
import TimerDisplay from './TimerDisplay'
import StatsPanel from './StatsPanel'
import NavigationCompass from './NavigationCompass'
import NotificationStack from './NotificationStack'
import AchievementTracker from './AchievementTracker'
import QuickActions from './QuickActions'
import { usePortalStore } from '../../systems/PortalManager'
import { useTimerStore } from '../../stores/timerStore'
import '../../styles/glass/glassmorphism.css'
import '../../styles/typography.css'

export default function HUD() {
  const [isVisible, setIsVisible] = useState(true)
  const [activeZone, setActiveZone] = useState(null)
  const [hudOpacity, setHudOpacity] = useState(1)
  
  const { currentPortal, isNavigating } = usePortalStore()
  const { timerState } = useTimerStore()
  
  // Auto-hide HUD during navigation or when in focused mode
  useEffect(() => {
    if (isNavigating || (timerState === 'focus' && Date.now() % 30000 < 1000)) {
      setHudOpacity(0.3)
    } else {
      setHudOpacity(1)
    }
  }, [isNavigating, timerState])
  
  // HUD zones configuration
  const hudZones = {
    topBar: {
      component: <TopBar />,
      position: 'fixed top-4 left-4 right-4',
      layer: 'glass-panel--layer-200'
    },
    leftPanel: {
      component: <LeftPanel />,
      position: 'fixed left-4 top-1/2 -translate-y-1/2',
      layer: 'glass-panel--layer-200'
    },
    rightPanel: {
      component: <RightPanel />,
      position: 'fixed right-4 top-1/2 -translate-y-1/2',
      layer: 'glass-panel--layer-200'
    },
    bottomBar: {
      component: <BottomBar />,
      position: 'fixed bottom-4 left-1/2 -translate-x-1/2',
      layer: 'glass-panel--layer-300'
    },
    corners: {
      component: <CornerWidgets />,
      position: 'fixed',
      layer: 'glass-panel--layer-100'
    }
  }
  
  if (!isVisible) return null
  
  return (
    <div 
      className="hud-container pointer-events-none"
      style={{ opacity: hudOpacity, transition: 'opacity 0.3s ease' }}
    >
      {/* Top Bar - Status and notifications */}
      <div className={`${hudZones.topBar.position} pointer-events-auto`}>
        <TopBar />
      </div>
      
      {/* Left Panel - Navigation and features */}
      <div className={`${hudZones.leftPanel.position} pointer-events-auto`}>
        <LeftPanel onZoneEnter={() => setActiveZone('left')} />
      </div>
      
      {/* Right Panel - Stats and progress */}
      <div className={`${hudZones.rightPanel.position} pointer-events-auto`}>
        <RightPanel onZoneEnter={() => setActiveZone('right')} />
      </div>
      
      {/* Bottom Bar - Main timer controls */}
      <div className={`${hudZones.bottomBar.position} pointer-events-auto`}>
        <BottomBar />
      </div>
      
      {/* Corner Widgets */}
      <CornerWidgets />
      
      {/* Notification System */}
      <div className="fixed top-4 right-4 glass-panel--layer-600 pointer-events-auto">
        <NotificationStack />
      </div>
      
      {/* HUD Toggle */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 left-4 glass-button glass-button--sm text-xs opacity-50 hover:opacity-100 transition-opacity glass-panel--layer-800 pointer-events-auto"
      >
        {isVisible ? 'Hide HUD' : 'Show HUD'}
      </button>
    </div>
  )
}

// Top Bar Component - Status and quick actions
function TopBar() {
  const { currentPortal, userLevel } = usePortalStore()
  const { timerState, sessionType } = useTimerStore()
  
  return (
    <div className="glass-panel glass-panel--tertiary glass-panel--sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Current Mode Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            timerState === 'focus' ? 'bg-blue-400' :
            timerState === 'break' ? 'bg-green-400' :
            'bg-gray-400'
          }`} />
          <span className="text-ui text-primary">
            {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Mode
          </span>
        </div>
        
        {/* Portal Context */}
        {currentPortal && (
          <div className="text-caption text-tertiary">
            Portal: {currentPortal}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* User Level */}
        <div className="text-ui text-accent">
          Level {userLevel}
        </div>
        
        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}

// Left Panel - Navigation and features menu
function LeftPanel({ onZoneEnter }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div 
      className="flex flex-col gap-4"
      onMouseEnter={() => {
        setIsExpanded(true)
        onZoneEnter?.()
      }}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Navigation Compass */}
      <div className={`glass-panel glass-panel--secondary transition-all duration-300 ${
        isExpanded ? 'glass-panel--md' : 'glass-panel--sm'
      }`}>
        <NavigationCompass expanded={isExpanded} />
      </div>
      
      {/* Feature Menu */}
      {isExpanded && (
        <div className="glass-panel glass-panel--secondary glass-panel--md">
          <FeatureMenu />
        </div>
      )}
    </div>
  )
}

// Right Panel - Stats and achievements
function RightPanel({ onZoneEnter }) {
  const [activeTab, setActiveTab] = useState('stats')
  
  return (
    <div 
      className="glass-panel glass-panel--secondary glass-panel--md w-80"
      onMouseEnter={onZoneEnter}
    >
      {/* Tab Navigation */}
      <div className="flex mb-4 border-b border-white border-opacity-10">
        {['stats', 'achievements', 'progress'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-ui transition-colors ${
              activeTab === tab 
                ? 'text-accent border-b-2 border-accent' 
                : 'text-tertiary hover:text-secondary'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="h-64 overflow-y-auto">
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'achievements' && <AchievementTracker />}
        {activeTab === 'progress' && <ProgressTracker />}
      </div>
    </div>
  )
}

// Bottom Bar - Main timer controls
function BottomBar() {
  return (
    <div className="glass-panel glass-panel--primary glass-panel--lg">
      <TimerDisplay />
    </div>
  )
}

// Corner Widgets - Contextual mini-tools
function CornerWidgets() {
  return (
    <>
      {/* Top Left - Mini Map */}
      <div className="fixed top-20 left-4 glass-panel--layer-100 pointer-events-auto">
        <MiniMap />
      </div>
      
      {/* Top Right - Performance Monitor */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 glass-panel--layer-100 pointer-events-auto">
          <PerformanceMonitor />
        </div>
      )}
      
      {/* Bottom Left - Session History */}
      <div className="fixed bottom-20 left-4 glass-panel--layer-100 pointer-events-auto">
        <SessionHistory />
      </div>
      
      {/* Bottom Right - Portal Discovery */}
      <div className="fixed bottom-20 right-4 glass-panel--layer-100 pointer-events-auto">
        <PortalDiscovery />
      </div>
    </>
  )
}

// Feature Menu Component
function FeatureMenu() {
  const { portals, navigateToPortal } = usePortalStore()
  
  const availableFeatures = Array.from(portals.values())
    .filter(portal => portal.unlocked)
    .slice(0, 6) // Show top 6 features
  
  return (
    <div className="space-y-2">
      <div className="text-label text-tertiary mb-3">Features</div>
      {availableFeatures.map(portal => (
        <button
          key={portal.id}
          onClick={() => navigateToPortal(portal.id)}
          className="w-full text-left p-3 rounded-lg glass-panel--tertiary glass-panel--hover transition-all"
        >
          <div className="text-ui text-primary">{portal.label}</div>
          <div className="text-caption text-tertiary mt-1">
            {portal.description}
          </div>
        </button>
      ))}
    </div>
  )
}

// Progress Tracker Component
function ProgressTracker() {
  const { userLevel } = usePortalStore()
  const { completedSessions, totalFocusTime } = useTimerStore()
  
  const progressItems = [
    {
      label: 'Focus Master',
      current: completedSessions,
      target: userLevel * 10,
      color: 'bg-blue-500'
    },
    {
      label: 'Time Warrior', 
      current: Math.floor(totalFocusTime / 3600),
      target: userLevel * 5,
      color: 'bg-green-500'
    },
    {
      label: 'Portal Explorer',
      current: 3, // Number of discovered portals
      target: 7,
      color: 'bg-purple-500'
    }
  ]
  
  return (
    <div className="space-y-4">
      {progressItems.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-ui text-secondary">{item.label}</span>
            <span className="text-caption text-tertiary">
              {item.current}/{item.target}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${item.color} transition-all duration-500`}
              style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Mini Map Component
function MiniMap() {
  const [isVisible, setIsVisible] = useState(false)
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="glass-panel glass-panel--tertiary glass-panel--sm p-2 text-caption text-tertiary hover:text-secondary transition-colors"
      >
        Map
      </button>
    )
  }
  
  return (
    <div className="glass-panel glass-panel--secondary glass-panel--md w-48 h-48">
      <div className="flex justify-between items-center mb-2">
        <span className="text-ui text-primary">Navigation</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-caption text-tertiary hover:text-secondary"
        >
          ✕
        </button>
      </div>
      <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-caption text-tertiary">3D Mini-map</span>
      </div>
    </div>
  )
}

// Performance Monitor Component
function PerformanceMonitor() {
  const [fps, setFps] = useState(60)
  const [isVisible, setIsVisible] = useState(false)
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="glass-panel glass-panel--tertiary glass-panel--sm p-2 text-caption text-tertiary hover:text-secondary transition-colors"
      >
        FPS
      </button>
    )
  }
  
  return (
    <div className="glass-panel glass-panel--secondary glass-panel--sm">
      <div className="flex justify-between items-center">
        <span className="text-caption text-tertiary">FPS: {fps}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-caption text-tertiary hover:text-secondary"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Session History Component
function SessionHistory() {
  const [isVisible, setIsVisible] = useState(false)
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="glass-panel glass-panel--tertiary glass-panel--sm p-2 text-caption text-tertiary hover:text-secondary transition-colors"
      >
        History
      </button>
    )
  }
  
  return (
    <div className="glass-panel glass-panel--secondary glass-panel--md w-64">
      <div className="flex justify-between items-center mb-2">
        <span className="text-ui text-primary">Recent Sessions</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-caption text-tertiary hover:text-secondary"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-2 glass-panel--tertiary rounded">
            <div className="text-small text-secondary">Focus Session {i}</div>
            <div className="text-caption text-tertiary">25 min • Completed</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Portal Discovery Component
function PortalDiscovery() {
  const [isVisible, setIsVisible] = useState(false)
  const { discoveredPortals } = usePortalStore()
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="glass-panel glass-panel--tertiary glass-panel--sm p-2 text-caption text-tertiary hover:text-secondary transition-colors"
      >
        Portals ({discoveredPortals.size})
      </button>
    )
  }
  
  return (
    <div className="glass-panel glass-panel--secondary glass-panel--md w-64">
      <div className="flex justify-between items-center mb-2">
        <span className="text-ui text-primary">Portal Discovery</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-caption text-tertiary hover:text-secondary"
        >
          ✕
        </button>
      </div>
      <div className="text-small text-secondary">
        {discoveredPortals.size} of 7 portals discovered
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
        <div
          className="h-1 rounded-full bg-purple-500 transition-all duration-500"
          style={{ width: `${(discoveredPortals.size / 7) * 100}%` }}
        />
      </div>
    </div>
  )
}