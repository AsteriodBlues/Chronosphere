// Portal type definitions and configurations
export const PortalTypes = {
  FEATURE: 'feature',
  DISCOVERY: 'discovery', 
  MEMORY: 'memory',
  SYSTEM: 'system',
  QUICK_ACCESS: 'quick_access',
  HIDDEN: 'hidden'
}

export const PortalStates = {
  DORMANT: 'dormant',
  ACTIVE: 'active',
  PULSING: 'pulsing',
  ENTERED: 'entered',
  LOCKED: 'locked',
  HIDDEN: 'hidden'
}

export const PortalPriority = {
  PRIMARY: 1,
  SECONDARY: 2,
  TERTIARY: 3,
  HIDDEN: 4
}

export const portalConfigurations = {
  [PortalTypes.FEATURE]: {
    baseSize: 0.12,
    glowIntensity: 0.8,
    pulseDuration: 2.0,
    attractionRadius: 0.3,
    colorPalette: {
      primary: '#4080FF',
      secondary: '#00BFFF',
      accent: '#80E0FF'
    },
    effects: {
      hasRipples: true,
      hasParticles: true,
      hasDistortion: false,
      hasMagneticField: true
    }
  },
  
  [PortalTypes.DISCOVERY]: {
    baseSize: 0.08,
    glowIntensity: 0.6,
    pulseDuration: 3.5,
    attractionRadius: 0.2,
    colorPalette: {
      primary: '#FF8040',
      secondary: '#FFB366',
      accent: '#FFD699'
    },
    effects: {
      hasRipples: false,
      hasParticles: true,
      hasDistortion: true,
      hasMagneticField: false
    }
  },
  
  [PortalTypes.MEMORY]: {
    baseSize: 0.06,
    glowIntensity: 0.4,
    pulseDuration: 4.0,
    attractionRadius: 0.15,
    colorPalette: {
      primary: '#8040FF',
      secondary: '#A666FF',
      accent: '#CC99FF'
    },
    effects: {
      hasRipples: true,
      hasParticles: false,
      hasDistortion: false,
      hasMagneticField: false
    }
  },
  
  [PortalTypes.SYSTEM]: {
    baseSize: 0.04,
    glowIntensity: 0.3,
    pulseDuration: 1.5,
    attractionRadius: 0.1,
    colorPalette: {
      primary: '#00FF80',
      secondary: '#66FFB3',
      accent: '#99FFD6'
    },
    effects: {
      hasRipples: false,
      hasParticles: false,
      hasDistortion: false,
      hasMagneticField: true
    }
  },
  
  [PortalTypes.QUICK_ACCESS]: {
    baseSize: 0.05,
    glowIntensity: 0.5,
    pulseDuration: 2.5,
    attractionRadius: 0.12,
    colorPalette: {
      primary: '#FF4080',
      secondary: '#FF66B3',
      accent: '#FF99D6'
    },
    effects: {
      hasRipples: true,
      hasParticles: true,
      hasDistortion: false,
      hasMagneticField: true
    }
  },
  
  [PortalTypes.HIDDEN]: {
    baseSize: 0.02,
    glowIntensity: 0.1,
    pulseDuration: 6.0,
    attractionRadius: 0.05,
    colorPalette: {
      primary: '#666666',
      secondary: '#999999',
      accent: '#CCCCCC'
    },
    effects: {
      hasRipples: false,
      hasParticles: false,
      hasDistortion: true,
      hasMagneticField: false
    }
  }
}

// Portal feature definitions
export const PortalFeatures = {
  TIMER_CONTROL: {
    id: 'timer_control',
    type: PortalTypes.FEATURE,
    priority: PortalPriority.PRIMARY,
    label: 'Timer Control',
    description: 'Main Pomodoro timer controls',
    position: { theta: 0, phi: 0 }, // Front center
    requiredLevel: 1,
    unlocked: true
  },
  
  ANALYTICS: {
    id: 'analytics',
    type: PortalTypes.FEATURE,
    priority: PortalPriority.PRIMARY,
    label: 'Analytics',
    description: 'Productivity insights and statistics',
    position: { theta: Math.PI * 0.5, phi: 0 }, // Right side
    requiredLevel: 3,
    unlocked: false
  },
  
  SETTINGS: {
    id: 'settings',
    type: PortalTypes.FEATURE,
    priority: PortalPriority.SECONDARY,
    label: 'Settings',
    description: 'Application preferences',
    position: { theta: Math.PI, phi: 0 }, // Back
    requiredLevel: 1,
    unlocked: true
  },
  
  ACHIEVEMENTS: {
    id: 'achievements',
    type: PortalTypes.DISCOVERY,
    priority: PortalPriority.SECONDARY,
    label: 'Achievements',
    description: 'Unlock rewards and milestones',
    position: { theta: Math.PI * 1.5, phi: 0 }, // Left side
    requiredLevel: 5,
    unlocked: false
  },
  
  FOCUS_MODES: {
    id: 'focus_modes',
    type: PortalTypes.FEATURE,
    priority: PortalPriority.SECONDARY,
    label: 'Focus Modes',
    description: 'Deep work and flow states',
    position: { theta: Math.PI * 0.25, phi: Math.PI * 0.3 }, // Top right
    requiredLevel: 7,
    unlocked: false
  },
  
  TEAM_SYNC: {
    id: 'team_sync',
    type: PortalTypes.DISCOVERY,
    priority: PortalPriority.TERTIARY,
    label: 'Team Sync',
    description: 'Collaborative focus sessions',
    position: { theta: Math.PI * 0.75, phi: Math.PI * 0.3 }, // Top left
    requiredLevel: 10,
    unlocked: false
  },
  
  AI_INSIGHTS: {
    id: 'ai_insights',
    type: PortalTypes.HIDDEN,
    priority: PortalPriority.HIDDEN,
    label: 'AI Insights',
    description: 'Intelligent productivity recommendations',
    position: { theta: Math.PI * 0.1, phi: -Math.PI * 0.2 }, // Bottom right
    requiredLevel: 15,
    unlocked: false
  }
}

// Portal clustering for related features
export const PortalClusters = {
  PRODUCTIVITY: {
    id: 'productivity',
    label: 'Productivity Tools',
    portals: ['timer_control', 'analytics', 'focus_modes'],
    centerPosition: { theta: Math.PI * 0.125, phi: 0.15 }
  },
  
  CUSTOMIZATION: {
    id: 'customization',
    label: 'Personalization',
    portals: ['settings', 'achievements'],
    centerPosition: { theta: Math.PI * 1.25, phi: 0 }
  },
  
  COLLABORATION: {
    id: 'collaboration',
    label: 'Team Features',
    portals: ['team_sync', 'ai_insights'],
    centerPosition: { theta: Math.PI * 0.75, phi: 0.1 }
  }
}

export default {
  PortalTypes,
  PortalStates,
  PortalPriority,
  portalConfigurations,
  PortalFeatures,
  PortalClusters
}