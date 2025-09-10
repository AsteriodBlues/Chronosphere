import { useMemo } from 'react'
import * as THREE from 'three'

export default function SphereGeometry({ 
  radius = 2, 
  widthSegments = 128, 
  heightSegments = 64,
  deformations = []
}) {
  
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(radius, widthSegments, heightSegments)
    
    // Add custom attributes for deformation
    const positionAttribute = geo.attributes.position
    const normalAttribute = geo.attributes.normal
    
    // Store original positions for deformation calculations
    const originalPositions = positionAttribute.array.slice()
    geo.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3))
    
    // Add deformation attribute
    const deformationArray = new Float32Array(positionAttribute.count)
    geo.setAttribute('deformation', new THREE.BufferAttribute(deformationArray, 1))
    
    // Add wave phase for animated effects
    const phaseArray = new Float32Array(positionAttribute.count)
    for (let i = 0; i < positionAttribute.count; i++) {
      phaseArray[i] = Math.random() * Math.PI * 2
    }
    geo.setAttribute('phase', new THREE.BufferAttribute(phaseArray, 1))
    
    return geo
  }, [radius, widthSegments, heightSegments])
  
  // Apply deformations if provided
  useMemo(() => {
    if (deformations.length > 0) {
      const positionAttribute = geometry.attributes.position
      const originalPositions = geometry.attributes.originalPosition
      const deformationAttribute = geometry.attributes.deformation
      
      // Reset to original positions
      positionAttribute.array.set(originalPositions.array)
      
      // Apply deformations
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = originalPositions.array[i * 3]
        const y = originalPositions.array[i * 3 + 1]
        const z = originalPositions.array[i * 3 + 2]
        
        let totalDeformation = 0
        
        // Calculate deformation from all sources
        deformations.forEach(deform => {
          const distance = Math.sqrt(
            (x - deform.center.x) ** 2 +
            (y - deform.center.y) ** 2 +
            (z - deform.center.z) ** 2
          )
          
          if (distance < deform.radius) {
            const influence = 1 - (distance / deform.radius)
            totalDeformation += influence * deform.strength
          }
        })
        
        // Apply deformation along vertex normal
        const length = Math.sqrt(x * x + y * y + z * z)
        if (length > 0) {
          const normalX = x / length
          const normalY = y / length
          const normalZ = z / length
          
          positionAttribute.array[i * 3] = x + normalX * totalDeformation
          positionAttribute.array[i * 3 + 1] = y + normalY * totalDeformation
          positionAttribute.array[i * 3 + 2] = z + normalZ * totalDeformation
          
          deformationAttribute.array[i] = totalDeformation
        }
      }
      
      positionAttribute.needsUpdate = true
      deformationAttribute.needsUpdate = true
      geometry.computeVertexNormals()
    }
  }, [geometry, deformations])
  
  return <primitive object={geometry} />
}