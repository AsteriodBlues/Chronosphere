import * as THREE from 'three'

// Spherical coordinate system utilities
export class SpatialMath {
  
  // Convert spherical coordinates to Cartesian
  static sphericalToCartesian(theta, phi, radius = 1) {
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }
  
  // Convert Cartesian coordinates to spherical
  static cartesianToSpherical(position) {
    const radius = position.length()
    const theta = Math.atan2(position.z, position.x)
    const phi = Math.acos(position.y / radius)
    
    return { theta, phi, radius }
  }
  
  // Calculate great circle distance between two points on sphere
  static greatCircleDistance(pos1, pos2, radius = 1) {
    const dTheta = pos2.theta - pos1.theta
    const dPhi = pos2.phi - pos1.phi
    
    const a = Math.sin(dPhi / 2) ** 2 + 
              Math.cos(pos1.phi) * Math.cos(pos2.phi) * 
              Math.sin(dTheta / 2) ** 2
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return radius * c
  }
  
  // Find optimal camera position to view a point on sphere
  static calculateOptimalViewPosition(targetPoint, sphereRadius, distance = 8) {
    const direction = targetPoint.clone().normalize()
    return direction.multiplyScalar(distance)
  }
  
  // Calculate surface normal at spherical position
  static getSurfaceNormal(theta, phi) {
    return new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    )
  }
  
  // Get tangent vectors at spherical position (for portal orientation)
  static getTangentVectors(theta, phi) {
    const tangentTheta = new THREE.Vector3(
      -Math.sin(phi) * Math.sin(theta),
      0,
      Math.sin(phi) * Math.cos(theta)
    ).normalize()
    
    const tangentPhi = new THREE.Vector3(
      Math.cos(phi) * Math.cos(theta),
      -Math.sin(phi),
      Math.cos(phi) * Math.sin(theta)
    ).normalize()
    
    return { tangentTheta, tangentPhi }
  }
  
  // Calculate portal clustering positions
  static generateClusterPositions(centerTheta, centerPhi, count, radius = 0.3) {
    const positions = []
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const distance = radius * (0.5 + Math.random() * 0.5)
      
      const theta = centerTheta + distance * Math.cos(angle)
      const phi = centerPhi + distance * Math.sin(angle)
      
      positions.push({ theta, phi })
    }
    
    return positions
  }
  
  // Check if point is visible from camera position
  static isPointVisible(pointPosition, cameraPosition, sphereCenter = new THREE.Vector3()) {
    const toPoint = new THREE.Vector3().subVectors(pointPosition, sphereCenter)
    const toCamera = new THREE.Vector3().subVectors(cameraPosition, sphereCenter)
    
    const dot = toPoint.normalize().dot(toCamera.normalize())
    return dot > -0.2 // Allow some back-facing visibility
  }
  
  // Project 3D point to screen space
  static projectToScreen(worldPosition, camera, renderer) {
    const vector = worldPosition.clone().project(camera)
    
    const widthHalf = renderer.domElement.clientWidth / 2
    const heightHalf = renderer.domElement.clientHeight / 2
    
    vector.x = (vector.x * widthHalf) + widthHalf
    vector.y = -(vector.y * heightHalf) + heightHalf
    
    return new THREE.Vector2(vector.x, vector.y)
  }
  
  // Calculate screen space distance between two points
  static screenDistance(point1, point2) {
    return Math.sqrt(
      (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2
    )
  }
  
  // Smooth interpolation between spherical coordinates
  static lerpSpherical(from, to, factor) {
    // Handle angle wrapping
    let deltaTheta = to.theta - from.theta
    if (deltaTheta > Math.PI) deltaTheta -= Math.PI * 2
    if (deltaTheta < -Math.PI) deltaTheta += Math.PI * 2
    
    return {
      theta: from.theta + deltaTheta * factor,
      phi: THREE.MathUtils.lerp(from.phi, to.phi, factor)
    }
  }
  
  // Calculate portal influence area
  static calculateInfluenceArea(portalPosition, influenceRadius, sphereRadius) {
    const area = []
    const segments = 16
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = portalPosition.theta + influenceRadius * Math.cos(angle)
      const y = portalPosition.phi + influenceRadius * Math.sin(angle)
      
      area.push({ theta: x, phi: y })
    }
    
    return area
  }
  
  // Find nearest point on sphere surface to arbitrary 3D point
  static nearestSurfacePoint(point, sphereCenter = new THREE.Vector3(), sphereRadius = 1) {
    const direction = new THREE.Vector3()
      .subVectors(point, sphereCenter)
      .normalize()
    
    return sphereCenter.clone().add(direction.multiplyScalar(sphereRadius))
  }
  
  // Calculate surface velocity at point (for animation)
  static calculateSurfaceVelocity(theta, phi, angularVelocity) {
    const { tangentTheta, tangentPhi } = this.getTangentVectors(theta, phi)
    
    return new THREE.Vector3()
      .addScaledVector(tangentTheta, angularVelocity.y)
      .addScaledVector(tangentPhi, angularVelocity.x)
  }
  
  // Generate Fibonacci spiral points on sphere
  static fibonacciSphere(n, radius = 1) {
    const points = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i
      
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      
      points.push(new THREE.Vector3(x * radius, y * radius, z * radius))
    }
    
    return points
  }
  
  // Calculate geodesic path between two points on sphere
  static calculateGeodesicPath(from, to, segments = 20) {
    const path = []
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const interpolated = this.lerpSpherical(from, to, t)
      path.push(interpolated)
    }
    
    return path
  }
  
  // Check if two spherical regions overlap
  static regionsOverlap(region1, region2, threshold = 0.1) {
    const distance = this.greatCircleDistance(
      { theta: region1.theta, phi: region1.phi },
      { theta: region2.theta, phi: region2.phi }
    )
    
    return distance < (region1.radius + region2.radius + threshold)
  }
}

// Camera path calculation utilities
export class CameraPath {
  
  // Generate smooth orbit path
  static generateOrbitPath(center, radius, startAngle = 0, endAngle = Math.PI * 2, segments = 50) {
    const path = []
    
    for (let i = 0; i <= segments; i++) {
      const angle = THREE.MathUtils.lerp(startAngle, endAngle, i / segments)
      const position = new THREE.Vector3(
        center.x + radius * Math.cos(angle),
        center.y,
        center.z + radius * Math.sin(angle)
      )
      path.push(position)
    }
    
    return path
  }
  
  // Calculate smooth approach path to portal
  static generateApproachPath(startPos, targetPos, segments = 30) {
    const path = []
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      // Use smooth step for easing
      const eased = t * t * (3 - 2 * t)
      
      const position = new THREE.Vector3().lerpVectors(startPos, targetPos, eased)
      path.push(position)
    }
    
    return path
  }
  
  // Generate spiral path for dramatic transitions
  static generateSpiralPath(center, startRadius, endRadius, height, turns = 2, segments = 60) {
    const path = []
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = turns * Math.PI * 2 * t
      const radius = THREE.MathUtils.lerp(startRadius, endRadius, t)
      const y = THREE.MathUtils.lerp(-height / 2, height / 2, t)
      
      const position = new THREE.Vector3(
        center.x + radius * Math.cos(angle),
        center.y + y,
        center.z + radius * Math.sin(angle)
      )
      path.push(position)
    }
    
    return path
  }
}

export default SpatialMath