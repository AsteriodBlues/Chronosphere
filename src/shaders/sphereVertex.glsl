uniform float time;
uniform float breathingPhase;
uniform float deformationStrength;
uniform vec3 mousePosition;
uniform float mouseInfluence;

attribute float phase;
attribute float deformation;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDeformation;
varying float vDistance;

void main() {
  vec3 pos = position;
  vec3 norm = normal;
  
  // Breathing animation
  float breathing = sin(breathingPhase) * 0.05 + 1.0;
  pos *= breathing;
  
  // Individual vertex floating
  float vertexPhase = phase + time * 0.5;
  pos += norm * sin(vertexPhase) * 0.02;
  
  // Mouse interaction deformation
  float distanceToMouse = distance(pos, mousePosition);
  float influence = smoothstep(1.0, 0.0, distanceToMouse / 2.0);
  float mouseDeform = influence * mouseInfluence * 0.3;
  pos += norm * mouseDeform;
  
  // Store deformation for fragment shader
  vDeformation = deformation + mouseDeform;
  vDistance = distanceToMouse;
  
  // Calculate world position
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vPosition = worldPosition.xyz;
  
  // Transform normal
  vNormal = normalize(normalMatrix * norm);
  vUv = uv;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}