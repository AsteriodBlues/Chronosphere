import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import './index.css'

// Extend OrbitControls
extend({ OrbitControls: ThreeOrbitControls })

// Beautiful Blue-to-White Liquid Metal Sphere (from progressive version)
function SimpleLiquidMetalSphere() {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x0040ff) },
        uMetalness: { value: 0.9 },
        uRoughness: { value: 0.1 }
      },
      transparent: true,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        uniform float uTime;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Smooth liquid displacement
          vec3 pos = position;
          float displacement = sin(position.x * 5.0 + uTime) * 0.05;
          displacement += sin(position.y * 5.0 + uTime * 1.1) * 0.05;
          displacement += sin(position.z * 5.0 + uTime * 0.9) * 0.05;
          pos += normal * displacement;
          
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uMetalness;
        uniform float uRoughness;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          
          // Beautiful balanced fresnel effect
          float fresnel = 1.0 - max(0.0, dot(normal, viewDir));
          fresnel = pow(fresnel, 2.0); // Balanced curve
          
          // Perfect blue to white gradient - balanced
          vec3 baseColor = uColor; // Deep blue
          vec3 fresnelColor = vec3(0.9, 0.95, 1.0); // Near-white highlights
          
          // Balanced metallic reflection
          float metallic = smoothstep(0.5, 0.85, fresnel); // Moderate metallic threshold
          vec3 metallicColor = mix(baseColor, fresnelColor, metallic * 0.8);
          
          // Balanced shimmer
          float shimmer = sin(uTime * 2.0 + vPosition.x * 8.0) * 0.08;
          shimmer += sin(uTime * 1.5 + vPosition.y * 6.0) * 0.06;
          
          // Beautiful balanced gradient
          float gradient = (vWorldPosition.y + 2.0) / 4.0;
          vec3 gradientColor = mix(baseColor * 1.1, fresnelColor * 0.8, gradient * 0.5);
          
          // Perfectly balanced combination
          vec3 finalColor = mix(gradientColor, metallicColor, fresnel * 0.6);
          finalColor += shimmer * mix(baseColor, fresnelColor, 0.4); // Balanced shimmer color
          
          // Balanced rim lighting
          float rim = pow(fresnel, 0.8) * 0.5;
          finalColor += rim * fresnelColor;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    })
  }, [])
  
  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
    
    if (meshRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      meshRef.current.scale.setScalar(breathe)
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  const handleSphereClick = () => {
    setIsClicked(true)
    console.log('Entering sphere...')
    setTimeout(() => setIsClicked(false), 1000)
  }

  return (
    <mesh 
      ref={meshRef} 
      material={material}
      onClick={handleSphereClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={{ cursor: isHovered ? 'pointer' : 'default' }}
    >
      <sphereGeometry args={[2, 64, 64]} />
    </mesh>
  )
}

// Camera Controls
function CameraControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })
  
  return <orbitControls ref={controlsRef} args={[camera, gl.domElement]} />
}

// Internal Galaxy Particles
function InternalGalaxy({ count = 2000 }) {
  const pointsRef = useRef()
  
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const size = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = radius * Math.cos(phi)
      
      // Enhanced color palette - blues, cyans, whites
      const hue = 0.5 + Math.random() * 0.2 // Blue to cyan range
      const color = new THREE.Color().setHSL(hue, 0.7 + Math.random() * 0.3, 0.4 + Math.random() * 0.6)
      col[i3] = color.r
      col[i3 + 1] = color.g
      col[i3 + 2] = color.b
      
      size[i] = Math.random() * 0.03 + 0.01
    }
    
    return [pos, col, size]
  }, [count])
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [positions, colors, sizes])
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      pointsRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={1.0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={false}
      />
    </points>
  )
}

// Creative Background Galaxy
function BackgroundGalaxy({ timerProgress = 0, isRunning = false, sessions = 0 }) {
  const [stars, setStars] = useState([])
  const [shootingStars, setShootingStars] = useState([])
  const [nebulaClouds, setNebulaClouds] = useState([])
  const [energyWaves, setEnergyWaves] = useState([])
  const [comets, setComets] = useState([])
  const [particleDust, setParticleDust] = useState([])
  const [cosmicWind, setCosmicWind] = useState([])
  const canvasRef = useRef()
  const mousePosition = useRef({ x: 0, y: 0 })

  // Generate constellation patterns
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      
      // Main constellation stars with more variety
      for (let i = 0; i < 200; i++) {
        const starType = Math.random()
        let color, size, brightness
        
        if (starType < 0.7) {
          // Regular stars
          color = [100, 149, 237] // Blue
          size = Math.random() * 2 + 1
          brightness = Math.random() * 0.6 + 0.3
        } else if (starType < 0.9) {
          // Giant stars
          color = [255, 182, 193] // Light pink
          size = Math.random() * 4 + 2
          brightness = Math.random() * 0.4 + 0.6
        } else {
          // Rare diamond stars
          color = [255, 255, 255] // White
          size = Math.random() * 3 + 2
          brightness = 0.9 + Math.random() * 0.1
        }
        
        newStars.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size,
          brightness,
          color,
          twinkleSpeed: Math.random() * 2 + 0.5,
          twinkleOffset: Math.random() * Math.PI * 2,
          constellation: Math.floor(i / 15), // Smaller constellations
          isMainStar: i % 15 === 0,
        })
      }
      
      // Add special focus constellation when timer is running
      if (isRunning) {
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
        const radius = 220
        
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2
          newStars.push({
            id: `focus-${i}`,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            size: 5,
            brightness: 1,
            color: [255, 215, 0], // Gold
            twinkleSpeed: 4,
            twinkleOffset: i * Math.PI / 6,
            constellation: 'focus',
            isMainStar: true,
            isFocusStar: true,
            pulsePhase: i * Math.PI / 6
          })
        }
      }
      
      setStars(newStars)
    }
    
    // Generate nebula clouds
    const generateNebulas = () => {
      const newNebulas = []
      for (let i = 0; i < 8; i++) {
        newNebulas.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: 150 + Math.random() * 200,
          color: Math.random() < 0.5 ? [138, 43, 226] : [75, 0, 130], // Purple/Indigo
          opacity: 0.15 + Math.random() * 0.1,
          driftSpeed: 0.2 + Math.random() * 0.3,
          driftAngle: Math.random() * Math.PI * 2
        })
      }
      setNebulaClouds(newNebulas)
    }
    
    // Generate distant comets
    const generateComets = () => {
      const newComets = []
      for (let i = 0; i < 3; i++) {
        newComets.push({
          id: i,
          x: -100,
          y: Math.random() * window.innerHeight,
          targetX: window.innerWidth + 100,
          targetY: Math.random() * window.innerHeight,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.002,
          trail: [],
          tailLength: 20 + Math.random() * 15
        })
      }
      setComets(newComets)
    }

    // Generate ethereal particle dust
    const generateParticleDust = () => {
      const newDust = []
      for (let i = 0; i < 800; i++) {
        newDust.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          z: Math.random() * 5 + 1, // Depth layer
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.4 + 0.1,
          driftSpeed: Math.random() * 0.5 + 0.1,
          driftAngle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 1 + 0.5,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: Math.random() < 0.3 ? [200, 220, 255] : [180, 200, 255]
        })
      }
      setParticleDust(newDust)
    }

    // Generate cosmic wind particles
    const generateCosmicWind = () => {
      const newWind = []
      for (let i = 0; i < 200; i++) {
        newWind.push({
          id: i,
          x: -50,
          y: Math.random() * window.innerHeight,
          targetX: window.innerWidth + 50,
          targetY: Math.random() * window.innerHeight,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
          size: Math.random() * 0.8 + 0.2,
          opacity: Math.random() * 0.3 + 0.1,
          color: [220, 230, 255]
        })
      }
      setCosmicWind(newWind)
    }

    generateStars()
    generateNebulas()
    generateComets()
    generateParticleDust()
    generateCosmicWind()
    
    const handleResize = () => {
      generateStars()
      generateNebulas()
      generateComets()
      generateParticleDust()
      generateCosmicWind()
    }
    
    // Mouse tracking for parallax effects
    const handleMouseMove = (e) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isRunning])

  // Energy waves during focus mode
  useEffect(() => {
    if (isRunning) {
      const createEnergyWave = () => {
        const newWave = {
          id: Date.now() + Math.random(),
          centerX: window.innerWidth / 2,
          centerY: window.innerHeight / 2,
          radius: 0,
          maxRadius: 400,
          opacity: 0.8,
          color: [255, 215, 0] // Gold
        }
        
        setEnergyWaves(prev => [...prev, newWave])
        
        setTimeout(() => {
          setEnergyWaves(prev => prev.filter(wave => wave.id !== newWave.id))
        }, 3000)
      }
      
      // Create energy waves every 4 seconds during focus
      const interval = setInterval(createEnergyWave, 4000)
      return () => clearInterval(interval)
    } else {
      setEnergyWaves([])
    }
  }, [isRunning])

  // Shooting star effect on session completion with aurora
  useEffect(() => {
    if (sessions > 0) {
      const createShootingStar = () => {
        const newShootingStar = {
          id: Date.now() + Math.random(),
          startX: Math.random() * window.innerWidth,
          startY: -50,
          endX: Math.random() * window.innerWidth,
          endY: window.innerHeight + 50,
          progress: 0,
          trail: [],
          isAurora: Math.random() < 0.3 // 30% chance for aurora trail
        }
        
        setShootingStars(prev => [...prev, newShootingStar])
        
        setTimeout(() => {
          setShootingStars(prev => prev.filter(star => star.id !== newShootingStar.id))
        }, 3000)
      }
      
      // Create 5 shooting stars for session completion
      for (let i = 0; i < 5; i++) {
        setTimeout(createShootingStar, i * 400)
      }
    }
  }, [sessions])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const currentTime = Date.now() * 0.001
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw ethereal particle dust (deepest background layer)
      particleDust.forEach(dust => {
        const twinkle = Math.sin(currentTime * dust.twinkleSpeed + dust.twinkleOffset)
        const alpha = dust.opacity * (0.6 + 0.4 * twinkle) / dust.z // Depth fading
        const size = dust.size / dust.z
        
        // Parallax effect based on mouse position
        const parallaxX = dust.x + (mousePosition.current.x * dust.z * 2)
        const parallaxY = dust.y + (mousePosition.current.y * dust.z * 1.5)
        
        // Gentle drift
        dust.x += Math.cos(dust.driftAngle + currentTime * 0.1) * dust.driftSpeed
        dust.y += Math.sin(dust.driftAngle + currentTime * 0.1) * dust.driftSpeed
        
        // Wrap around
        if (dust.x < 0) dust.x = canvas.width
        if (dust.x > canvas.width) dust.x = 0
        if (dust.y < 0) dust.y = canvas.height
        if (dust.y > canvas.height) dust.y = 0
        
        // Draw dust particle with soft glow
        const dustGradient = ctx.createRadialGradient(
          parallaxX, parallaxY, 0,
          parallaxX, parallaxY, size * 3
        )
        dustGradient.addColorStop(0, `rgba(${dust.color.join(',')}, ${alpha})`)
        dustGradient.addColorStop(1, `rgba(${dust.color.join(',')}, 0)`)
        
        ctx.fillStyle = dustGradient
        ctx.beginPath()
        ctx.arc(parallaxX, parallaxY, size * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw cosmic wind (subtle flowing particles)
      setCosmicWind(prev => prev.map(wind => {
        wind.progress += wind.speed
        if (wind.progress > 1) wind.progress = 0
        
        const currentX = wind.x + (wind.targetX - wind.x) * wind.progress
        const currentY = wind.y + (wind.targetY - wind.y) * wind.progress + Math.sin(currentTime + wind.id) * 20
        
        // Draw wind particle
        ctx.fillStyle = `rgba(${wind.color.join(',')}, ${wind.opacity})`
        ctx.beginPath()
        ctx.arc(currentX, currentY, wind.size, 0, Math.PI * 2)
        ctx.fill()
        
        return wind
      }))

      // Update and draw floating orbs
      setFloatingOrbs(prev => prev.map(orb => {
        // Float movement
        orb.x += Math.cos(orb.floatAngle + currentTime * 0.2) * orb.floatSpeed
        orb.y += Math.sin(orb.floatAngle + currentTime * 0.15) * orb.floatSpeed * 0.7
        
        // Pulse effect
        const pulse = Math.sin(currentTime * orb.pulseSpeed + orb.pulseOffset) * 0.3 + 1
        const currentSize = orb.size * pulse
        
        // Add to trail
        orb.trail.push({ x: orb.x, y: orb.y, size: currentSize * 0.3, alpha: orb.opacity })
        if (orb.trail.length > 8) {
          orb.trail.shift()
        }
        
        // Draw trail
        orb.trail.forEach((point, index) => {
          const alpha = (index / orb.trail.length) * point.alpha * 0.3
          const trailGradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.size * 2
          )
          trailGradient.addColorStop(0, `rgba(${orb.color.join(',')}, ${alpha})`)
          trailGradient.addColorStop(1, `rgba(${orb.color.join(',')}, 0)`)
          
          ctx.fillStyle = trailGradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, point.size * 2, 0, Math.PI * 2)
          ctx.fill()
        })
        
        // Draw main orb with multiple layers
        for (let i = 0; i < 3; i++) {
          const layerSize = currentSize * (1 + i * 0.5)
          const layerAlpha = orb.opacity / (i + 1)
          
          const orbGradient = ctx.createRadialGradient(
            orb.x, orb.y, 0,
            orb.x, orb.y, layerSize
          )
          orbGradient.addColorStop(0, `rgba(${orb.color.join(',')}, ${layerAlpha})`)
          orbGradient.addColorStop(0.7, `rgba(${orb.color.join(',')}, ${layerAlpha * 0.3})`)
          orbGradient.addColorStop(1, `rgba(${orb.color.join(',')}, 0)`)
          
          ctx.fillStyle = orbGradient
          ctx.beginPath()
          ctx.arc(orb.x, orb.y, layerSize, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Wrap around edges
        if (orb.x < -orb.size) orb.x = canvas.width + orb.size
        if (orb.x > canvas.width + orb.size) orb.x = -orb.size
        if (orb.y < -orb.size) orb.y = canvas.height + orb.size
        if (orb.y > canvas.height + orb.size) orb.y = -orb.size
        
        return orb
      }))
      
      // Draw nebula clouds with enhanced effects
      nebulaClouds.forEach(nebula => {
        const cloudGradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0, 
          nebula.x, nebula.y, nebula.size
        )
        cloudGradient.addColorStop(0, `rgba(${nebula.color.join(',')}, ${nebula.opacity})`)
        cloudGradient.addColorStop(0.6, `rgba(${nebula.color.join(',')}, ${nebula.opacity * 0.4})`)
        cloudGradient.addColorStop(1, `rgba(${nebula.color.join(',')}, 0)`)
        
        ctx.fillStyle = cloudGradient
        ctx.beginPath()
        ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Drift the nebula
        nebula.x += Math.cos(nebula.driftAngle) * nebula.driftSpeed
        nebula.y += Math.sin(nebula.driftAngle) * nebula.driftSpeed
        
        // Wrap around edges
        if (nebula.x < -nebula.size) nebula.x = canvas.width + nebula.size
        if (nebula.x > canvas.width + nebula.size) nebula.x = -nebula.size
        if (nebula.y < -nebula.size) nebula.y = canvas.height + nebula.size
        if (nebula.y > canvas.height + nebula.size) nebula.y = -nebula.size
      })

      // Update and draw comets
      setComets(prev => prev.map(comet => {
        comet.progress += comet.speed
        if (comet.progress > 1) comet.progress = 0
        
        const currentX = comet.x + (comet.targetX - comet.x) * comet.progress
        const currentY = comet.y + (comet.targetY - comet.y) * comet.progress
        
        // Add to trail
        comet.trail.push({ x: currentX, y: currentY, alpha: 1 })
        if (comet.trail.length > comet.tailLength) {
          comet.trail.shift()
        }
        
        // Draw comet trail
        comet.trail.forEach((point, index) => {
          const alpha = (index / comet.trail.length) * 0.4
          const size = (index / comet.trail.length) * 3
          ctx.fillStyle = `rgba(135, 206, 250, ${alpha})`
          ctx.beginPath()
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
          ctx.fill()
        })
        
        // Draw comet head
        const cometGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 6)
        cometGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        cometGradient.addColorStop(1, 'rgba(135, 206, 250, 0)')
        
        ctx.fillStyle = cometGradient
        ctx.beginPath()
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2)
        ctx.fill()
        
        return comet
      }))

      // Draw energy waves during focus
      setEnergyWaves(prev => prev.map(wave => {
        wave.radius += 2
        wave.opacity *= 0.995
        
        if (wave.radius < wave.maxRadius) {
          ctx.strokeStyle = `rgba(${wave.color.join(',')}, ${wave.opacity * 0.3})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(wave.centerX, wave.centerY, wave.radius, 0, Math.PI * 2)
          ctx.stroke()
          
          // Inner ripple
          ctx.strokeStyle = `rgba(${wave.color.join(',')}, ${wave.opacity * 0.6})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(wave.centerX, wave.centerY, wave.radius * 0.7, 0, Math.PI * 2)
          ctx.stroke()
        }
        
        return wave
      }).filter(wave => wave.radius < wave.maxRadius && wave.opacity > 0.01))
      
      // Draw constellation lines (faint connections)
      ctx.strokeStyle = `rgba(100, 149, 237, ${isRunning ? 0.4 : 0.2})`
      ctx.lineWidth = 1
      
      const constellations = {}
      stars.forEach(star => {
        if (!constellations[star.constellation]) {
          constellations[star.constellation] = []
        }
        constellations[star.constellation].push(star)
      })
      
      // Draw constellation connections with glow effect
      Object.values(constellations).forEach(constellation => {
        if (constellation.length > 3) {
          for (let i = 0; i < constellation.length - 1; i++) {
            const star1 = constellation[i]
            const star2 = constellation[i + 1]
            const distance = Math.sqrt(
              Math.pow(star2.x - star1.x, 2) + Math.pow(star2.y - star1.y, 2)
            )
            
            if (distance < 180) {
              // Glow effect for constellation lines
              ctx.shadowColor = constellation === 'focus' ? '#FFD700' : '#6495ED'
              ctx.shadowBlur = constellation === 'focus' ? 10 : 5
              
              ctx.beginPath()
              ctx.moveTo(star1.x, star1.y)
              ctx.lineTo(star2.x, star2.y)
              ctx.stroke()
              
              ctx.shadowBlur = 0
            }
          }
        }
      })
      
      // Draw stars with enhanced effects
      stars.forEach(star => {
        const twinkle = Math.sin(currentTime * star.twinkleSpeed + star.twinkleOffset)
        const alpha = star.brightness * (0.7 + 0.3 * twinkle)
        
        let colorStr = star.color ? star.color.join(',') : '100, 149, 237'
        
        // Special pulsing effect for focus stars
        if (star.isFocusStar) {
          const pulse = Math.sin(currentTime * 2 + star.pulsePhase) * 0.3 + 1
          star.size = 4 * pulse
        }
        
        const size = star.size * (0.8 + 0.2 * twinkle)
        
        // Multiple glow layers for enhanced stars
        for (let i = 0; i < (star.isFocusStar ? 3 : 2); i++) {
          const glowRadius = size * (3 + i * 2)
          const glowAlpha = alpha / (i + 1)
          
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius)
          gradient.addColorStop(0, `rgba(${colorStr}, ${glowAlpha})`)
          gradient.addColorStop(1, `rgba(${colorStr}, 0)`)
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Inner bright core with lens flare effect
        ctx.fillStyle = `rgba(${colorStr}, ${alpha})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fill()
        
        // Enhanced light effects for bright stars
        if (star.brightness > 0.9) {
          // God rays (light beams)
          const rayCount = star.isFocusStar ? 8 : 4
          ctx.strokeStyle = `rgba(${colorStr}, ${alpha * 0.3})`
          ctx.lineWidth = 0.5
          
          for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2 + currentTime * 0.5
            const rayLength = size * (star.isFocusStar ? 40 : 25)
            
            // Gradient ray
            const rayGradient = ctx.createLinearGradient(
              star.x, star.y,
              star.x + Math.cos(angle) * rayLength,
              star.y + Math.sin(angle) * rayLength
            )
            rayGradient.addColorStop(0, `rgba(${colorStr}, ${alpha * 0.4})`)
            rayGradient.addColorStop(0.5, `rgba(${colorStr}, ${alpha * 0.2})`)
            rayGradient.addColorStop(1, `rgba(${colorStr}, 0)`)
            
            ctx.strokeStyle = rayGradient
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(star.x, star.y)
            ctx.lineTo(
              star.x + Math.cos(angle) * rayLength,
              star.y + Math.sin(angle) * rayLength
            )
            ctx.stroke()
          }
          
          // Cross flare for diamond stars
          if (Math.random() < 0.2) {
            ctx.strokeStyle = `rgba(${colorStr}, ${alpha * 0.8})`
            ctx.lineWidth = 2
            ctx.shadowColor = `rgba(${colorStr}, ${alpha})`
            ctx.shadowBlur = 10
            
            ctx.beginPath()
            ctx.moveTo(star.x - size * 6, star.y)
            ctx.lineTo(star.x + size * 6, star.y)
            ctx.moveTo(star.x, star.y - size * 6)
            ctx.lineTo(star.x, star.y + size * 6)
            ctx.stroke()
            
            ctx.shadowBlur = 0
          }
        }
        
        // Subtle lens flare for all bright stars
        if (star.brightness > 0.7) {
          const flareSize = size * 0.3
          const flareDistance = size * 8
          const flareAngle = Math.atan2(
            star.y - canvas.height / 2,
            star.x - canvas.width / 2
          )
          
          const flareX = star.x + Math.cos(flareAngle) * flareDistance
          const flareY = star.y + Math.sin(flareAngle) * flareDistance
          
          const flareGradient = ctx.createRadialGradient(
            flareX, flareY, 0,
            flareX, flareY, flareSize * 3
          )
          flareGradient.addColorStop(0, `rgba(${colorStr}, ${alpha * 0.3})`)
          flareGradient.addColorStop(1, `rgba(${colorStr}, 0)`)
          
          ctx.fillStyle = flareGradient
          ctx.beginPath()
          ctx.arc(flareX, flareY, flareSize * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      
      // Draw enhanced shooting stars with aurora effects
      setShootingStars(prev => 
        prev.map(star => {
          star.progress += 0.025
          
          const currentX = star.startX + (star.endX - star.startX) * star.progress
          const currentY = star.startY + (star.endY - star.startY) * star.progress
          
          // Add to trail
          star.trail.push({ x: currentX, y: currentY, time: currentTime })
          if (star.trail.length > (star.isAurora ? 25 : 20)) {
            star.trail.shift()
          }
          
          // Draw enhanced trail
          star.trail.forEach((point, index) => {
            const alpha = (index / star.trail.length) * 0.9
            const size = (index / star.trail.length) * (star.isAurora ? 4 : 3)
            
            if (star.isAurora) {
              // Aurora shooting star with color shifting
              const hue = (point.time * 2 + index * 0.1) % 1
              const r = Math.sin(hue * Math.PI * 2) * 127 + 128
              const g = Math.sin((hue + 0.33) * Math.PI * 2) * 127 + 128
              const b = Math.sin((hue + 0.66) * Math.PI * 2) * 127 + 128
              
              // Multiple aurora layers
              for (let layer = 0; layer < 3; layer++) {
                const layerAlpha = alpha / (layer + 1)
                const layerSize = size * (layer + 1)
                
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.3})`
                ctx.beginPath()
                ctx.arc(point.x, point.y, layerSize, 0, Math.PI * 2)
                ctx.fill()
              }
            } else {
              // Regular shooting star
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
              ctx.beginPath()
              ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
              ctx.fill()
              
              // Blue tint for regular stars
              ctx.fillStyle = `rgba(135, 206, 250, ${alpha * 0.5})`
              ctx.beginPath()
              ctx.arc(point.x, point.y, size * 0.7, 0, Math.PI * 2)
              ctx.fill()
            }
          })
          
          // Draw main shooting star with enhanced effects
          if (star.isAurora) {
            // Aurora shooting star head - multicolored
            const hue = currentTime * 3
            const r = Math.sin(hue) * 127 + 128
            const g = Math.sin(hue + 2) * 127 + 128
            const b = Math.sin(hue + 4) * 127 + 128
            
            // Multiple glow layers
            for (let i = 0; i < 4; i++) {
              const glowSize = 12 + i * 4
              const glowAlpha = 0.8 / (i + 1)
              
              const auroraGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, glowSize)
              auroraGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowAlpha})`)
              auroraGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
              
              ctx.fillStyle = auroraGradient
              ctx.beginPath()
              ctx.arc(currentX, currentY, glowSize, 0, Math.PI * 2)
              ctx.fill()
            }
          } else {
            // Regular shooting star head with sparkle effect
            const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 10)
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
            gradient.addColorStop(0.3, 'rgba(135, 206, 250, 0.8)')
            gradient.addColorStop(1, 'rgba(135, 206, 250, 0)')
            
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(currentX, currentY, 10, 0, Math.PI * 2)
            ctx.fill()
            
            // Sparkle cross effect
            ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(currentX - 15, currentY)
            ctx.lineTo(currentX + 15, currentY)
            ctx.moveTo(currentX, currentY - 15)
            ctx.lineTo(currentX, currentY + 15)
            ctx.stroke()
          }
          
          return star
        }).filter(star => star.progress < 1)
      )
    }
    
    const interval = setInterval(animate, 50) // 20 FPS for smooth animation
    return () => clearInterval(interval)
  }, [stars, isRunning])

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.8
      }}
    />
  )
}

// Enhanced HUD with Glass Morphism
function EnhancedHUD({ time, setTime, isRunning, setIsRunning, sessions }) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isMobile = windowSize.width < 768
  
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '20px',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  }

  return (
    <>
      {/* Header */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px', 
        ...glassStyle,
        zIndex: 1000
      }}>
        <div style={{ 
          fontSize: isMobile ? '20px' : '24px', 
          fontWeight: '700', 
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #ffffff, #e0f0ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CHRONO.SPHERE
        </div>
        <div style={{ 
          fontSize: '14px', 
          opacity: 0.8,
          fontWeight: '400'
        }}>
          Advanced Focus System
        </div>
      </div>
      
      {/* Main Timer */}
      <div style={{ 
        position: 'fixed', 
        bottom: '40px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        ...glassStyle,
        textAlign: 'center',
        minWidth: isMobile ? '280px' : '320px',
        zIndex: 1000
      }}>
        <div style={{ 
          fontSize: isMobile ? '48px' : '64px', 
          fontWeight: '300', 
          marginBottom: '16px',
          fontFamily: 'Space Grotesk, sans-serif',
          background: 'linear-gradient(135deg, #ffffff, #a0c4ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {formatTime(time)}
        </div>
        
        <div style={{ 
          fontSize: '16px', 
          marginBottom: '24px', 
          opacity: 0.9,
          fontWeight: '500'
        }}>
          {isRunning ? 'Focus Mode Active' : 'Ready to Focus'}
        </div>
        
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: isRunning ? 
              'linear-gradient(135deg, #ff6b6b, #ff8787)' : 
              'linear-gradient(135deg, #4ecdc4, #44a08d)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: isMobile ? '12px 32px' : '16px 40px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isRunning ? 'Pause' : 'Start Focus'}
        </button>
      </div>
      
      {/* Stats Panel */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        ...glassStyle,
        zIndex: 1000
      }}>
        <div style={{ 
          fontSize: '14px', 
          opacity: 0.8, 
          marginBottom: '12px',
          fontWeight: '500'
        }}>
          Today's Progress
        </div>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          {sessions} Sessions
        </div>
        <div style={{ 
          fontSize: '14px', 
          opacity: 0.7,
          fontWeight: '400'
        }}>
          {Math.floor(sessions * 25 / 60)}h {(sessions * 25) % 60}m focused
        </div>
      </div>

      {/* Portal Navigation Hint */}
      {sessions > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '40px', 
          right: '20px', 
          ...glassStyle,
          maxWidth: '200px',
          zIndex: 1000
        }}>
          <div style={{ 
            fontSize: '14px', 
            opacity: 0.9,
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            🌀 Portals Unlocked
          </div>
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.7,
            lineHeight: '1.4'
          }}>
            Click the sphere to explore new dimensions
          </div>
        </div>
      )}
    </>
  )
}

// Main App
export default function AppIntegrated() {
  const [time, setTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)

  useEffect(() => {
    if (isRunning && time > 0) {
      const interval = setInterval(() => {
        setTime(t => t - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (time === 0) {
      setIsRunning(false)
      setSessions(s => s + 1)
      setTime(25 * 60)
    }
  }, [isRunning, time])

  const timerProgress = ((25 * 60 - time) / (25 * 60)) * 100

  return (
    <div style={{
      width: '100vw',
      height: '100vh', 
      background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 70%, #000000 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Galaxy */}
      <BackgroundGalaxy 
        timerProgress={timerProgress}
        isRunning={isRunning}
        sessions={sessions}
      />
      
      {/* 3D Scene */}
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ zIndex: 10 }}
      >
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.3} color="#b3d9ff" />
        <directionalLight position={[5, 5, 5]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-3, -2, 4]} intensity={0.6} color="#4a90e2" />
        <pointLight position={[0, 0, 0]} intensity={0.4} color="#80e0ff" />
        <pointLight position={[10, -10, -5]} intensity={0.3} color="#a0c4ff" />
        <pointLight position={[-8, 8, 3]} intensity={0.25} color="#e0f0ff" />
        
        <Suspense fallback={null}>
          <SimpleLiquidMetalSphere />
          <CameraControls />
        </Suspense>
      </Canvas>
      
      {/* Enhanced HUD */}
      <EnhancedHUD 
        time={time}
        setTime={setTime}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        sessions={sessions}
      />
    </div>
  )
}