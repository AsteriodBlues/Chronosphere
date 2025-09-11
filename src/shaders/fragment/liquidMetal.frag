// Liquid Metal Fragment Shader
precision highp float;

// Varyings from vertex shader
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying float vDisplacement;
varying float vNoiseValue;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

// Uniforms
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

// Include lighting functions
#pragma glslify: fresnelSchlick = require(../utils/lighting.glsl)
#pragma glslify: fresnelSchlickRoughness = require(../utils/lighting.glsl)
#pragma glslify: distributionGGX = require(../utils/lighting.glsl)
#pragma glslify: geometrySmith = require(../utils/lighting.glsl)
#pragma glslify: cookTorranceBRDF = require(../utils/lighting.glsl)
#pragma glslify: multiLayerRim = require(../utils/lighting.glsl)
#pragma glslify: iridescence = require(../utils/lighting.glsl)

// Chromatic aberration for RGB channel separation
vec3 chromaticAberration(vec3 color, vec2 uv, float amount) {
  vec2 r_offset = vec2(amount, 0.0);
  vec2 g_offset = vec2(0.0, 0.0);
  vec2 b_offset = vec2(-amount, 0.0);
  
  float r = texture2D(uEnvMap, vPosition + vec3(r_offset, 0.0)).r;
  float g = texture2D(uEnvMap, vPosition + vec3(g_offset, 0.0)).g;
  float b = texture2D(uEnvMap, vPosition + vec3(b_offset, 0.0)).b;
  
  return vec3(r, g, b);
}

// Calculate state-based color
vec3 getStateColor() {
  vec3 liquidColor = vec3(0.15, 0.2, 0.25); // Dark mercury
  vec3 crystalColor = vec3(0.7, 0.85, 1.0); // Ice blue
  vec3 plasmaColor = vec3(1.0, 0.3, 0.1); // Orange plasma
  
  vec3 color = uBaseColor;
  
  if(uShaderState == 0) {
    color = liquidColor;
  } else if(uShaderState == 1) {
    color = crystalColor;
  } else if(uShaderState == 2) {
    color = plasmaColor;
  }
  
  // Smooth transition between states
  return mix(uBaseColor, color, uStateTransition);
}

// Main lighting calculation
vec3 calculateLighting(vec3 albedo, vec3 normal, vec3 viewDir, float metallic, float roughness) {
  vec3 lightDir = normalize(uLightPosition - vWorldPosition);
  vec3 halfVector = normalize(viewDir + lightDir);
  
  // PBR calculations
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, albedo, metallic);
  
  // Fresnel
  vec3 F = fresnelSchlick(max(dot(halfVector, viewDir), 0.0), F0);
  
  // Distribution
  float NDF = distributionGGX(normal, halfVector, roughness);
  
  // Geometry
  float G = geometrySmith(normal, viewDir, lightDir, roughness);
  
  // BRDF
  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, lightDir), 0.0) + 0.0001;
  vec3 specular = numerator / denominator;
  
  // Energy conservation
  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - metallic;
  
  float NdotL = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = kD * albedo / 3.14159265359;
  
  vec3 color = (diffuse + specular) * uLightColor * uLightIntensity * NdotL;
  
  return color;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  
  // Get state-based base color
  vec3 baseColor = getStateColor();
  
  // Add noise-based color variation
  vec3 colorVariation = vec3(vNoiseValue * 0.05, vNoiseValue * 0.03, vNoiseValue * 0.08);
  baseColor += colorVariation;
  
  // State-based material properties
  float metalness = uMetalness;
  float roughness = uRoughness;
  
  if(uShaderState == 0) { // Liquid
    metalness = 0.95;
    roughness = 0.15;
  } else if(uShaderState == 1) { // Crystal
    metalness = 0.5;
    roughness = 0.05;
  } else if(uShaderState == 2) { // Plasma
    metalness = 0.8;
    roughness = 0.3;
  }
  
  // Calculate main lighting
  vec3 lighting = calculateLighting(baseColor, normal, viewDir, metalness, roughness);
  
  // Environment reflections
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 envColor = textureCube(uEnvMap, reflectDir).rgb;
  
  // Roughness-based env map blur (simple approximation)
  float mipLevel = roughness * 8.0;
  envColor = textureCube(uEnvMap, reflectDir, mipLevel).rgb;
  
  // Fresnel for reflections
  vec3 F = fresnelSchlickRoughness(max(dot(normal, viewDir), 0.0), vec3(0.04), roughness);
  vec3 reflection = envColor * F * uEnvMapIntensity;
  
  // Multi-layer rim lighting
  float rim = 1.0 - max(dot(normal, viewDir), 0.0);
  float rim1 = pow(rim, uRimPower) * uRimIntensity;
  float rim2 = pow(rim, uRimPower * 2.0) * uRimIntensity * 0.5;
  
  vec3 rimColor = uRimColor * rim1;
  
  // State-specific rim colors
  if(uShaderState == 0) { // Liquid - blue rim
    rimColor += vec3(0.0, 0.3, 1.0) * rim2;
  } else if(uShaderState == 1) { // Crystal - white rim
    rimColor += vec3(1.0, 1.0, 1.0) * rim2;
  } else if(uShaderState == 2) { // Plasma - orange rim
    rimColor += vec3(1.0, 0.5, 0.0) * rim2;
  }
  
  // Iridescent effect
  vec3 irid = iridescence(normal, viewDir, uIridescence);
  
  // Combine all lighting
  vec3 finalColor = lighting + reflection + rimColor + irid;
  
  // Chromatic aberration at edges
  float edgeFactor = pow(rim, 2.0);
  if(uChromaticAberration > 0.001) {
    vec3 aberration = vec3(
      finalColor.r * (1.0 + edgeFactor * uChromaticAberration),
      finalColor.g,
      finalColor.b * (1.0 - edgeFactor * uChromaticAberration)
    );
    finalColor = mix(finalColor, aberration, 0.5);
  }
  
  // Add emissive for plasma state
  if(uShaderState == 2) {
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    finalColor += baseColor * pulse * 0.5;
  }
  
  // Tone mapping and gamma correction
  finalColor = finalColor / (finalColor + vec3(1.0));
  finalColor = pow(finalColor, vec3(1.0/2.2));
  
  gl_FragColor = vec4(finalColor, 1.0);
}