import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { LiquidMetalShader, ShaderStates } from '../../shaders/LiquidMetalShader'
import { useShaderAnimation } from '../../hooks/shader/useShaderAnimation'
import { shaderPresets, colorPresets, animationSequences } from '../../utils/shaderPresets'
import LODManager from '../shader/LODManager'
import { useTimerStore } from '../../stores/timerStore'

extend({ OrbitControls: ThreeOrbitControls })

// Load simplified shaders for now (without glslify)
const vertexShader = `
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying float vDisplacement;
varying float vNoiseValue;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uTime;
uniform float uDisplacementScale;
uniform float uNoiseFrequency;
uniform float uNoiseAmplitude;
uniform float uBreathingIntensity;
uniform float uFlowSpeed;
uniform float uStateTransition;
uniform int uShaderState;

// Simplex noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float calculateDisplacement(vec3 pos, float time) {
  float displacement = 0.0;
  
  // Multi-octave noise
  float freq = uNoiseFrequency;
  float amp = uNoiseAmplitude;
  
  for(int i = 0; i < 3; i++) {
    displacement += snoise(pos * freq + time * uFlowSpeed) * amp;
    freq *= 2.0;
    amp *= 0.5;
  }
  
  // Breathing modulation
  float breathing = sin(time * 0.5) * uBreathingIntensity;
  displacement += breathing * 0.1;
  
  // State-specific patterns
  if(uShaderState == 1) { // Crystal
    displacement *= 0.5;
  } else if(uShaderState == 2) { // Plasma
    displacement *= 1.5;
    displacement += sin(length(pos) * 5.0 - time * 3.0) * 0.1;
  }
  
  return displacement * uDisplacementScale;
}

void main() {
  vUv = uv;
  
  vNoiseValue = snoise(position * uNoiseFrequency + uTime * uFlowSpeed);
  vDisplacement = calculateDisplacement(position, uTime);
  
  vec3 displacedPosition = position + normal * vDisplacement;
  
  vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
  vWorldPosition = worldPosition.xyz;
  vPosition = worldPosition.xyz;
  
  vNormal = normalize(normalMatrix * normal);
  
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = `
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying float vDisplacement;
varying float vNoiseValue;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

uniform vec3 uCameraPosition;
uniform float uTime;
uniform float uMetalness;
uniform float uRoughness;
uniform vec3 uBaseColor;
uniform float uRimPower;
uniform float uRimIntensity;
uniform vec3 uRimColor;
uniform float uChromaticAberration;
uniform float uIridescence;
uniform samplerCube uEnvMap;
uniform float uEnvMapIntensity;
uniform int uShaderState;
uniform float uStateTransition;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  
  // Base color with noise variation
  vec3 baseColor = uBaseColor;
  baseColor += vec3(vNoiseValue * 0.05);
  
  // Simple metallic shading
  vec3 lightDir = normalize(uLightPosition - vWorldPosition);
  float NdotL = max(dot(normal, lightDir), 0.0);
  
  vec3 halfDir = normalize(viewDir + lightDir);
  float NdotH = max(dot(normal, halfDir), 0.0);
  float specular = pow(NdotH, 32.0) * uMetalness;
  
  vec3 diffuse = baseColor * NdotL;
  vec3 spec = vec3(1.0) * specular;
  
  // Fresnel rim lighting
  float rim = 1.0 - max(dot(normal, viewDir), 0.0);
  rim = pow(rim, uRimPower) * uRimIntensity;
  vec3 rimLight = uRimColor * rim;
  
  // Environment reflection
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 envColor = vec3(0.2, 0.3, 0.4); // Simplified env color
  
  // Combine lighting
  vec3 finalColor = diffuse + spec + rimLight + envColor * uEnvMapIntensity * uMetalness;
  
  // Chromatic aberration at edges
  if(uChromaticAberration > 0.001) {
    float edgeFactor = pow(rim, 2.0);
    finalColor.r *= 1.0 + edgeFactor * uChromaticAberration;
    finalColor.b *= 1.0 - edgeFactor * uChromaticAberration;
  }
  
  // Iridescence
  if(uIridescence > 0.001) {
    float angle = acos(dot(normal, viewDir));
    vec3 iridColor = vec3(
      sin(angle * 10.0) * 0.5 + 0.5,
      sin(angle * 15.0 + 2.0) * 0.5 + 0.5,
      sin(angle * 20.0 + 4.0) * 0.5 + 0.5
    );
    finalColor += iridColor * uIridescence * rim;
  }
  
  // State-specific effects
  if(uShaderState == 2) { // Plasma
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    finalColor += baseColor * pulse * 0.3;
  }
  
  // Tone mapping
  finalColor = finalColor / (finalColor + vec3(1.0));
  finalColor = pow(finalColor, vec3(1.0/2.2));
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`

export default function LiquidMetalSphere() {
  const meshRef = useRef()
  const shaderRef = useRef()
  const controlsRef = useRef()
  const { camera, gl } = useThree()
  
  const [currentLOD, setCurrentLOD] = useState('LOD0')
  const [envMap, setEnvMap] = useState(null)
  
  const { 
    timerState, 
    timeRemaining, 
    duration,
    sessionType 
  } = useTimerStore()
  
  // Create shader material
  const material = useMemo(() => {
    if (!shaderRef.current) {
      shaderRef.current = new LiquidMetalShader()
      // Override with simplified shaders
      shaderRef.current.material.vertexShader = vertexShader
      shaderRef.current.material.fragmentShader = fragmentShader
    }
    return shaderRef.current.material
  }, [])
  
  const shaderAnimation = useShaderAnimation(shaderRef.current)
  
  // Load environment map
  useEffect(() => {
    const loader = new RGBELoader()
    loader.load(
      '/textures/environment.hdr',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        setEnvMap(texture)
        if (shaderRef.current) {
          shaderRef.current.setEnvironmentMap(texture)
        }
      },
      undefined,
      (error) => {
        console.log('HDR environment not found, using default')
      }
    )
  }, [])
  
  // Camera controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = 3
      controlsRef.current.maxDistance = 20
      controlsRef.current.enableDamping = true
      controlsRef.current.dampingFactor = 0.05
      controlsRef.current.autoRotate = timerState === 'idle'
      controlsRef.current.autoRotateSpeed = 0.5
    }
  }, [timerState])
  
  // Update shader state based on timer
  useEffect(() => {
    if (!shaderRef.current) return
    
    let targetState = ShaderStates.LIQUID
    let preset = shaderPresets.idle
    
    switch (timerState) {
      case 'focus':
        targetState = ShaderStates.CRYSTAL
        preset = shaderPresets.focus
        break
      case 'break':
        targetState = ShaderStates.PLASMA
        preset = shaderPresets.break
        break
      case 'flow':
        targetState = ShaderStates.CRYSTAL
        preset = shaderPresets.flow
        break
      case 'quantum':
        targetState = ShaderStates.PLASMA
        preset = shaderPresets.quantum
        break
      default:
        targetState = ShaderStates.LIQUID
        preset = shaderPresets.idle
    }
    
    shaderRef.current.setState(targetState, 2.0)
    
    // Animate to preset values
    Object.entries(preset.uniforms).forEach(([key, value]) => {
      shaderAnimation.animate(key, shaderRef.current.uniforms[key].value, value, preset.duration, {
        easing: preset.easing
      })
    })
  }, [timerState, shaderAnimation])
  
  // Handle LOD changes
  const handleLODChange = (newLOD, config) => {
    setCurrentLOD(newLOD)
    
    if (meshRef.current) {
      // Update geometry detail
      const segments = config.vertexCount
      meshRef.current.geometry = new THREE.SphereGeometry(2, segments, segments)
    }
    
    if (shaderRef.current) {
      // Toggle effects based on LOD
      shaderRef.current.uniforms.uChromaticAberration.value = 
        config.effects.chromaticAberration ? 0.01 : 0
      shaderRef.current.uniforms.uIridescence.value = 
        config.effects.iridescence ? 0.3 : 0
    }
  }
  
  // Animation loop
  useFrame((state, delta) => {
    if (!shaderRef.current) return
    
    // Update shader
    shaderRef.current.update(delta, camera)
    
    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update()
    }
    
    // Timer-based effects
    const progress = duration > 0 ? (duration - timeRemaining) / duration : 0
    
    // Pulse when timer ending
    if (timeRemaining < 60 && timeRemaining > 0) {
      const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5
      shaderRef.current.uniforms.uRimIntensity.value = 0.8 + pulse * 0.4
    }
    
    // Breathing effect
    const breathingSpeed = timerState === 'focus' ? 0.8 : 0.5
    shaderRef.current.setBreathing(0.1, breathingSpeed)
  })
  
  return (
    <LODManager profile="high" onLODChange={handleLODChange}>
      <orbitControls ref={controlsRef} args={[camera, gl.domElement]} />
      
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>
      
      {/* Particle system inside sphere */}
      <InternalParticles timerState={timerState} />
    </LODManager>
  )
}

// Internal particle system
function InternalParticles({ timerState, count = 1000 }) {
  const pointsRef = useRef()
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = radius * Math.cos(phi)
      
      const hue = timerState === 'focus' ? 0.6 : timerState === 'break' ? 0.3 : 0.5
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5 + Math.random() * 0.5)
      col[i3] = color.r
      col[i3 + 1] = color.g
      col[i3 + 2] = color.b
    }
    
    return [pos, col]
  }, [count, timerState])
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      pointsRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}