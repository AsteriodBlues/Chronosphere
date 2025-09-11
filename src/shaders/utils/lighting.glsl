// PBR Lighting Functions for Liquid Metal
#define PI 3.14159265359

// Fresnel Schlick approximation
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Fresnel Schlick with roughness
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
  return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// GGX/Trowbridge-Reitz normal distribution
float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  
  float num = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  
  return num / denom;
}

// Smith's Geometry function
float geometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  
  float num = NdotV;
  float denom = NdotV * (1.0 - k) + k;
  
  return num / denom;
}

// Smith's Geometry with occlusion and shadowing
float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = geometrySchlickGGX(NdotV, roughness);
  float ggx1 = geometrySchlickGGX(NdotL, roughness);
  
  return ggx1 * ggx2;
}

// Cook-Torrance BRDF
vec3 cookTorranceBRDF(vec3 N, vec3 V, vec3 L, vec3 albedo, float metallic, float roughness) {
  vec3 H = normalize(V + L);
  
  // Calculate reflectance at normal incidence
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, albedo, metallic);
  
  // Calculate Fresnel
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
  
  // Calculate normal distribution
  float NDF = distributionGGX(N, H, roughness);
  
  // Calculate geometry
  float G = geometrySmith(N, V, L, roughness);
  
  // Calculate BRDF
  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
  vec3 specular = numerator / denominator;
  
  // Energy conservation
  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - metallic;
  
  float NdotL = max(dot(N, L), 0.0);
  
  return (kD * albedo / PI + specular) * NdotL;
}

// Enhanced rim lighting with multiple layers
vec3 multiLayerRim(vec3 N, vec3 V, vec3 rimColor1, vec3 rimColor2, float power1, float power2, float intensity) {
  float rim1 = 1.0 - max(dot(N, V), 0.0);
  float rim2 = rim1;
  
  rim1 = pow(rim1, power1) * intensity;
  rim2 = pow(rim2, power2) * intensity * 0.5;
  
  return rimColor1 * rim1 + rimColor2 * rim2;
}

// Subsurface scattering approximation
vec3 subsurfaceScattering(vec3 N, vec3 V, vec3 L, vec3 color, float thickness) {
  float NdotL = dot(N, -L);
  float VdotL = dot(V, -L);
  float scatter = smoothstep(0.0, 1.0, (NdotL + VdotL) * 0.5 + 0.5);
  
  return color * scatter * thickness;
}

// Iridescent effect based on view angle
vec3 iridescence(vec3 N, vec3 V, float intensity) {
  float NdotV = dot(N, V);
  float angle = acos(NdotV);
  
  vec3 color1 = vec3(1.0, 0.5, 0.0); // Orange
  vec3 color2 = vec3(0.0, 0.5, 1.0); // Blue
  vec3 color3 = vec3(0.5, 0.0, 1.0); // Purple
  
  float t = sin(angle * 10.0) * 0.5 + 0.5;
  vec3 irid = mix(color1, mix(color2, color3, t), t);
  
  return irid * intensity;
}

// Anisotropic highlights for liquid appearance
float anisotropicSpecular(vec3 T, vec3 N, vec3 V, vec3 L, float roughness) {
  vec3 H = normalize(V + L);
  float TdotH = dot(T, H);
  float NdotH = dot(N, H);
  
  float aniso = sqrt(1.0 - TdotH * TdotH);
  float spec = pow(aniso, 2.0 / (roughness * roughness + 0.0001));
  
  return spec * max(0.0, NdotH);
}