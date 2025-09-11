import * as THREE from 'three'
import { create } from 'zustand'
import { PortalTypes, PortalStates, PortalFeatures, portalConfigurations } from '../constants/portalTypes'

// Portal Manager Store
export const usePortalStore = create((set, get) => ({
  // Portal registry
  portals: new Map(),
  activePortals: [],
  discoveredPortals: new Set(),
  
  // Navigation state
  currentPortal: null,
  navigationHistory: [],
  isNavigating: false,
  
  // User progress
  userLevel: 1,
  unlockedPortals: new Set(['timer_control', 'settings']),
  
  // Spatial tracking
  sphereRotation: { x: 0, y: 0, z: 0 },
  cameraPosition: new THREE.Vector3(0, 0, 8),
  
  // Portal interactions
  hoveredPortal: null,
  magneticField: new Map(),
  
  // Actions
  initializePortals: () => {
    const portals = new Map()
    
    Object.entries(PortalFeatures).forEach(([key, feature]) => {
      const portal = {
        ...feature,
        state: PortalStates.DORMANT,
        createdAt: Date.now(),
        lastAccessed: null,
        accessCount: 0,
        discoveryTime: null,
        magneticStrength: 0,
        currentSize: portalConfigurations[feature.type].baseSize,
        isVisible: feature.unlocked,
        pulsePhase: Math.random() * Math.PI * 2,
        effectsActive: false
      }
      
      portals.set(feature.id, portal)
    })
    
    set({ portals, activePortals: Array.from(portals.values()) })
  },
  
  updatePortalState: (portalId, newState) => {
    const { portals } = get()
    const portal = portals.get(portalId)
    
    if (portal) {
      portal.state = newState
      portal.lastAccessed = Date.now()
      
      if (newState === PortalStates.ACTIVE) {
        portal.accessCount++
      }
      
      set({ portals: new Map(portals) })
    }
  },
  
  discoverPortal: (portalId) => {
    const { discoveredPortals, portals } = get()
    const newDiscovered = new Set(discoveredPortals)
    newDiscovered.add(portalId)
    
    const portal = portals.get(portalId)
    if (portal) {
      portal.discoveryTime = Date.now()
      portal.isVisible = true
      portal.state = PortalStates.PULSING
    }
    
    set({ 
      discoveredPortals: newDiscovered,
      portals: new Map(portals)
    })
  },
  
  unlockPortal: (portalId) => {
    const { unlockedPortals, portals } = get()
    const newUnlocked = new Set(unlockedPortals)
    newUnlocked.add(portalId)
    
    const portal = portals.get(portalId)
    if (portal) {
      portal.unlocked = true
      portal.isVisible = true
    }
    
    set({ 
      unlockedPortals: newUnlocked,
      portals: new Map(portals)
    })
  },
  
  navigateToPortal: (portalId) => {
    const { portals, navigationHistory, currentPortal } = get()
    const portal = portals.get(portalId)
    
    if (portal && portal.unlocked) {
      // Add to navigation history
      const newHistory = currentPortal 
        ? [...navigationHistory, currentPortal]
        : navigationHistory
      
      // Update portal state
      get().updatePortalState(portalId, PortalStates.ENTERED)
      
      set({
        currentPortal: portalId,
        navigationHistory: newHistory,
        isNavigating: true
      })
      
      return true
    }
    
    return false
  },
  
  navigateBack: () => {
    const { navigationHistory } = get()
    
    if (navigationHistory.length > 0) {
      const previousPortal = navigationHistory[navigationHistory.length - 1]
      const newHistory = navigationHistory.slice(0, -1)
      
      set({
        currentPortal: previousPortal,
        navigationHistory: newHistory,
        isNavigating: true
      })
      
      return true
    }
    
    return false
  },
  
  setHoveredPortal: (portalId) => {
    const { portals } = get()
    
    if (portalId) {
      const portal = portals.get(portalId)
      if (portal) {
        portal.magneticStrength = 1.0
        portal.effectsActive = true
      }
    }
    
    // Clear previous hover
    const { hoveredPortal } = get()
    if (hoveredPortal && hoveredPortal !== portalId) {
      const prevPortal = portals.get(hoveredPortal)
      if (prevPortal) {
        prevPortal.magneticStrength = 0
        prevPortal.effectsActive = false
      }
    }
    
    set({ 
      hoveredPortal: portalId,
      portals: new Map(portals)
    })
  },
  
  updateSpatialState: (sphereRotation, cameraPosition) => {
    set({ sphereRotation, cameraPosition })
  },
  
  checkLevelProgression: () => {
    const { userLevel, unlockedPortals } = get()
    const newLevel = Math.floor(unlockedPortals.size / 2) + 1
    
    if (newLevel > userLevel) {
      // Check for new unlocks
      Object.values(PortalFeatures).forEach(feature => {
        if (feature.requiredLevel <= newLevel && !unlockedPortals.has(feature.id)) {
          get().unlockPortal(feature.id)
        }
      })
      
      set({ userLevel: newLevel })
    }
  },
  
  getVisiblePortals: () => {
    const { portals, cameraPosition, sphereRotation } = get()
    
    return Array.from(portals.values()).filter(portal => {
      if (!portal.isVisible) return false
      
      // Calculate portal world position
      const worldPos = sphericalToCartesian(
        portal.position.theta + sphereRotation.y,
        portal.position.phi + sphereRotation.x,
        2.1 // Sphere radius + offset
      )
      
      // Check if portal is facing camera (dot product test)
      const toCamera = new THREE.Vector3().subVectors(cameraPosition, worldPos).normalize()
      const portalNormal = worldPos.clone().normalize()
      const facingDot = toCamera.dot(portalNormal)
      
      return facingDot > -0.3 // Allow some back-facing visibility
    })
  },
  
  getNearestPortal: (screenPosition) => {
    const visiblePortals = get().getVisiblePortals()
    
    if (visiblePortals.length === 0) return null
    
    // Find nearest portal to screen position
    let nearest = null
    let minDistance = Infinity
    
    visiblePortals.forEach(portal => {
      const distance = screenPosition.distanceTo(portal.screenPosition || new THREE.Vector2())
      if (distance < minDistance) {
        minDistance = distance
        nearest = portal
      }
    })
    
    return minDistance < 0.1 ? nearest : null
  }
}))

// Utility functions
function sphericalToCartesian(theta, phi, radius = 1) {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function cartesianToSpherical(position) {
  const radius = position.length()
  const theta = Math.atan2(position.z, position.x)
  const phi = Math.acos(position.y / radius)
  
  return { theta, phi, radius }
}

// Portal Physics System
export class PortalPhysics {
  constructor() {
    this.magneticFields = new Map()
    this.attractionForces = new Map()
    this.repulsionZones = new Map()
  }
  
  updateMagneticField(portalId, strength, radius) {
    this.magneticFields.set(portalId, { strength, radius })
  }
  
  calculateAttraction(cursorPosition, portals) {
    let totalForce = new THREE.Vector2(0, 0)
    
    portals.forEach(portal => {
      const magneticData = this.magneticFields.get(portal.id)
      if (!magneticData || !portal.screenPosition) return
      
      const distance = cursorPosition.distanceTo(portal.screenPosition)
      const config = portalConfigurations[portal.type]
      
      if (distance < config.attractionRadius) {
        const direction = new THREE.Vector2()
          .subVectors(portal.screenPosition, cursorPosition)
          .normalize()
        
        const forceMagnitude = magneticData.strength * 
          (1 - distance / config.attractionRadius) ** 2
        
        const force = direction.multiplyScalar(forceMagnitude)
        totalForce.add(force)
      }
    })
    
    return totalForce
  }
  
  updatePortalSizes(deltaTime, portals) {
    portals.forEach(portal => {
      const config = portalConfigurations[portal.type]
      const targetSize = config.baseSize * 
        (1 + portal.magneticStrength * 0.5)
      
      portal.currentSize = THREE.MathUtils.lerp(
        portal.currentSize,
        targetSize,
        deltaTime * 5
      )
      
      // Update pulse phase
      portal.pulsePhase += deltaTime * (2 * Math.PI / config.pulseDuration)
      if (portal.pulsePhase > Math.PI * 2) {
        portal.pulsePhase -= Math.PI * 2
      }
    })
  }
}

export default PortalManager