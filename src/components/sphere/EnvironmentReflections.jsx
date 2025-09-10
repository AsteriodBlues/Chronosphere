import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { CubeCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useSettings } from '../../hooks'

export default function EnvironmentReflections({ children }) {
  const cubeCamera = useRef()
  const { visual, getEffectiveColors } = useSettings()
  const colors = getEffectiveColors()
  
  // Create procedural environment map
  const envMapRenderTarget = useMemo(() => {
    return new THREE.WebGLCubeRenderTarget(512, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter
    })
  }, [])
  
  // Create environment geometry for reflections
  const environmentGeometry = useMemo(() => {
    const group = new THREE.Group()
    
    // Add some geometric shapes for interesting reflections
    const shapes = [
      // Floating cubes
      { geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5), count: 8, distance: 15 },
      // Torus rings
      { geometry: new THREE.TorusGeometry(0.3, 0.1, 8, 16), count: 5, distance: 12 },
      // Octahedrons
      { geometry: new THREE.OctahedronGeometry(0.4), count: 6, distance: 10 }
    ]
    
    shapes.forEach((shape, shapeIndex) => {
      for (let i = 0; i < shape.count; i++) {
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(
            (shapeIndex * 0.3 + i * 0.1) % 1,
            0.7,
            0.6
          ),
          metalness: 0.8,
          roughness: 0.2
        })
        
        const mesh = new THREE.Mesh(shape.geometry, material)
        
        // Position in sphere around camera
        const angle = (i / shape.count) * Math.PI * 2
        mesh.position.set(
          Math.cos(angle) * shape.distance,
          (Math.random() - 0.5) * 10,
          Math.sin(angle) * shape.distance
        )
        
        mesh.userData = {
          originalPosition: mesh.position.clone(),
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          floatSpeed: Math.random() * 0.01 + 0.005,
          floatPhase: Math.random() * Math.PI * 2
        }
        
        group.add(mesh)
      }
    })
    
    return group
  }, [])
  
  useFrame((state) => {
    if (!cubeCamera.current || !visual.reflections) return
    
    const time = state.clock.elapsedTime
    
    // Animate environment objects
    environmentGeometry.children.forEach((mesh) => {
      const userData = mesh.userData
      
      // Rotation
      mesh.rotation.x += userData.rotationSpeed
      mesh.rotation.y += userData.rotationSpeed * 0.7
      
      // Floating motion
      mesh.position.y = userData.originalPosition.y + 
        Math.sin(time * userData.floatSpeed + userData.floatPhase) * 2
      
      // Color animation based on time
      const hue = (time * 0.1 + mesh.position.x * 0.01) % 1
      mesh.material.color.setHSL(hue, 0.7, 0.6)
    })
    
    // Update cube camera
    cubeCamera.current.update(state.gl, state.scene)
  })
  
  if (!visual.reflections) {
    return children
  }
  
  return (
    <>
      {/* Environment objects for reflections */}
      <primitive object={environmentGeometry} />
      
      {/* Cube camera for capturing environment */}
      <CubeCamera
        ref={cubeCamera}
        args={[0.1, 1000, envMapRenderTarget]}
        position={[0, 0, 0]}
      />
      
      {/* Pass environment map to children */}
      {children && typeof children === 'function' 
        ? children(envMapRenderTarget.texture)
        : children
      }
    </>
  )
}