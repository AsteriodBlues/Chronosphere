import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sphereThemes = [
  {
    id: 'power',
    name: 'POWER',
    subtitle: 'Maximum Focus',
    color: '#ff3333',
    gradient: 'linear-gradient(135deg, #ff3333 0%, #ff6666 50%, #ff0000 100%)',
    secondary: '#ff6666',
    accent: '#990000',
    particleColor: '#ff4444',
    psychology: 'Increases urgency, energy, and action-oriented mindset',
    icon: '⚡',
    glow: 'rgba(255, 51, 51, 0.5)'
  },
  {
    id: 'calm',
    name: 'ZEN',
    subtitle: 'Deep Focus',
    color: '#0080ff',
    gradient: 'linear-gradient(135deg, #0080ff 0%, #00aaff 50%, #0066cc 100%)',
    secondary: '#00aaff',
    accent: '#003366',
    particleColor: '#66b3ff',
    psychology: 'Promotes calmness, clarity, and mental stability',
    icon: '💎',
    glow: 'rgba(0, 128, 255, 0.5)'
  },
  {
    id: 'growth',
    name: 'GROWTH',
    subtitle: 'Learning Mode',
    color: '#00ff88',
    gradient: 'linear-gradient(135deg, #00ff88 0%, #66ffaa 50%, #00cc66 100%)',
    secondary: '#66ffaa',
    accent: '#006633',
    particleColor: '#88ffcc',
    psychology: 'Enhances creativity, balance, and renewal',
    icon: '🚀',
    glow: 'rgba(0, 255, 136, 0.5)'
  },
  {
    id: 'creative',
    name: 'CREATIVE',
    subtitle: 'Innovation',
    color: '#cc66ff',
    gradient: 'linear-gradient(135deg, #cc66ff 0%, #dd99ff 50%, #aa44dd 100%)',
    secondary: '#dd99ff',
    accent: '#660099',
    particleColor: '#e6b3ff',
    psychology: 'Stimulates imagination, intuition, and artistic expression',
    icon: '✨',
    glow: 'rgba(204, 102, 255, 0.5)'
  },
  {
    id: 'success',
    name: 'GOLDEN',
    subtitle: 'Achievement',
    color: '#ffcc00',
    gradient: 'linear-gradient(135deg, #ffcc00 0%, #ffdd44 50%, #ffaa00 100%)',
    secondary: '#ffdd44',
    accent: '#996600',
    particleColor: '#ffe066',
    psychology: 'Boosts optimism, confidence, and mental clarity',
    icon: '👑',
    glow: 'rgba(255, 204, 0, 0.5)'
  },
  {
    id: 'cosmic',
    name: 'COSMIC',
    subtitle: 'Flow State',
    color: '#ff66cc',
    gradient: 'linear-gradient(135deg, #ff66cc 0%, #66ccff 50%, #ff99ff 100%)',
    secondary: '#66ccff',
    accent: '#330066',
    particleColor: '#ffaadd',
    psychology: 'Expands consciousness and promotes flow state',
    icon: '🌟',
    glow: 'rgba(255, 102, 204, 0.5)'
  }
]

export default function SphereSelector({ currentTheme, onThemeChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredTheme, setHoveredTheme] = useState(null)

  const selectedTheme = sphereThemes.find(t => t.id === currentTheme) || sphereThemes[0]

  return (
    <div className="fixed left-6 bottom-32 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Modern Compact Selector */}
        {!isExpanded ? (
          <motion.button
            onClick={() => setIsExpanded(true)}
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glowing backdrop */}
            <div 
              className="absolute inset-0 rounded-2xl blur-xl opacity-60"
              style={{ background: selectedTheme.gradient }}
            />
            
            {/* Main button */}
            <div className="relative bg-black/80 backdrop-blur-2xl rounded-2xl p-3 pr-5 flex items-center gap-3 border border-white/10">
              {/* Color orb */}
              <div className="relative">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: selectedTheme.gradient,
                    boxShadow: `0 8px 32px ${selectedTheme.glow}`
                  }}
                >
                  {selectedTheme.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
              
              {/* Text */}
              <div className="text-left">
                <h3 className="text-white font-bold text-sm tracking-wider">{selectedTheme.name}</h3>
                <p className="text-white/50 text-xs">{selectedTheme.subtitle}</p>
              </div>
              
              {/* Arrow */}
              <svg className="w-4 h-4 text-white/30 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.button>

        ) : (
          /* Expanded Modern Grid */
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
          >
            {/* Glass card background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-xl" />
            
            <div className="relative bg-black/90 backdrop-blur-2xl rounded-3xl p-6 border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white/90 text-xs font-medium tracking-[0.2em] uppercase">Select Theme</h3>
                  <p className="text-white/40 text-xs mt-1">Choose your focus mode</p>
                </div>
                <motion.button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {/* Theme Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {sphereThemes.map((theme, index) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => {
                      onThemeChange(theme)
                      setIsExpanded(false)
                    }}
                    onMouseEnter={() => setHoveredTheme(theme.id)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Selected indicator */}
                    {theme.id === currentTheme && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: theme.gradient }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                      />
                    )}
                    
                    {/* Card */}
                    <div className={`relative p-4 rounded-2xl transition-all ${
                      theme.id === currentTheme 
                        ? 'bg-white/10 border-2' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    style={{
                      borderColor: theme.id === currentTheme ? theme.color : undefined
                    }}>
                      {/* Icon */}
                      <div 
                        className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          background: theme.gradient,
                          boxShadow: hoveredTheme === theme.id ? `0 8px 24px ${theme.glow}` : 'none'
                        }}
                      >
                        {theme.icon}
                      </div>
                      
                      {/* Name */}
                      <h4 className="text-white text-xs font-bold tracking-wider">{theme.name}</h4>
                      <p className="text-white/40 text-[10px] mt-1">{theme.subtitle}</p>
                      
                      {/* Active dot */}
                      {theme.id === currentTheme && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Current Psychology */}
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-r opacity-80"
                style={{ 
                  background: `linear-gradient(90deg, ${selectedTheme.color}20, transparent)`,
                  borderLeft: `2px solid ${selectedTheme.color}`
                }}
              >
                <p className="text-white/70 text-xs leading-relaxed">
                  {selectedTheme.psychology}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

    </div>
  )
}

export { sphereThemes }