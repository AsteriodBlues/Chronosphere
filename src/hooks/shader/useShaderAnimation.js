import { useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'

export function useShaderAnimation(shader) {
  const animationsRef = useRef([])
  const rafRef = useRef()
  
  const animate = useCallback((uniformName, from, to, duration, options = {}) => {
    if (!shader) return
    
    const {
      easing = 'easeInOutCubic',
      onComplete,
      onUpdate,
      delay = 0
    } = options
    
    const animation = {
      uniformName,
      from,
      to,
      duration,
      delay,
      easing: typeof easing === 'function' ? easing : easingFunctions[easing],
      onComplete,
      onUpdate,
      startTime: null,
      delayStartTime: performance.now(),
      completed: false
    }
    
    animationsRef.current.push(animation)
    
    if (!rafRef.current) {
      startAnimationLoop()
    }
    
    return animation
  }, [shader])
  
  const animateSequence = useCallback((animations) => {
    let totalDelay = 0
    
    animations.forEach(({ uniformName, from, to, duration, options = {} }) => {
      animate(uniformName, from, to, duration, {
        ...options,
        delay: totalDelay + (options.delay || 0)
      })
      totalDelay += duration
    })
  }, [animate])
  
  const animateParallel = useCallback((animations) => {
    animations.forEach(({ uniformName, from, to, duration, options = {} }) => {
      animate(uniformName, from, to, duration, options)
    })
  }, [animate])
  
  const stopAnimation = useCallback((uniformName) => {
    animationsRef.current = animationsRef.current.filter(
      anim => anim.uniformName !== uniformName
    )
  }, [])
  
  const stopAllAnimations = useCallback(() => {
    animationsRef.current = []
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])
  
  const startAnimationLoop = useCallback(() => {
    const loop = () => {
      const now = performance.now()
      const deltaTime = 1 / 60 // Assuming 60fps
      
      animationsRef.current = animationsRef.current.filter(animation => {
        // Handle delay
        if (animation.delay > 0) {
          const delayElapsed = now - animation.delayStartTime
          if (delayElapsed < animation.delay * 1000) {
            return true // Keep animation, still in delay
          }
          if (!animation.startTime) {
            animation.startTime = now
          }
        } else if (!animation.startTime) {
          animation.startTime = now
        }
        
        const elapsed = now - animation.startTime
        const progress = Math.min(elapsed / (animation.duration * 1000), 1)
        const easedProgress = animation.easing(progress)
        
        // Update uniform value
        if (shader && shader.uniforms[animation.uniformName]) {
          const uniform = shader.uniforms[animation.uniformName]
          
          if (uniform.value instanceof THREE.Color) {
            const fromColor = animation.from instanceof THREE.Color ? 
              animation.from : new THREE.Color(animation.from)
            const toColor = animation.to instanceof THREE.Color ? 
              animation.to : new THREE.Color(animation.to)
            
            uniform.value.lerpColors(fromColor, toColor, easedProgress)
          } else if (uniform.value instanceof THREE.Vector3) {
            uniform.value.lerpVectors(animation.from, animation.to, easedProgress)
          } else {
            uniform.value = THREE.MathUtils.lerp(
              animation.from,
              animation.to,
              easedProgress
            )
          }
          
          if (animation.onUpdate) {
            animation.onUpdate(uniform.value, easedProgress)
          }
        }
        
        if (progress >= 1) {
          if (animation.onComplete) {
            animation.onComplete()
          }
          animation.completed = true
          return false // Remove from animations
        }
        
        return true // Keep animation
      })
      
      if (animationsRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        rafRef.current = null
      }
    }
    
    rafRef.current = requestAnimationFrame(loop)
  }, [shader])
  
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])
  
  return {
    animate,
    animateSequence,
    animateParallel,
    stopAnimation,
    stopAllAnimations
  }
}

// Easing functions
const easingFunctions = {
  linear: t => t,
  
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - (--t) * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  easeInQuint: t => t * t * t * t * t,
  easeOutQuint: t => 1 + (--t) * t * t * t * t,
  easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: t => Math.sin(t * Math.PI / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0 || t === 1) return t
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2
  },
  
  easeInCirc: t => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: t => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: t => t < 0.5 ?
    (1 - Math.sqrt(1 - 4 * t * t)) / 2 :
    (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  
  easeInElastic: t => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 :
      -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
  },
  
  easeOutElastic: t => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  
  easeInOutElastic: t => {
    const c5 = (2 * Math.PI) / 4.5
    return t === 0 ? 0 : t === 1 ? 1 :
      t < 0.5 ?
        -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2 :
        (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
  },
  
  easeInBack: t => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  },
  
  easeOutBack: t => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  
  easeInOutBack: t => {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    return t < 0.5 ?
      (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 :
      (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  },
  
  easeInBounce: t => 1 - easingFunctions.easeOutBounce(1 - t),
  
  easeOutBounce: t => {
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
  },
  
  easeInOutBounce: t => t < 0.5 ?
    (1 - easingFunctions.easeOutBounce(1 - 2 * t)) / 2 :
    (1 + easingFunctions.easeOutBounce(2 * t - 1)) / 2
}

export default useShaderAnimation