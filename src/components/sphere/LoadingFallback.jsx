export default function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial 
        color="#333" 
        wireframe 
        transparent 
        opacity={0.3} 
      />
    </mesh>
  )
}