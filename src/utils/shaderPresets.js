import * as THREE from 'three'

export const shaderPresets = {
  // Timer state presets
  idle: {
    uniforms: {
      uDisplacementScale: 0.8,
      uNoiseFrequency: 2.0,
      uNoiseAmplitude: 0.1,
      uFlowSpeed: 0.3,
      uMetalness: 0.95,
      uRoughness: 0.2,
      uRimIntensity: 0.5,
      uChromaticAberration: 0.005,
      uIridescence: 0.2
    },
    duration: 2.0,
    easing: 'easeInOutCubic'
  },
  
  focus: {
    uniforms: {
      uDisplacementScale: 0.5,
      uNoiseFrequency: 3.0,
      uNoiseAmplitude: 0.05,
      uFlowSpeed: 0.1,
      uMetalness: 0.5,
      uRoughness: 0.05,
      uRimIntensity: 0.8,
      uChromaticAberration: 0.02,
      uIridescence: 0.4
    },
    duration: 1.5,
    easing: 'easeOutQuad'
  },
  
  break: {
    uniforms: {
      uDisplacementScale: 1.2,
      uNoiseFrequency: 1.5,
      uNoiseAmplitude: 0.2,
      uFlowSpeed: 0.8,
      uMetalness: 0.8,
      uRoughness: 0.3,
      uRimIntensity: 0.6,
      uChromaticAberration: 0.01,
      uIridescence: 0.3
    },
    duration: 2.0,
    easing: 'easeInOutSine'
  },
  
  flow: {
    uniforms: {
      uDisplacementScale: 0.3,
      uNoiseFrequency: 4.0,
      uNoiseAmplitude: 0.03,
      uFlowSpeed: 0.05,
      uMetalness: 0.3,
      uRoughness: 0.02,
      uRimIntensity: 1.0,
      uChromaticAberration: 0.03,
      uIridescence: 0.5
    },
    duration: 1.0,
    easing: 'easeOutElastic'
  },
  
  quantum: {
    uniforms: {
      uDisplacementScale: 1.5,
      uNoiseFrequency: 5.0,
      uNoiseAmplitude: 0.3,
      uFlowSpeed: 2.0,
      uMetalness: 0.9,
      uRoughness: 0.4,
      uRimIntensity: 1.2,
      uChromaticAberration: 0.05,
      uIridescence: 0.8
    },
    duration: 0.5,
    easing: 'easeOutBounce'
  },
  
  // Special effect presets
  pulse: {
    uniforms: {
      uDisplacementScale: { from: 0.8, to: 1.2 },
      uRimIntensity: { from: 0.5, to: 1.5 },
      uNoiseAmplitude: { from: 0.1, to: 0.2 }
    },
    duration: 0.5,
    easing: 'easeInOutQuad',
    loop: true
  },
  
  ripple: {
    uniforms: {
      uNoiseFrequency: { from: 2.0, to: 8.0 },
      uFlowSpeed: { from: 0.5, to: 2.0 },
      uChromaticAberration: { from: 0.01, to: 0.05 }
    },
    duration: 1.0,
    easing: 'easeOutCirc'
  },
  
  crystallize: {
    uniforms: {
      uMetalness: { from: 0.95, to: 0.3 },
      uRoughness: { from: 0.2, to: 0.02 },
      uNoiseAmplitude: { from: 0.15, to: 0.05 },
      uDisplacementScale: { from: 1.0, to: 0.3 }
    },
    duration: 2.0,
    easing: 'easeInOutCubic'
  },
  
  energize: {
    uniforms: {
      uFlowSpeed: { from: 0.5, to: 3.0 },
      uNoiseAmplitude: { from: 0.1, to: 0.4 },
      uRimIntensity: { from: 0.5, to: 2.0 },
      uIridescence: { from: 0.2, to: 1.0 }
    },
    duration: 1.5,
    easing: 'easeOutExpo'
  },
  
  dissolve: {
    uniforms: {
      uDisplacementScale: { from: 1.0, to: 2.0 },
      uNoiseAmplitude: { from: 0.1, to: 0.5 },
      uChromaticAberration: { from: 0.01, to: 0.1 },
      uRoughness: { from: 0.2, to: 0.8 }
    },
    duration: 1.0,
    easing: 'easeInQuad'
  }
}

// Color presets for different states
export const colorPresets = {
  focus: {
    baseColor: new THREE.Color(0x1a3366), // Deep blue
    rimColor: new THREE.Color(0x4080ff),   // Bright blue
    lightColor: new THREE.Color(0xccddff)  // Cool white
  },
  
  break: {
    baseColor: new THREE.Color(0x1a6633), // Deep green
    rimColor: new THREE.Color(0x00ff80),   // Bright green
    lightColor: new THREE.Color(0xddffcc)  // Warm white
  },
  
  flow: {
    baseColor: new THREE.Color(0x331a66), // Deep purple
    rimColor: new THREE.Color(0x8040ff),   // Bright purple
    lightColor: new THREE.Color(0xddccff)  // Purple white
  },
  
  quantum: {
    baseColor: new THREE.Color(0x661a33), // Deep red
    rimColor: new THREE.Color(0xff4080),   // Bright pink
    lightColor: new THREE.Color(0xffccdd)  // Pink white
  },
  
  neutral: {
    baseColor: new THREE.Color(0x1a2332), // Dark silver
    rimColor: new THREE.Color(0xffffff),   // Pure white
    lightColor: new THREE.Color(0xffffff)  // Pure white
  }
}

// Animation sequences for complex transitions
export const animationSequences = {
  startFocus: [
    { preset: 'crystallize', delay: 0 },
    { preset: 'pulse', delay: 2, loop: true }
  ],
  
  endFocus: [
    { preset: 'energize', delay: 0 },
    { preset: 'dissolve', delay: 1.5 },
    { preset: 'break', delay: 2.5 }
  ],
  
  timerComplete: [
    { preset: 'ripple', delay: 0 },
    { preset: 'energize', delay: 0.5 },
    { preset: 'pulse', delay: 1.5, repeat: 3 }
  ],
  
  enterFlow: [
    { preset: 'crystallize', delay: 0 },
    { preset: 'flow', delay: 2 }
  ],
  
  warning: [
    { preset: 'pulse', delay: 0, speed: 2 },
    { preset: 'ripple', delay: 0.25 }
  ]
}

// LOD (Level of Detail) configurations
export const lodConfigurations = {
  LOD0: {
    // Full quality
    vertexCount: 128,
    noiseOctaves: 4,
    envMapResolution: 1024,
    shadowMapSize: 2048,
    effects: {
      displacement: true,
      fresnel: true,
      chromaticAberration: true,
      iridescence: true,
      subsurfaceScattering: true
    }
  },
  
  LOD1: {
    // Medium quality
    vertexCount: 64,
    noiseOctaves: 3,
    envMapResolution: 512,
    shadowMapSize: 1024,
    effects: {
      displacement: true,
      fresnel: true,
      chromaticAberration: true,
      iridescence: false,
      subsurfaceScattering: false
    }
  },
  
  LOD2: {
    // Low quality
    vertexCount: 32,
    noiseOctaves: 2,
    envMapResolution: 256,
    shadowMapSize: 512,
    effects: {
      displacement: true,
      fresnel: true,
      chromaticAberration: false,
      iridescence: false,
      subsurfaceScattering: false
    }
  },
  
  LOD3: {
    // Minimal quality
    vertexCount: 16,
    noiseOctaves: 1,
    envMapResolution: 128,
    shadowMapSize: 256,
    effects: {
      displacement: false,
      fresnel: true,
      chromaticAberration: false,
      iridescence: false,
      subsurfaceScattering: false
    }
  }
}

// Performance profiles for automatic quality adjustment
export const performanceProfiles = {
  ultra: {
    targetFPS: 120,
    minFPS: 90,
    defaultLOD: 'LOD0',
    dynamicLOD: false
  },
  
  high: {
    targetFPS: 60,
    minFPS: 50,
    defaultLOD: 'LOD0',
    dynamicLOD: true
  },
  
  medium: {
    targetFPS: 60,
    minFPS: 30,
    defaultLOD: 'LOD1',
    dynamicLOD: true
  },
  
  low: {
    targetFPS: 30,
    minFPS: 20,
    defaultLOD: 'LOD2',
    dynamicLOD: true
  },
  
  mobile: {
    targetFPS: 30,
    minFPS: 15,
    defaultLOD: 'LOD3',
    dynamicLOD: false
  }
}

export default {
  shaderPresets,
  colorPresets,
  animationSequences,
  lodConfigurations,
  performanceProfiles
}