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
    <div className="fixed left-4 bottom-24 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Clean Glassmorphism Compact Selector */}
        {!isExpanded ? (
          <motion.button
            onClick={() => setIsExpanded(true)}
            className="relative group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Subtle glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />

            {/* Clean Glass Container */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-lg flex items-center gap-3">
              {/* Icon */}
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${selectedTheme.color}, ${selectedTheme.secondary})`,
                  boxShadow: `0 8px 24px ${selectedTheme.glow}`
                }}
                whileHover={{ scale: 1.05 }}
              >
                {selectedTheme.icon}
              </motion.div>

              {/* Text */}
              <div className="pr-2">
                <h3 className="text-white text-sm font-semibold">{selectedTheme.name}</h3>
                <p className="text-white/60 text-xs">{selectedTheme.subtitle}</p>
              </div>

              {/* Arrow */}
              <svg className="w-4 h-4 text-white/40 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.button>

        ) : (
          /* Premium Glassmorphism Expanded View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            {/* Soft ambient glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[40px] blur-3xl opacity-50" />

            <div className="relative bg-white/10 backdrop-blur-2xl rounded-[32px] p-8 border border-white/20 shadow-2xl min-w-[360px]">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              {/* Clean Minimal Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-white text-base font-semibold mb-1">Choose Your Cognitive State</h3>
                  <p className="text-white/60 text-xs">Select optimal focus mode for your task</p>
                </motion.div>

                <motion.button
                  onClick={() => setIsExpanded(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {/* Clean Theme Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
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
                    initial={{ opacity: 0, y: 30, rotateX: 45 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Clean Glassmorphism Card */}
                    <div className={`relative p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm ${
                      theme.id === currentTheme
                        ? 'bg-white/20 border-2 shadow-lg'
                        : 'bg-white/10 border border-white/20 hover:bg-white/15'
                    }`}
                    style={{
                      borderColor: theme.id === currentTheme ? theme.color : undefined
                    }}>
                      {/* Simple Icon */}
                      <motion.div
                        className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${theme.color}, ${theme.secondary})`,
                          boxShadow: theme.id === currentTheme ? `0 4px 20px ${theme.glow}` : 'none'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="drop-shadow-md">{theme.icon}</span>
                      </motion.div>

                      {/* Clean Typography */}
                      <h4 className="text-white text-xs font-semibold text-center mb-1">
                        {theme.name}
                      </h4>
                      <p className="text-white/60 text-[10px] text-center">
                        {theme.subtitle}
                      </p>

                      {/* Active Indicator */}
                      {theme.id === currentTheme && (
                        <motion.div
                          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Clean Modern Psychology Panel */}
              <motion.div
                className="relative overflow-hidden rounded-3xl p-6"
                style={{
                  background: `linear-gradient(135deg, ${selectedTheme.color}08, ${selectedTheme.secondary}06, transparent)`,
                  border: `1px solid ${selectedTheme.color}30`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)`
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Subtle accent line */}
                <motion.div
                  className="absolute left-0 top-0 w-0.5 h-full rounded-r-full"
                  style={{ background: `linear-gradient(180deg, transparent, ${selectedTheme.color}, transparent)` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />

                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle, ${selectedTheme.color}, ${selectedTheme.secondary})`,
                      boxShadow: `0 0 12px ${selectedTheme.glow}`
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="flex-1">
                    <motion.p
                      className="text-white/80 text-sm leading-relaxed font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {selectedTheme.psychology}
                    </motion.p>
                  </div>
                </div>

                {/* Subtle hover glow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${selectedTheme.color}10, transparent)` }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

    </div>
  )
}

export { sphereThemes }