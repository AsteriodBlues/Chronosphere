import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppIntegrated from './App-integrated.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppIntegrated />
  </StrictMode>,
)
