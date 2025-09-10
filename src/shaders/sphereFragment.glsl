uniform float time;
uniform vec3 color;
uniform float metalness;
uniform float roughness;
uniform float opacity;
uniform float glowIntensity;
uniform vec3 emissiveColor;
uniform samplerCube envMap;
uniform int materialType; // 0: liquid, 1: crystal, 2: plasma, 3: glass, 4: diamond

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDeformation;
varying float vDistance;

// Fresnel calculation
float fresnel(vec3 viewDirection, vec3 normal, float power) {
  return pow(1.0 - abs(dot(viewDirection, normal)), power);
}

// Noise function for surface variation
float noise(vec3 p) {
  return sin(p.x * 10.0) * sin(p.y * 10.0) * sin(p.z * 10.0) * 0.1;
}

// Calculate environment reflection
vec3 getEnvironmentReflection(vec3 viewDir, vec3 normal) {
  vec3 reflected = reflect(viewDir, normal);
  return textureCube(envMap, reflected).rgb;
}

void main() {
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  vec3 normal = normalize(vNormal);
  
  // Base color
  vec3 baseColor = color;
  
  // Surface variation based on deformation
  float surfaceVariation = noise(vPosition + time * 0.1) * (1.0 + vDeformation);
  
  // Material-specific calculations
  vec3 finalColor = baseColor;
  float finalOpacity = opacity;
  float finalMetalness = metalness;
  float finalRoughness = roughness;
  
  if (materialType == 0) { // Liquid mercury
    // Highly reflective with subtle color shifts
    finalMetalness = 0.9 + surfaceVariation * 0.1;
    finalRoughness = 0.1 - surfaceVariation * 0.05;
    
    // Add liquid mercury shimmer
    float shimmer = sin(time * 5.0 + vPosition.x * 20.0) * 0.1;
    finalColor = mix(baseColor, vec3(0.8, 0.85, 0.9), shimmer);
    
  } else if (materialType == 1) { // Crystal
    // Sharp, clear with internal reflections
    finalMetalness = 0.1;
    finalRoughness = 0.0;
    finalOpacity = 0.7 + sin(time * 2.0) * 0.1;
    
    // Crystal internal structure
    float crystal = sin(vPosition.x * 15.0) * sin(vPosition.y * 15.0) * sin(vPosition.z * 15.0);
    finalColor = mix(baseColor, vec3(0.9, 0.95, 1.0), crystal * 0.3);
    
  } else if (materialType == 2) { // Plasma
    // Glowing, energetic
    finalMetalness = 0.0;
    finalRoughness = 0.2;
    
    // Plasma energy waves
    float plasma = sin(time * 8.0 + length(vPosition) * 10.0) * 0.5 + 0.5;
    vec3 plasmaColor = mix(emissiveColor, emissiveColor * 2.0, plasma);
    finalColor = mix(baseColor, plasmaColor, 0.8);
    
  } else if (materialType == 3) { // Glass
    // Transparent with subtle tinting
    finalMetalness = 0.0;
    finalRoughness = 0.0;
    finalOpacity = 0.3;
    
  } else if (materialType == 4) { // Diamond
    // Maximum refraction and brilliance
    finalMetalness = 0.0;
    finalRoughness = 0.0;
    finalOpacity = 0.8;
    
    // Diamond facet simulation
    float facets = abs(sin(vPosition.x * 30.0)) * abs(sin(vPosition.y * 30.0)) * abs(sin(vPosition.z * 30.0));
    finalColor = mix(baseColor, vec3(1.0), facets * 0.3);
  }
  
  // Fresnel effect for all materials
  float fresnelEffect = fresnel(viewDirection, normal, 2.0);
  
  // Environment reflection
  vec3 envReflection = getEnvironmentReflection(viewDirection, normal);
  finalColor = mix(finalColor, envReflection, finalMetalness * fresnelEffect);
  
  // Rim lighting effect
  float rimLight = pow(1.0 - abs(dot(viewDirection, normal)), 3.0);
  vec3 rimColor = vec3(0.5, 0.8, 1.0) * rimLight * glowIntensity;
  finalColor += rimColor;
  
  // Mouse interaction glow
  if (vDistance < 1.0) {
    float mouseGlow = smoothstep(1.0, 0.0, vDistance) * 0.5;
    finalColor += vec3(mouseGlow * 0.3, mouseGlow * 0.6, mouseGlow);
  }
  
  // Deformation highlighting
  if (vDeformation > 0.01) {
    finalColor += vec3(vDeformation * 0.5, vDeformation * 0.3, vDeformation * 0.8);
  }
  
  gl_FragColor = vec4(finalColor, finalOpacity);
}