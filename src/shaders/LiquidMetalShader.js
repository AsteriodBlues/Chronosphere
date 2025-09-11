import * as THREE from 'three'
import vertexShader from './vertex/liquidMetal.vert'
import fragmentShader from './fragment/liquidMetal.frag'

export const ShaderStates = {
  LIQUID: 0,
  CRYSTAL: 1,
  PLASMA: 2
}

export class LiquidMetalShader {
  constructor(options = {}) {
    this.options = {
      envMapIntensity: 1.0,
      ...options
    }
    
    this.uniforms = {
      // Vertex uniforms
      uTime: { value: 0 },
      uDisplacementScale: { value: 1.0 },
      uNoiseFrequency: { value: 2.0 },
      uNoiseAmplitude: { value: 0.15 },
      uBreathingIntensity: { value: 0.08 },
      uFlowSpeed: { value: 0.5 },
      uStateTransition: { value: 1.0 },
      uShaderState: { value: ShaderStates.LIQUID },
      
      // Fragment uniforms
      uCameraPosition: { value: new THREE.Vector3() },
      uMetalness: { value: 0.95 },
      uRoughness: { value: 0.15 },
      uBaseColor: { value: new THREE.Color(0x1a2332) },
      uRimPower: { value: 3.0 },
      uRimIntensity: { value: 0.8 },
      uRimColor: { value: new THREE.Color(0x4080ff) },
      uChromaticAberration: { value: 0.01 },
      uIridescence: { value: 0.3 },
      uEnvMap: { value: null },
      uEnvMapIntensity: { value: this.options.envMapIntensity },
      uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
      uLightColor: { value: new THREE.Color(0xffffff) },
      uLightIntensity: { value: 1.0 }
    }
    
    this.material = new THREE.ShaderMaterial({
      vertexShader: this.processShader(vertexShader),
      fragmentShader: this.processShader(fragmentShader),
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
      transparent: false
    })
    
    this.statePresets = {
      [ShaderStates.LIQUID]: {
        uMetalness: 0.95,
        uRoughness: 0.15,
        uBaseColor: new THREE.Color(0x1a2332),
        uNoiseAmplitude: 0.15,
        uFlowSpeed: 0.5,
        uRimColor: new THREE.Color(0x4080ff),
        uRimPower: 3.0,
        uChromaticAberration: 0.01
      },
      [ShaderStates.CRYSTAL]: {
        uMetalness: 0.5,
        uRoughness: 0.05,
        uBaseColor: new THREE.Color(0xb3d9ff),
        uNoiseAmplitude: 0.08,
        uFlowSpeed: 0.1,
        uRimColor: new THREE.Color(0xffffff),
        uRimPower: 5.0,
        uChromaticAberration: 0.02
      },
      [ShaderStates.PLASMA]: {
        uMetalness: 0.8,
        uRoughness: 0.3,
        uBaseColor: new THREE.Color(0xff4d1a),
        uNoiseAmplitude: 0.25,
        uFlowSpeed: 1.5,
        uRimColor: new THREE.Color(0xff8000),
        uRimPower: 2.0,
        uChromaticAberration: 0.03
      }
    }
    
    this.transitions = []
    this.animationMixers = new Map()
  }
  
  processShader(shaderCode) {
    // Remove #pragma glslify requires and just return shader code
    // In production, use glslify loader
    return shaderCode.replace(/#pragma glslify:.*$/gm, '')
  }
  
  update(deltaTime, camera) {
    this.uniforms.uTime.value += deltaTime
    
    if (camera) {
      this.uniforms.uCameraPosition.value.copy(camera.position)
    }
    
    // Update transitions
    this.updateTransitions(deltaTime)
    
    // Update animations
    this.updateAnimations(deltaTime)
  }
  
  setState(state, duration = 1.0) {
    if (state === this.uniforms.uShaderState.value) return
    
    const targetPreset = this.statePresets[state]
    if (!targetPreset) return
    
    // Start transition
    this.uniforms.uShaderState.value = state
    this.uniforms.uStateTransition.value = 0
    
    // Create transitions for each uniform
    Object.entries(targetPreset).forEach(([key, targetValue]) => {
      if (this.uniforms[key]) {
        this.createTransition(key, targetValue, duration)
      }
    })
  }
  
  createTransition(uniformName, targetValue, duration) {
    const uniform = this.uniforms[uniformName]
    if (!uniform) return
    
    const startValue = uniform.value.clone ? uniform.value.clone() : uniform.value
    
    this.transitions.push({
      uniform,
      uniformName,
      startValue,
      targetValue,
      duration,
      elapsed: 0,
      easing: this.easeInOutCubic
    })
  }
  
  updateTransitions(deltaTime) {
    this.transitions = this.transitions.filter(transition => {
      transition.elapsed += deltaTime
      const progress = Math.min(transition.elapsed / transition.duration, 1.0)
      const easedProgress = transition.easing(progress)
      
      if (transition.uniform.value instanceof THREE.Color) {
        transition.uniform.value.lerpColors(
          transition.startValue,
          transition.targetValue,
          easedProgress
        )
      } else if (transition.uniform.value instanceof THREE.Vector3) {
        transition.uniform.value.lerpVectors(
          transition.startValue,
          transition.targetValue,
          easedProgress
        )
      } else {
        transition.uniform.value = THREE.MathUtils.lerp(
          transition.startValue,
          transition.targetValue,
          easedProgress
        )
      }
      
      // Update state transition progress
      if (transition.uniformName === 'uStateTransition') {
        this.uniforms.uStateTransition.value = easedProgress
      }
      
      return progress < 1.0
    })
  }
  
  animateUniform(uniformName, targetValue, duration, easing = 'easeInOutCubic') {
    const easingFunc = typeof easing === 'function' ? easing : this[easing] || this.easeInOutCubic
    this.createTransition(uniformName, targetValue, duration)
  }
  
  updateAnimations(deltaTime) {
    this.animationMixers.forEach(mixer => {
      mixer.update(deltaTime)
    })
  }
  
  // Easing functions
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  
  easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  }
  
  easeOutBounce(t) {
    const n1 = 7.5625
    const d1 = 2.75
    
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  }
  
  setEnvironmentMap(envMap) {
    this.uniforms.uEnvMap.value = envMap
  }
  
  setBreathing(intensity, speed) {
    this.uniforms.uBreathingIntensity.value = intensity
    // Modulate flow speed with breathing
    this.uniforms.uFlowSpeed.value = speed
  }
  
  setDisplacement(scale, frequency, amplitude) {
    this.uniforms.uDisplacementScale.value = scale
    this.uniforms.uNoiseFrequency.value = frequency
    this.uniforms.uNoiseAmplitude.value = amplitude
  }
  
  setRimLighting(power, intensity, color) {
    this.uniforms.uRimPower.value = power
    this.uniforms.uRimIntensity.value = intensity
    if (color) {
      this.uniforms.uRimColor.value.set(color)
    }
  }
  
  setChromaticAberration(amount) {
    this.uniforms.uChromaticAberration.value = amount
  }
  
  setIridescence(intensity) {
    this.uniforms.uIridescence.value = intensity
  }
  
  dispose() {
    this.material.dispose()
    this.transitions = []
    this.animationMixers.clear()
  }
}

export default LiquidMetalShader