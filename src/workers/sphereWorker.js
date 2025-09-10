// Web Worker for heavy sphere calculations
// This runs in a separate thread to avoid blocking the main UI

let isRunning = false
let particleData = []
let sphereConfig = {
  particleCount: 1000,
  radius: 2,
  breathingRate: 4000,
  explosionForce: 10,
  gravityStrength: 0.5
}

// Particle system calculations
class ParticleSystem {
  constructor(config) {
    this.config = config
    this.particles = []
    this.time = 0
    this.breathingPhase = 0
    
    this.initializeParticles()
  }
  
  initializeParticles() {
    this.particles = []
    
    for (let i = 0; i < this.config.particleCount; i++) {
      // Create particle on sphere surface using spherical coordinates
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      const x = this.config.radius * Math.sin(phi) * Math.cos(theta)
      const y = this.config.radius * Math.sin(phi) * Math.sin(theta)
      const z = this.config.radius * Math.cos(phi)
      
      this.particles.push({
        id: i,
        position: { x, y, z },
        originalPosition: { x, y, z },
        velocity: { x: 0, y: 0, z: 0 },
        acceleration: { x: 0, y: 0, z: 0 },
        life: 1.0,
        size: Math.random() * 0.1 + 0.05,
        color: {
          r: Math.random() * 0.3 + 0.7,
          g: Math.random() * 0.3 + 0.7,
          b: Math.random() * 0.3 + 0.7,
          a: Math.random() * 0.5 + 0.5
        },
        phase: Math.random() * Math.PI * 2,
        frequency: Math.random() * 0.1 + 0.05
      })
    }
  }
  
  update(deltaTime, sphereState) {
    this.time += deltaTime
    this.breathingPhase = (this.time / this.config.breathingRate) * Math.PI * 2
    
    if (sphereState.exploding) {
      this.updateExplosion(deltaTime)
    } else if (sphereState.reforming) {
      this.updateReformation(deltaTime)
    } else if (sphereState.breathing) {
      this.updateBreathing(deltaTime)
    } else {
      this.updateStable(deltaTime)
    }
    
    // Apply universal forces
    this.applyForces(deltaTime)
    
    // Update positions
    this.updatePositions(deltaTime)
  }
  
  updateBreathing(deltaTime) {
    const breathingMultiplier = 1 + Math.sin(this.breathingPhase) * 0.1
    
    this.particles.forEach(particle => {
      // Breathing effect - particles move radially
      const distance = Math.sqrt(
        particle.originalPosition.x ** 2 + 
        particle.originalPosition.y ** 2 + 
        particle.originalPosition.z ** 2
      )
      
      if (distance > 0) {
        const normalizedX = particle.originalPosition.x / distance
        const normalizedY = particle.originalPosition.y / distance
        const normalizedZ = particle.originalPosition.z / distance
        
        particle.position.x = particle.originalPosition.x * breathingMultiplier
        particle.position.y = particle.originalPosition.y * breathingMultiplier
        particle.position.z = particle.originalPosition.z * breathingMultiplier
        
        // Add subtle floating motion
        particle.position.x += Math.sin(this.time * particle.frequency + particle.phase) * 0.05
        particle.position.y += Math.cos(this.time * particle.frequency * 1.1 + particle.phase) * 0.05
        particle.position.z += Math.sin(this.time * particle.frequency * 0.9 + particle.phase) * 0.05
      }
    })
  }
  
  updateExplosion(deltaTime) {
    this.particles.forEach(particle => {
      // Calculate explosion force from center
      const distance = Math.sqrt(
        particle.position.x ** 2 + 
        particle.position.y ** 2 + 
        particle.position.z ** 2
      )
      
      if (distance > 0) {
        const force = this.config.explosionForce / (distance + 0.1)
        const normalizedX = particle.position.x / distance
        const normalizedY = particle.position.y / distance
        const normalizedZ = particle.position.z / distance
        
        particle.acceleration.x += normalizedX * force
        particle.acceleration.y += normalizedY * force
        particle.acceleration.z += normalizedZ * force
        
        // Add randomness to explosion
        particle.acceleration.x += (Math.random() - 0.5) * 2
        particle.acceleration.y += (Math.random() - 0.5) * 2
        particle.acceleration.z += (Math.random() - 0.5) * 2
        
        // Fade out particles
        particle.life -= deltaTime * 0.0005
        particle.color.a = particle.life
      }
    })
  }
  
  updateReformation(deltaTime) {
    this.particles.forEach(particle => {
      // Calculate attraction force back to original position
      const dx = particle.originalPosition.x - particle.position.x
      const dy = particle.originalPosition.y - particle.position.y
      const dz = particle.originalPosition.z - particle.position.z
      
      const distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2)
      
      if (distance > 0.1) {
        const force = this.config.gravityStrength * distance
        
        particle.acceleration.x += (dx / distance) * force
        particle.acceleration.y += (dy / distance) * force
        particle.acceleration.z += (dz / distance) * force
      }
      
      // Restore life
      particle.life = Math.min(1.0, particle.life + deltaTime * 0.001)
      particle.color.a = particle.life * (Math.random() * 0.5 + 0.5)
    })
  }
  
  updateStable(deltaTime) {
    // Stable state with minimal movement
    this.particles.forEach(particle => {
      particle.position.x = particle.originalPosition.x + Math.sin(this.time * 0.001 + particle.phase) * 0.02
      particle.position.y = particle.originalPosition.y + Math.cos(this.time * 0.001 + particle.phase) * 0.02
      particle.position.z = particle.originalPosition.z + Math.sin(this.time * 0.0015 + particle.phase) * 0.02
    })
  }
  
  applyForces(deltaTime) {
    this.particles.forEach(particle => {
      // Apply velocity damping
      particle.velocity.x *= 0.98
      particle.velocity.y *= 0.98
      particle.velocity.z *= 0.98
      
      // Apply acceleration damping
      particle.acceleration.x *= 0.9
      particle.acceleration.y *= 0.9
      particle.acceleration.z *= 0.9
    })
  }
  
  updatePositions(deltaTime) {
    this.particles.forEach(particle => {
      // Update velocity
      particle.velocity.x += particle.acceleration.x * deltaTime
      particle.velocity.y += particle.acceleration.y * deltaTime
      particle.velocity.z += particle.acceleration.z * deltaTime
      
      // Update position
      particle.position.x += particle.velocity.x * deltaTime
      particle.position.y += particle.velocity.y * deltaTime
      particle.position.z += particle.velocity.z * deltaTime
      
      // Reset acceleration
      particle.acceleration.x = 0
      particle.acceleration.y = 0
      particle.acceleration.z = 0
    })
  }
  
  getParticleData() {
    return this.particles.map(particle => ({
      position: particle.position,
      color: particle.color,
      size: particle.size,
      life: particle.life
    }))
  }
}

let particleSystem = null
let lastTime = 0

// Animation loop
function animate(currentTime) {
  if (!isRunning) return
  
  const deltaTime = currentTime - lastTime
  lastTime = currentTime
  
  if (particleSystem) {
    particleSystem.update(deltaTime, sphereConfig.state || {})
    
    // Send particle data back to main thread
    self.postMessage({
      type: 'particleUpdate',
      data: particleSystem.getParticleData(),
      timestamp: currentTime
    })
  }
  
  // Continue animation
  setTimeout(() => animate(performance.now()), 16) // ~60fps
}

// Physics calculations for sphere deformation
function calculateSphereDeformation(mousePosition, sphereRadius) {
  const deformationRadius = 0.5
  const deformationStrength = 0.2
  
  const deformations = []
  
  // Calculate deformation for each vertex
  for (let i = 0; i < 360; i += 10) {
    for (let j = 0; j < 180; j += 10) {
      const theta = (i * Math.PI) / 180
      const phi = (j * Math.PI) / 180
      
      const x = sphereRadius * Math.sin(phi) * Math.cos(theta)
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta)
      const z = sphereRadius * Math.cos(phi)
      
      // Calculate distance to mouse interaction point
      const distance = Math.sqrt(
        (x - mousePosition.x) ** 2 + 
        (y - mousePosition.y) ** 2 + 
        (z - mousePosition.z) ** 2
      )
      
      if (distance < deformationRadius) {
        const influence = 1 - (distance / deformationRadius)
        const deformation = influence * deformationStrength
        
        deformations.push({
          vertex: { x, y, z },
          deformation,
          influence
        })
      }
    }
  }
  
  return deformations
}

// Message handlers
self.onmessage = function(e) {
  const { type, data } = e.data
  
  switch (type) {
    case 'start':
      isRunning = true
      sphereConfig = { ...sphereConfig, ...data }
      particleSystem = new ParticleSystem(sphereConfig)
      lastTime = performance.now()
      animate(lastTime)
      self.postMessage({ type: 'started' })
      break
      
    case 'stop':
      isRunning = false
      self.postMessage({ type: 'stopped' })
      break
      
    case 'updateConfig':
      sphereConfig = { ...sphereConfig, ...data }
      if (particleSystem) {
        particleSystem.config = sphereConfig
        if (data.particleCount !== particleSystem.particles.length) {
          particleSystem.initializeParticles()
        }
      }
      break
      
    case 'updateSphereState':
      sphereConfig.state = data
      break
      
    case 'calculateDeformation':
      const deformations = calculateSphereDeformation(data.mousePosition, data.sphereRadius)
      self.postMessage({
        type: 'deformationResult',
        data: deformations
      })
      break
      
    case 'explosion':
      if (particleSystem) {
        sphereConfig.state = { exploding: true, reforming: false, breathing: false }
      }
      break
      
    case 'reformation':
      if (particleSystem) {
        sphereConfig.state = { exploding: false, reforming: true, breathing: false }
      }
      break
      
    case 'breathing':
      if (particleSystem) {
        sphereConfig.state = { exploding: false, reforming: false, breathing: true }
      }
      break
      
    default:
      console.warn('Unknown message type:', type)
  }
}