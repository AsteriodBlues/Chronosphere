import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppProgressive from './App-progressive.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProgressive />
  </StrictMode>,
)
