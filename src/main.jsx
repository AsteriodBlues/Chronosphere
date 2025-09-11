import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWithShader from './App-shader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithShader />
  </StrictMode>,
)
