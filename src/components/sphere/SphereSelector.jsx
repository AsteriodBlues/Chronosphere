import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sphereThemes = [
  {
    id: 'power',
    name: 'Power Mode',
    description: 'Red energy for maximum focus and determination',
    color: '#ff3333',
    secondary: '#ff6666',
    accent: '#990000',
    particleColor: '#ff4444',
    psychology: 'Increases urgency, energy, and action-oriented mindset',
    icon: '🔥'
  },
  {
    id: 'calm',
    name: 'Zen Flow',
    description: 'Blue tranquility for deep concentration',
    color: '#0080ff',
    secondary: '#00aaff',
    accent: '#003366',
    particleColor: '#66b3ff',
    psychology: 'Promotes calmness, clarity, and mental stability',
    icon: '💧'
  },
  {
    id: 'growth',
    name: 'Growth Mode',
    description: 'Green vitality for learning and development',
    color: '#00ff88',
    secondary: '#66ffaa',
    accent: '#006633',
    particleColor: '#88ffcc',
    psychology: 'Enhances creativity, balance, and renewal',
    icon: '🌱'
  },
  {
    id: 'creative',
    name: 'Creative Flow',
    description: 'Purple inspiration for innovative thinking',
    color: '#cc66ff',
    secondary: '#dd99ff',
    accent: '#660099',
    particleColor: '#e6b3ff',
    psychology: 'Stimulates imagination, intuition, and artistic expression',
    icon: '✨'
  },
  {
    id: 'success',
    name: 'Golden Hour',
    description: 'Golden radiance for achievement and confidence',
    color: '#ffcc00',
    secondary: '#ffdd44',
    accent: '#996600',
    particleColor: '#ffe066',
    psychology: 'Boosts optimism, confidence, and mental clarity',
    icon: '⭐'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Mind',
    description: 'Nebula colors for unlimited possibilities',
    color: '#ff66cc',
    secondary: '#66ccff',
    accent: '#330066',
    particleColor: '#ffaadd',
    psychology: 'Expands consciousness and promotes flow state',
    icon: '🌌'
  }
]

export default function SphereSelector({ currentTheme, onThemeChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredTheme, setHoveredTheme] = useState(null)

  const selectedTheme = sphereThemes.find(t => t.id === currentTheme) || sphereThemes[0]

  return (
    <div className="fixed top-4 left-4 z-50">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Current Theme Display */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: `radial-gradient(circle, ${selectedTheme.color}, ${selectedTheme.accent})`,
              boxShadow: `0 0 20px ${selectedTheme.color}40`
            }}
          >
            {selectedTheme.icon}
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-semibold">{selectedTheme.name}</h3>
            <p className="text-white/60 text-sm">{selectedTheme.description}</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-white/60"
          >
            ▼
          </motion.div>
        </motion.button>

        {/* Theme Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/10"
            >
              <div className="p-2 max-h-96 overflow-y-auto">
                {sphereThemes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => {
                      onThemeChange(theme)
                      setIsExpanded(false)
                    }}
                    onMouseEnter={() => setHoveredTheme(theme.id)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      theme.id === currentTheme 
                        ? 'bg-white/10' 
                        : 'hover:bg-white/5'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{
                        background: `radial-gradient(circle, ${theme.color}, ${theme.accent})`,
                        boxShadow: `0 0 ${hoveredTheme === theme.id ? '20px' : '10px'} ${theme.color}40`
                      }}
                      animate={{
                        scale: hoveredTheme === theme.id ? 1.1 : 1
                      }}
                    >
                      {theme.icon}
                    </motion.div>
                    <div className="text-left flex-1">
                      <h4 className="text-white text-sm font-medium">{theme.name}</h4>
                      <p className="text-white/50 text-xs">{theme.psychology}</p>
                    </div>
                    {theme.id === currentTheme && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Psychology Explanation */}
              <div className="p-4 border-t border-white/10">
                <h4 className="text-white/80 text-xs font-semibold mb-2">COLOR PSYCHOLOGY</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  {selectedTheme.psychology}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Switch Pills */}
      <motion.div 
        className="mt-3 flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {sphereThemes.slice(0, 3).map((theme) => (
          <motion.button
            key={theme.id}
            onClick={() => onThemeChange(theme)}
            className="w-8 h-8 rounded-full border-2 border-white/20"
            style={{
              background: `radial-gradient(circle, ${theme.color}, ${theme.accent})`,
              borderColor: theme.id === currentTheme ? 'white' : undefined
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            title={theme.name}
          />
        ))}
      </motion.div>
    </div>
  )
}

export { sphereThemes }