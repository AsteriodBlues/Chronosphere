import * as THREE from 'three'
import { SpatialMath, CameraPath } from '../utils/spatial/spatialMath'

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera
    this.domElement = domElement
    
    // Navigation modes
    this.modes = {
      ORBIT: 'orbit',
      SURFACE: 'surface',
      PORTAL: 'portal',
      FREE: 'free',
      CINEMATIC: 'cinematic'
    }
    
    this.currentMode = this.modes.ORBIT
    
    // Control state
    this.enabled = true
    this.isTransitioning = false
    
    // Orbit controls
    this.sphereCenter = new THREE.Vector3(0, 0, 0)
    this.orbitRadius = 8
    this.minDistance = 3
    this.maxDistance = 20
    this.orbitSpeed = 1.0
    
    // Current rotation state
    this.sphericalDelta = new THREE.Spherical()
    this.spherical = new THREE.Spherical()
    this.spherical.setFromVector3(camera.position.clone().sub(this.sphereCenter))
    
    // Damping
    this.enableDamping = true
    this.dampingFactor = 0.05
    
    // Auto rotation
    this.autoRotate = false
    this.autoRotateSpeed = 2.0
    
    // Portal targeting
    this.targetPortal = null
    this.portalLockDistance = 4
    
    // Surface navigation
    this.surfaceHeight = 2.5
    this.surfaceSpeed = 2.0
    
    // Transition system
    this.transitionQueue = []
    this.currentTransition = null
    
    // Input state
    this.mouseState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0
    }
    
    this.keys = {
      LEFT: false,
      RIGHT: false,
      UP: false,
      DOWN: false,
      FORWARD: false,
      BACKWARD: false
    }
    
    // Momentum physics
    this.velocity = new THREE.Vector2()
    this.friction = 0.95
    this.acceleration = 0.02
    
    this.bindEvents()
  }
  
  bindEvents() {
    // Mouse events
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this))
    this.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this))
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this))
    
    // Keyboard events
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('keyup', this.onKeyUp.bind(this))
    
    // Touch events for mobile
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this))
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this))
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this))
  }
  
  // Mouse event handlers
  onMouseDown(event) {
    if (!this.enabled) return
    
    event.preventDefault()
    
    this.mouseState.isDragging = true
    this.mouseState.startX = event.clientX
    this.mouseState.startY = event.clientY
    
    // Reset velocity on new interaction
    this.velocity.set(0, 0)
  }
  
  onMouseMove(event) {
    if (!this.enabled || !this.mouseState.isDragging) return
    
    event.preventDefault()
    
    const deltaX = event.clientX - this.mouseState.startX
    const deltaY = event.clientY - this.mouseState.startY
    
    this.mouseState.deltaX = deltaX
    this.mouseState.deltaY = deltaY
    
    // Update velocity for momentum
    this.velocity.x = deltaX * 0.01
    this.velocity.y = deltaY * 0.01
    
    // Update spherical coordinates based on mode
    if (this.currentMode === this.modes.ORBIT) {
      this.updateOrbitRotation(deltaX, deltaY)
    } else if (this.currentMode === this.modes.SURFACE) {
      this.updateSurfaceMovement(deltaX, deltaY)
    }
    
    this.mouseState.startX = event.clientX
    this.mouseState.startY = event.clientY
  }
  
  onMouseUp(event) {
    if (!this.enabled) return
    
    this.mouseState.isDragging = false
    this.mouseState.deltaX = 0
    this.mouseState.deltaY = 0
  }
  
  onMouseWheel(event) {
    if (!this.enabled) return
    
    event.preventDefault()
    
    const delta = event.deltaY > 0 ? 1.1 : 0.9
    this.zoom(delta)
  }
  
  onDoubleClick(event) {
    if (!this.enabled) return
    
    // Portal approach on double click
    const mouse = new THREE.Vector2(
      (event.clientX / this.domElement.clientWidth) * 2 - 1,
      -(event.clientY / this.domElement.clientHeight) * 2 + 1
    )
    
    this.handlePortalApproach(mouse)
  }
  
  onContextMenu(event) {
    event.preventDefault()
    // Right click context navigation could be implemented here
  }
  
  // Keyboard event handlers
  onKeyDown(event) {
    if (!this.enabled) return
    
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.LEFT = true
        break
      case 'ArrowRight':
      case 'KeyD':
        this.keys.RIGHT = true
        break
      case 'ArrowUp':
      case 'KeyW':
        this.keys.UP = true
        break
      case 'ArrowDown':
      case 'KeyS':
        this.keys.DOWN = true
        break
      case 'KeyQ':
        this.keys.FORWARD = true
        break
      case 'KeyE':
        this.keys.BACKWARD = true
        break
      case 'KeyR':
        this.resetView()
        break
      case 'Space':
        event.preventDefault()
        this.toggleAutoRotate()
        break
      case 'KeyF':
        this.switchMode(this.modes.FREE)
        break
      case 'KeyO':
        this.switchMode(this.modes.ORBIT)
        break
      case 'KeyP':
        this.switchMode(this.modes.PORTAL)
        break
    }
  }
  
  onKeyUp(event) {
    if (!this.enabled) return
    
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.LEFT = false
        break
      case 'ArrowRight':
      case 'KeyD':
        this.keys.RIGHT = false
        break
      case 'ArrowUp':
      case 'KeyW':
        this.keys.UP = false
        break
      case 'ArrowDown':
      case 'KeyS':
        this.keys.DOWN = false
        break
      case 'KeyQ':
        this.keys.FORWARD = false
        break
      case 'KeyE':
        this.keys.BACKWARD = false
        break
    }
  }
  
  // Touch event handlers
  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.mouseState.startX = event.touches[0].pageX
      this.mouseState.startY = event.touches[0].pageY
      this.mouseState.isDragging = true
    }
  }
  
  onTouchMove(event) {
    event.preventDefault()
    
    if (event.touches.length === 1 && this.mouseState.isDragging) {
      const deltaX = event.touches[0].pageX - this.mouseState.startX
      const deltaY = event.touches[0].pageY - this.mouseState.startY
      
      this.updateOrbitRotation(deltaX, deltaY)
      
      this.mouseState.startX = event.touches[0].pageX
      this.mouseState.startY = event.touches[0].pageY
    }
  }
  
  onTouchEnd(event) {
    this.mouseState.isDragging = false
  }
  
  // Navigation mode methods
  switchMode(mode) {
    if (this.currentMode === mode) return
    
    this.currentMode = mode
    
    switch (mode) {
      case this.modes.ORBIT:
        this.enableOrbitMode()
        break
      case this.modes.SURFACE:
        this.enableSurfaceMode()
        break
      case this.modes.PORTAL:
        this.enablePortalMode()
        break
      case this.modes.FREE:
        this.enableFreeMode()
        break
    }
  }
  
  enableOrbitMode() {
    this.autoRotate = false
    this.spherical.setFromVector3(this.camera.position.clone().sub(this.sphereCenter))
    this.orbitRadius = this.spherical.radius
  }
  
  enableSurfaceMode() {
    this.orbitRadius = this.surfaceHeight
    this.spherical.radius = this.surfaceHeight
  }
  
  enablePortalMode() {
    // Lock onto nearest portal
    if (this.targetPortal) {
      this.transitionToPortal(this.targetPortal)
    }
  }
  
  enableFreeMode() {
    // Free movement mode - no restrictions
  }
  
  // Update methods
  updateOrbitRotation(deltaX, deltaY) {
    const sphericalDelta = this.sphericalDelta
    
    sphericalDelta.theta -= 2 * Math.PI * deltaX / this.domElement.clientHeight * this.orbitSpeed
    sphericalDelta.phi -= 2 * Math.PI * deltaY / this.domElement.clientHeight * this.orbitSpeed
    
    // Apply limits
    sphericalDelta.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalDelta.phi))
  }
  
  updateSurfaceMovement(deltaX, deltaY) {
    // Surface-relative movement
    const sphericalDelta = this.sphericalDelta
    
    sphericalDelta.theta -= deltaX * 0.005 * this.surfaceSpeed
    sphericalDelta.phi -= deltaY * 0.005 * this.surfaceSpeed
    
    // Keep on surface
    this.spherical.radius = this.surfaceHeight
  }
  
  updateKeyboardMovement(deltaTime) {
    const speed = this.surfaceSpeed * deltaTime
    
    if (this.keys.LEFT) this.sphericalDelta.theta -= speed
    if (this.keys.RIGHT) this.sphericalDelta.theta += speed
    if (this.keys.UP) this.sphericalDelta.phi -= speed
    if (this.keys.DOWN) this.sphericalDelta.phi += speed
    if (this.keys.FORWARD) this.zoom(0.95)
    if (this.keys.BACKWARD) this.zoom(1.05)
  }
  
  // Utility methods
  zoom(factor) {
    this.orbitRadius *= factor
    this.orbitRadius = THREE.MathUtils.clamp(this.orbitRadius, this.minDistance, this.maxDistance)
    this.spherical.radius = this.orbitRadius
  }
  
  resetView() {
    this.transitionTo(new THREE.Vector3(0, 0, 8), new THREE.Vector3(0, 0, 0), 1.0)
  }
  
  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate
  }
  
  // Portal navigation
  transitionToPortal(portalData) {
    const targetPosition = SpatialMath.calculateOptimalViewPosition(
      SpatialMath.sphericalToCartesian(
        portalData.position.theta,
        portalData.position.phi,
        2.1
      ),
      2,
      this.portalLockDistance
    )
    
    this.transitionTo(targetPosition, this.sphereCenter, 2.0)
  }
  
  handlePortalApproach(mousePosition) {
    // Raycast to find nearest portal
    // This would integrate with the portal system
    // For now, just move closer
    this.zoom(0.8)
  }
  
  // Smooth transitions
  transitionTo(targetPosition, targetLookAt, duration = 1.0) {
    if (this.isTransitioning) return
    
    const startPosition = this.camera.position.clone()
    const startLookAt = new THREE.Vector3(0, 0, 0) // Current look at
    
    const path = CameraPath.generateApproachPath(startPosition, targetPosition, 30)
    
    this.currentTransition = {
      startTime: performance.now(),
      duration: duration * 1000,
      path,
      startLookAt,
      targetLookAt,
      onComplete: () => {
        this.isTransitioning = false
        this.currentTransition = null
      }
    }
    
    this.isTransitioning = true
  }
  
  // Main update loop
  update(deltaTime) {
    if (!this.enabled) return
    
    // Handle keyboard input
    this.updateKeyboardMovement(deltaTime)
    
    // Handle transitions
    if (this.currentTransition) {
      this.updateTransition(deltaTime)
      return
    }
    
    // Auto rotation
    if (this.autoRotate && !this.mouseState.isDragging) {
      this.sphericalDelta.theta += 2 * Math.PI / 60 / 60 * this.autoRotateSpeed * deltaTime
    }
    
    // Apply damping to momentum
    if (!this.mouseState.isDragging) {
      this.velocity.multiplyScalar(this.friction)
      
      if (this.velocity.length() > 0.001) {
        this.sphericalDelta.theta += this.velocity.x * deltaTime
        this.sphericalDelta.phi += this.velocity.y * deltaTime
      }
    }
    
    // Update spherical coordinates
    this.spherical.theta += this.sphericalDelta.theta
    this.spherical.phi += this.sphericalDelta.phi
    
    // Apply constraints
    this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi))
    this.spherical.radius = THREE.MathUtils.clamp(
      this.spherical.radius, 
      this.minDistance, 
      this.maxDistance
    )
    
    // Apply damping
    if (this.enableDamping) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor)
      this.sphericalDelta.phi *= (1 - this.dampingFactor)
      this.sphericalDelta.radius *= (1 - this.dampingFactor)
    } else {
      this.sphericalDelta.set(0, 0, 0)
    }
    
    // Update camera position
    const position = new THREE.Vector3().setFromSpherical(this.spherical)
    position.add(this.sphereCenter)
    this.camera.position.copy(position)
    
    // Update camera look-at
    this.camera.lookAt(this.sphereCenter)
  }
  
  updateTransition(deltaTime) {
    const now = performance.now()
    const elapsed = now - this.currentTransition.startTime
    const progress = Math.min(elapsed / this.currentTransition.duration, 1)
    
    // Smooth easing
    const eased = progress * progress * (3 - 2 * progress)
    
    // Interpolate along path
    const pathIndex = Math.floor(eased * (this.currentTransition.path.length - 1))
    const nextIndex = Math.min(pathIndex + 1, this.currentTransition.path.length - 1)
    const localProgress = (eased * (this.currentTransition.path.length - 1)) % 1
    
    const position = new THREE.Vector3().lerpVectors(
      this.currentTransition.path[pathIndex],
      this.currentTransition.path[nextIndex],
      localProgress
    )
    
    this.camera.position.copy(position)
    
    // Interpolate look-at
    const lookAt = new THREE.Vector3().lerpVectors(
      this.currentTransition.startLookAt,
      this.currentTransition.targetLookAt,
      eased
    )
    
    this.camera.lookAt(lookAt)
    
    // Complete transition
    if (progress >= 1) {
      this.currentTransition.onComplete()
    }
  }
  
  dispose() {
    // Remove event listeners
    this.domElement.removeEventListener('mousedown', this.onMouseDown)
    this.domElement.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.removeEventListener('mouseup', this.onMouseUp)
    this.domElement.removeEventListener('wheel', this.onMouseWheel)
    this.domElement.removeEventListener('dblclick', this.onDoubleClick)
    this.domElement.removeEventListener('contextmenu', this.onContextMenu)
    
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    
    this.domElement.removeEventListener('touchstart', this.onTouchStart)
    this.domElement.removeEventListener('touchmove', this.onTouchMove)
    this.domElement.removeEventListener('touchend', this.onTouchEnd)
  }
}

export default CameraController