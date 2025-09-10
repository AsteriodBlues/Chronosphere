// Worker manager for handling Web Workers efficiently

class WorkerManager {
  constructor() {
    this.workers = new Map()
    this.workerPool = new Map()
    this.maxWorkers = navigator.hardwareConcurrency || 4
  }

  // Create a worker with automatic fallback
  createWorker(name, workerScript, options = {}) {
    try {
      let worker
      
      // Try to create worker from module
      if (workerScript.startsWith('/') || workerScript.startsWith('http')) {
        worker = new Worker(workerScript, { type: 'module', ...options })
      } else {
        // Create worker from inline script
        const blob = new Blob([workerScript], { type: 'application/javascript' })
        const workerUrl = URL.createObjectURL(blob)
        worker = new Worker(workerUrl, options)
      }
      
      // Setup error handling
      worker.onerror = (error) => {
        console.error(`Worker ${name} error:`, error)
        this.handleWorkerError(name, error)
      }
      
      worker.onmessageerror = (error) => {
        console.error(`Worker ${name} message error:`, error)
      }
      
      this.workers.set(name, {
        worker,
        name,
        created: Date.now(),
        messageCount: 0,
        lastUsed: Date.now()
      })
      
      return worker
    } catch (error) {
      console.error(`Failed to create worker ${name}:`, error)
      return null
    }
  }

  // Get existing worker or create new one
  getWorker(name, workerScript, options = {}) {
    const existing = this.workers.get(name)
    
    if (existing && existing.worker) {
      existing.lastUsed = Date.now()
      return existing.worker
    }
    
    return this.createWorker(name, workerScript, options)
  }

  // Send message to worker with promise-based response
  sendMessage(workerName, message, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const workerData = this.workers.get(workerName)
      
      if (!workerData || !workerData.worker) {
        reject(new Error(`Worker ${workerName} not found`))
        return
      }
      
      const messageId = Date.now() + Math.random()
      const timeoutId = setTimeout(() => {
        reject(new Error(`Worker ${workerName} timeout`))
      }, timeout)
      
      const handleMessage = (event) => {
        if (event.data.messageId === messageId) {
          clearTimeout(timeoutId)
          workerData.worker.removeEventListener('message', handleMessage)
          resolve(event.data)
        }
      }
      
      workerData.worker.addEventListener('message', handleMessage)
      workerData.worker.postMessage({ ...message, messageId })
      workerData.messageCount++
    })
  }

  // Broadcast message to all workers
  broadcast(message) {
    const promises = []
    
    this.workers.forEach((workerData, name) => {
      if (workerData.worker) {
        promises.push(
          this.sendMessage(name, message).catch(error => {
            console.warn(`Broadcast to ${name} failed:`, error)
            return null
          })
        )
      }
    })
    
    return Promise.allSettled(promises)
  }

  // Terminate worker
  terminateWorker(name) {
    const workerData = this.workers.get(name)
    
    if (workerData && workerData.worker) {
      workerData.worker.terminate()
      this.workers.delete(name)
      return true
    }
    
    return false
  }

  // Terminate all workers
  terminateAll() {
    this.workers.forEach((workerData, name) => {
      if (workerData.worker) {
        workerData.worker.terminate()
      }
    })
    
    this.workers.clear()
  }

  // Handle worker errors
  handleWorkerError(name, error) {
    const workerData = this.workers.get(name)
    
    if (workerData) {
      // Attempt to restart worker
      this.terminateWorker(name)
      
      // Could implement retry logic here
      console.log(`Worker ${name} will need to be recreated`)
    }
  }

  // Clean up unused workers
  cleanup(maxAge = 300000) { // 5 minutes
    const now = Date.now()
    
    this.workers.forEach((workerData, name) => {
      if (now - workerData.lastUsed > maxAge) {
        console.log(`Cleaning up unused worker: ${name}`)
        this.terminateWorker(name)
      }
    })
  }

  // Get worker statistics
  getStats() {
    const stats = {
      totalWorkers: this.workers.size,
      workers: []
    }
    
    this.workers.forEach((workerData, name) => {
      stats.workers.push({
        name,
        messageCount: workerData.messageCount,
        age: Date.now() - workerData.created,
        lastUsed: Date.now() - workerData.lastUsed
      })
    })
    
    return stats
  }
}

// Sphere worker helper
export class SphereWorkerManager {
  constructor() {
    this.workerManager = new WorkerManager()
    this.workerName = 'sphereWorker'
    this.isInitialized = false
    this.callbacks = new Map()
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      // Import the worker script
      const workerUrl = new URL('../workers/sphereWorker.js', import.meta.url)
      const worker = this.workerManager.createWorker(this.workerName, workerUrl.href)
      
      if (!worker) {
        throw new Error('Failed to create sphere worker')
      }

      // Setup message handling
      worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data)
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize sphere worker:', error)
      throw error
    }
  }

  handleWorkerMessage(data) {
    const { type } = data
    
    if (this.callbacks.has(type)) {
      const callback = this.callbacks.get(type)
      callback(data)
    }
  }

  // Register callback for worker messages
  on(eventType, callback) {
    this.callbacks.set(eventType, callback)
    
    return () => {
      this.callbacks.delete(eventType)
    }
  }

  // Start particle system
  async startParticleSystem(config) {
    if (!this.isInitialized) await this.initialize()
    
    const worker = this.workerManager.getWorker(this.workerName)
    worker.postMessage({
      type: 'start',
      data: config
    })
  }

  // Stop particle system
  async stopParticleSystem() {
    if (!this.isInitialized) return
    
    const worker = this.workerManager.getWorker(this.workerName)
    worker.postMessage({ type: 'stop' })
  }

  // Update configuration
  async updateConfig(config) {
    if (!this.isInitialized) return
    
    const worker = this.workerManager.getWorker(this.workerName)
    worker.postMessage({
      type: 'updateConfig',
      data: config
    })
  }

  // Update sphere state
  async updateSphereState(state) {
    if (!this.isInitialized) return
    
    const worker = this.workerManager.getWorker(this.workerName)
    worker.postMessage({
      type: 'updateSphereState',
      data: state
    })
  }

  // Calculate sphere deformation
  async calculateDeformation(mousePosition, sphereRadius) {
    if (!this.isInitialized) await this.initialize()
    
    return this.workerManager.sendMessage(this.workerName, {
      type: 'calculateDeformation',
      data: { mousePosition, sphereRadius }
    })
  }

  // Trigger effects
  async triggerExplosion() {
    if (!this.isInitialized) return
    
    const worker = this.workerManager.getWorker(this.workerName)
    worker.postMessage({ type: 'explosion' })
  }

  async triggerReformation() {
    if (!this.isInitialized) return
    
    const worker = this.workerManager.getWorker(this.workerName)
    worker.postMessage({ type: 'reformation' })
  }

  async triggerBreathing() {
    if (!this.isInitialized) return
    
    const worker = this.workerManager.getWorker(this.workerName)
    worker.postMessage({ type: 'breathing' })
  }

  // Cleanup
  destroy() {
    this.workerManager.terminateWorker(this.workerName)
    this.callbacks.clear()
    this.isInitialized = false
  }
}

// Global worker manager instance
export const workerManager = new WorkerManager()

// React hook for using workers
export const useWorker = (workerName, workerScript, options = {}) => {
  const [worker, setWorker] = React.useState(null)
  const [isReady, setIsReady] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    try {
      const w = workerManager.getWorker(workerName, workerScript, options)
      
      if (w) {
        setWorker(w)
        setIsReady(true)
        setError(null)
      } else {
        setError(new Error('Failed to create worker'))
      }
    } catch (err) {
      setError(err)
      setIsReady(false)
    }

    return () => {
      // Cleanup handled by worker manager
    }
  }, [workerName, workerScript])

  const sendMessage = React.useCallback((message, timeout) => {
    if (!isReady) return Promise.reject(new Error('Worker not ready'))
    return workerManager.sendMessage(workerName, message, timeout)
  }, [workerName, isReady])

  return { worker, isReady, error, sendMessage }
}

// Cleanup function for page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    workerManager.terminateAll()
  })
  
  // Periodic cleanup
  setInterval(() => {
    workerManager.cleanup()
  }, 300000) // 5 minutes
}

export default WorkerManager