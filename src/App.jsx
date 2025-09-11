import { Suspense } from 'react'
import Scene from './components/sphere/Scene'
import TimerControls from './components/ui/TimerControls'
import NotificationManager, { ToastNotification } from './components/ui/NotificationManager'
import ErrorBoundary from './utils/errorBoundary'
import { performanceMonitor } from './utils/performance'

// Initialize performance monitoring
performanceMonitor.initialize(process.env.NODE_ENV === 'development')

function App() {
  return (
    <ErrorBoundary>
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-xl font-space">
              Initializing Chronosphere...
            </div>
          </div>
        }>
          <Scene />
        </Suspense>
        
        {/* Timer Controls UI */}
        <TimerControls />
        
        {/* Notification System */}
        <NotificationManager />
        <ToastNotification />
      </div>
    </ErrorBoundary>
  )
}

export default App
