import Stats from 'stats.js'

class PerformanceMonitor {
  constructor() {
    this.stats = null
    this.isMonitoring = false
    this.metrics = {
      fps: [],
      memory: [],
      frameTime: [],
      renderTime: []
    }
    this.observers = []
    this.warningThresholds = {
      fps: 30,
      memory: 100 * 1024 * 1024, // 100MB
      frameTime: 33.33 // 30fps = 33.33ms per frame
    }
  }

  initialize(showStats = false) {
    // Initialize Stats.js
    this.stats = new Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    
    if (showStats) {
      this.stats.dom.style.position = 'fixed'
      this.stats.dom.style.top = '0'
      this.stats.dom.style.left = '0'
      this.stats.dom.style.zIndex = '10000'
      document.body.appendChild(this.stats.dom)
    }

    // Setup Performance Observer for detailed metrics
    this.setupPerformanceObserver()

    // Start monitoring
    this.startMonitoring()

    return this
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        // Monitor navigation timing
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('navigation', {
              type: entry.entryType,
              duration: entry.duration,
              startTime: entry.startTime
            })
          })
        })
        navObserver.observe({ entryTypes: ['navigation'] })

        // Monitor resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.duration > 100) { // Only log slow resources
              this.recordMetric('resource', {
                name: entry.name,
                duration: entry.duration,
                size: entry.transferSize
              })
            }
          })
        })
        resourceObserver.observe({ entryTypes: ['resource'] })

        // Monitor long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('longTask', {
              duration: entry.duration,
              startTime: entry.startTime
            })
            this.notifyObservers('longTask', entry)
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })

      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error)
      }
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringLoop()
  }

  stopMonitoring() {
    this.isMonitoring = false
  }

  monitoringLoop() {
    if (!this.isMonitoring) return

    this.stats?.begin()

    // Record current metrics
    this.recordCurrentMetrics()

    this.stats?.end()

    // Continue monitoring
    requestAnimationFrame(() => this.monitoringLoop())
  }

  recordCurrentMetrics() {
    const now = performance.now()
    
    // FPS calculation
    if (this.lastFrameTime) {
      const frameDelta = now - this.lastFrameTime
      const fps = 1000 / frameDelta
      this.recordMetric('fps', fps)
    }
    this.lastFrameTime = now

    // Memory usage (if available)
    if (performance.memory) {
      this.recordMetric('memory', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      })
    }

    // Check for performance warnings
    this.checkPerformanceWarnings()
  }

  recordMetric(type, value) {
    if (!this.metrics[type]) {
      this.metrics[type] = []
    }

    const metric = {
      timestamp: performance.now(),
      value
    }

    this.metrics[type].push(metric)

    // Keep only last 100 measurements
    if (this.metrics[type].length > 100) {
      this.metrics[type].shift()
    }
  }

  checkPerformanceWarnings() {
    const recentFps = this.getRecentAverage('fps', 10)
    const recentMemory = this.getRecentValue('memory')

    // FPS warning
    if (recentFps && recentFps < this.warningThresholds.fps) {
      this.notifyObservers('lowFps', { fps: recentFps })
    }

    // Memory warning
    if (recentMemory && recentMemory.used > this.warningThresholds.memory) {
      this.notifyObservers('highMemory', { memory: recentMemory })
    }
  }

  getRecentAverage(metricType, count = 10) {
    const metrics = this.metrics[metricType]
    if (!metrics || metrics.length === 0) return null

    const recentMetrics = metrics.slice(-count)
    const sum = recentMetrics.reduce((acc, metric) => {
      return acc + (typeof metric.value === 'number' ? metric.value : 0)
    }, 0)

    return sum / recentMetrics.length
  }

  getRecentValue(metricType) {
    const metrics = this.metrics[metricType]
    if (!metrics || metrics.length === 0) return null

    return metrics[metrics.length - 1].value
  }

  getMetrics() {
    return {
      ...this.metrics,
      summary: {
        avgFps: this.getRecentAverage('fps', 30),
        currentMemory: this.getRecentValue('memory'),
        totalSamples: Object.values(this.metrics).reduce((sum, arr) => sum + arr.length, 0)
      }
    }
  }

  // Observer pattern for performance events
  addObserver(callback) {
    this.observers.push(callback)
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback)
    }
  }

  notifyObservers(event, data) {
    this.observers.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Performance observer error:', error)
      }
    })
  }

  // Automatic quality adjustment
  getQualityRecommendation() {
    const avgFps = this.getRecentAverage('fps', 30)
    const memory = this.getRecentValue('memory')

    if (!avgFps) return 'medium' // Default if no data

    if (avgFps < 20) return 'potato'
    if (avgFps < 30) return 'low'
    if (avgFps < 45) return 'medium'
    if (avgFps < 55) return 'high'
    return 'ultra'
  }

  // Performance timing utilities
  startTiming(label) {
    performance.mark(`${label}-start`)
  }

  endTiming(label) {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const measure = performance.getEntriesByName(label)[0]
    if (measure) {
      this.recordMetric('customTiming', {
        label,
        duration: measure.duration
      })
      return measure.duration
    }
    return 0
  }

  // Resource monitoring
  monitorResourceLoading() {
    const entries = performance.getEntriesByType('resource')
    const slowResources = entries.filter(entry => entry.duration > 1000)
    
    if (slowResources.length > 0) {
      this.notifyObservers('slowResources', slowResources)
    }

    return {
      total: entries.length,
      slow: slowResources.length,
      totalTime: entries.reduce((sum, entry) => sum + entry.duration, 0)
    }
  }

  // Memory leak detection
  detectMemoryLeaks() {
    if (!performance.memory) return null

    const memoryHistory = this.metrics.memory.slice(-20) // Last 20 measurements
    if (memoryHistory.length < 20) return null

    // Check if memory is consistently increasing
    const trend = this.calculateTrend(memoryHistory.map(m => m.value.used))
    
    if (trend > 1024 * 1024) { // 1MB increase trend
      this.notifyObservers('memoryLeak', { trend, current: memoryHistory[memoryHistory.length - 1].value })
      return true
    }

    return false
  }

  calculateTrend(values) {
    if (values.length < 2) return 0

    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0)
    const sumX2 = values.reduce((sum, _, i) => sum + (i * i), 0)

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  // Clean up
  destroy() {
    this.stopMonitoring()
    
    if (this.stats?.dom?.parentNode) {
      this.stats.dom.parentNode.removeChild(this.stats.dom)
    }
    
    this.observers = []
    this.metrics = { fps: [], memory: [], frameTime: [], renderTime: [] }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState(null)
  const [warnings, setWarnings] = React.useState([])

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.addObserver((event, data) => {
      if (event === 'lowFps' || event === 'highMemory' || event === 'memoryLeak') {
        setWarnings(prev => [...prev.slice(-4), { event, data, timestamp: Date.now() }])
      }
    })

    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics())
    }

    const interval = setInterval(updateMetrics, 1000)
    updateMetrics()

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  return { metrics, warnings }
}

// Utility functions
export const measureAsync = async (label, asyncFn) => {
  performanceMonitor.startTiming(label)
  try {
    const result = await asyncFn()
    return result
  } finally {
    performanceMonitor.endTiming(label)
  }
}

export const measureSync = (label, syncFn) => {
  performanceMonitor.startTiming(label)
  try {
    return syncFn()
  } finally {
    performanceMonitor.endTiming(label)
  }
}

export default PerformanceMonitor