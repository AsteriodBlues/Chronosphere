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

        {/* Brand Identity - Bottom Center */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl px-6 py-3 border border-white/20 shadow-2xl">
            <div className="text-center">
              <h1 className="text-white/90 text-lg font-bold tracking-[0.15em] mb-1">
                CHRONO.SPHERE
              </h1>
              <p className="text-white/60 text-xs font-medium">
                Advanced Focus System
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
