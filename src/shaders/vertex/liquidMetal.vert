// Liquid Metal Vertex Shader
precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
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
uniform int uShaderState; // 0: liquid, 1: crystal, 2: plasma

// Varyings
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying float vDisplacement;
varying float vNoiseValue;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

// Include noise functions
#pragma glslify: snoise = require(../utils/noise.glsl)
#pragma glslify: turbulence = require(../utils/noise.glsl)
#pragma glslify: flowNoise = require(../utils/noise.glsl)

// Calculate displacement based on shader state
float calculateDisplacement(vec3 pos, float time) {
  float displacement = 0.0;
  
  if(uShaderState == 0) { // Liquid state
    // Multi-octave noise for organic movement
    float primaryWave = snoise(pos * uNoiseFrequency + time * uFlowSpeed) * uNoiseAmplitude;
    float secondaryDetail = snoise(pos * uNoiseFrequency * 3.0 + time * uFlowSpeed * 1.5) * uNoiseAmplitude * 0.4;
    float tertiaryMicro = snoise(pos * uNoiseFrequency * 8.0 + time * uFlowSpeed * 2.0) * uNoiseAmplitude * 0.1;
    
    // Vertical flow pattern
    float verticalFlow = sin(pos.y * 2.0 + time * uFlowSpeed) * 0.1;
    
    // Spiral rotation
    float angle = atan(pos.z, pos.x);
    float spiralFlow = sin(angle * 3.0 + pos.y * 2.0 + time * uFlowSpeed * 0.5) * 0.05;
    
    displacement = primaryWave + secondaryDetail + tertiaryMicro + verticalFlow + spiralFlow;
    
    // Apply surface tension
    displacement = smoothstep(-1.0, 1.0, displacement) * 2.0 - 1.0;
    displacement *= uNoiseAmplitude;
    
  } else if(uShaderState == 1) { // Crystal state
    // Faceted, geometric displacement
    vec3 facetPos = floor(pos * 8.0) / 8.0;
    float facetNoise = snoise(facetPos + time * 0.1);
    
    // Sharp, angular patterns
    float crystalPattern = step(0.5, fract(pos.x * 10.0 + pos.y * 10.0 + pos.z * 10.0));
    
    displacement = facetNoise * crystalPattern * uNoiseAmplitude * 0.5;
    
  } else if(uShaderState == 2) { // Plasma state
    // Turbulent, chaotic movement
    float turbulentNoise = turbulence(pos * uNoiseFrequency * 2.0, 1.0, 1.0, 4);
    
    // Energy pulses
    float pulseWave = sin(length(pos) * 5.0 - time * uFlowSpeed * 3.0) * 0.2;
    
    // Random spikes
    float spikes = step(0.98, snoise(pos * 20.0 + time)) * 0.5;
    
    displacement = (turbulentNoise + pulseWave + spikes) * uNoiseAmplitude * 1.5;
  }
  
  // Breathing modulation
  float breathing = sin(time * 0.5) * uBreathingIntensity;
  displacement += breathing * 0.1;
  
  return displacement * uDisplacementScale;
}

// Recalculate normal after displacement
vec3 calculateDisplacedNormal(vec3 pos, vec3 originalNormal, float displacement) {
  float delta = 0.01;
  
  // Sample neighboring points
  vec3 neighborX = pos + vec3(delta, 0.0, 0.0);
  vec3 neighborZ = pos + vec3(0.0, 0.0, delta);
  
  float displacementX = calculateDisplacement(neighborX, uTime);
  float displacementZ = calculateDisplacement(neighborZ, uTime);
  
  // Calculate gradient
  vec3 gradX = vec3(delta, displacementX - displacement, 0.0);
  vec3 gradZ = vec3(0.0, displacementZ - displacement, delta);
  
  // New normal from cross product
  vec3 newNormal = normalize(cross(gradZ, gradX));
  
  // Blend with original normal for stability
  return normalize(mix(originalNormal, newNormal, 0.5));
}

void main() {
  vUv = uv;
  
  // Calculate displacement
  vNoiseValue = snoise(position * uNoiseFrequency + uTime * uFlowSpeed);
  vDisplacement = calculateDisplacement(position, uTime);
  
  // Displace position along normal
  vec3 displacedPosition = position + normal * vDisplacement;
  
  // Recalculate normal for displaced surface
  vec3 displacedNormal = calculateDisplacedNormal(position, normal, vDisplacement);
  
  // Transform to world space
  vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
  vWorldPosition = worldPosition.xyz;
  vPosition = worldPosition.xyz;
  
  // Transform normal
  vNormal = normalize(normalMatrix * displacedNormal);
  
  // View space position for effects
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = mvPosition.xyz;
  
  // Final position
  gl_Position = projectionMatrix * mvPosition;
}