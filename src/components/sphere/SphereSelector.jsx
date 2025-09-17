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
        {/* Ultra-Modern Compact Selector */}
        {!isExpanded ? (
          <motion.button
            onClick={() => setIsExpanded(true)}
            className="relative group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Dynamic glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
              style={{ background: selectedTheme.gradient }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Next-Gen Floating Container */}
            <div className="relative bg-gradient-to-br from-white/15 via-white/8 to-white/3 backdrop-blur-[20px] rounded-[28px] p-3 border border-white/25 shadow-[0_32px_64px_rgba(0,0,0,0.4)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-[28px] p-[1px] bg-gradient-to-br from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Holographic orb */}
              <div className="relative">
                <motion.div
                  className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center text-4xl font-black shadow-2xl relative overflow-hidden"
                  style={{
                    background: `conic-gradient(from 45deg, ${selectedTheme.color}FF, ${selectedTheme.secondary}DD, ${selectedTheme.accent}AA, ${selectedTheme.color}FF)`,
                    boxShadow: `0 16px 48px ${selectedTheme.glow}, inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)`
                  }}
                  whileHover={{ rotateY: 360, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
                >
                  {/* Holographic shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-[20px]"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10 drop-shadow-lg">{selectedTheme.icon}</span>
                </motion.div>

                {/* Floating status ring */}
                <motion.div
                  className="absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-xl"
                  style={{
                    background: `radial-gradient(circle, ${selectedTheme.color}CC, ${selectedTheme.secondary}88)`,
                    boxShadow: `0 4px 12px ${selectedTheme.glow}`
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-2.5 h-2.5 bg-white rounded-full shadow-lg" />
                </motion.div>
              </div>

              {/* Micro interaction hint */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                whileHover={{ scale: 1.3, rotate: 180 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>
          </motion.button>

        ) : (
          /* Ultra-Modern Expanded Grid */
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30, rotateX: -15 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
            style={{ perspective: "1000px" }}
          >
            {/* Dynamic background effects */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 rounded-[32px] blur-2xl"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative bg-gradient-to-br from-black/75 via-black/60 to-black/45 backdrop-blur-[24px] rounded-[36px] p-10 border border-white/25 shadow-[0_48px_128px_rgba(0,0,0,0.6)] min-w-[380px] max-w-[420px]">
              {/* Animated mesh background */}
              <div className="absolute inset-0 rounded-[36px] opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
              </div>
              {/* Premium Header */}
              <div className="flex items-center justify-between mb-10 relative">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                >
                  <h3 className="text-white/98 text-lg font-bold tracking-[0.12em] uppercase mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Focus Themes</h3>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <p className="text-white/60 text-sm font-medium">Choose your cognitive state</p>
                  </div>
                </motion.div>

                <motion.button
                  onClick={() => setIsExpanded(false)}
                  className="w-12 h-12 rounded-3xl bg-gradient-to-br from-white/15 via-white/8 to-white/5 hover:from-white/25 hover:to-white/15 flex items-center justify-center transition-all border border-white/20 shadow-lg backdrop-blur-xl group"
                  whileHover={{ scale: 1.08, rotate: 180 }}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, scale: 0.7, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
                >
                  <svg className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {/* Next-Gen Theme Grid */}
              <div className="grid grid-cols-3 gap-5 mb-8">
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
                    {/* Hover glow */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl blur-xl opacity-0"
                      style={{ background: theme.gradient }}
                      animate={{
                        opacity: hoveredTheme === theme.id ? 0.4 : theme.id === currentTheme ? 0.2 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Ultra-Modern Card Container */}
                    <div className={`relative p-6 rounded-[24px] transition-all duration-500 backdrop-blur-[16px] group ${
                      theme.id === currentTheme
                        ? 'bg-gradient-to-br from-white/20 via-white/12 to-white/8 border-2 shadow-2xl'
                        : 'bg-gradient-to-br from-white/10 via-white/6 to-white/3 border border-white/20 hover:from-white/16 hover:to-white/10 hover:border-white/30'
                    }`}
                    style={{
                      borderColor: theme.id === currentTheme ? theme.color : undefined,
                      boxShadow: theme.id === currentTheme
                        ? `0 12px 48px ${theme.glow}, 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)`
                        : '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
                    }}>
                      {/* Floating Icon with Holographic Effect */}
                      <motion.div
                        className="w-16 h-16 mx-auto mb-5 rounded-[18px] flex items-center justify-center text-3xl shadow-2xl relative overflow-hidden"
                        style={{
                          background: `conic-gradient(from 180deg, ${theme.color}FF, ${theme.secondary}DD, ${theme.accent}BB, ${theme.color}FF)`,
                          boxShadow: `0 12px 32px ${theme.glow}, inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)`
                        }}
                        whileHover={{
                          rotateY: 360,
                          scale: 1.15,
                          rotateZ: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 0.8,
                          ease: [0.175, 0.885, 0.32, 1.275],
                          rotateZ: { duration: 0.3 }
                        }}>
                        {/* Dynamic shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-[18px]"
                          animate={{ x: ['-120%', '120%'] }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 1
                          }}
                        />

                        {/* Particle effect overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-[18px]"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, ${theme.particleColor}40, transparent 60%)`
                          }}
                          animate={{
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <span className="relative z-10 drop-shadow-2xl font-black">{theme.icon}</span>
                      </motion.div>

                      {/* Premium Typography */}
                      <h4 className="text-white/98 text-sm font-black tracking-[0.1em] mb-2 text-center bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                        {theme.name}
                      </h4>
                      <p className="text-white/65 text-xs leading-relaxed text-center font-medium">
                        {theme.subtitle}
                      </p>

                      {/* Floating Status Indicator */}
                      {theme.id === currentTheme && (
                        <motion.div
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-xl"
                          style={{
                            background: `radial-gradient(circle, ${theme.color}DD, ${theme.secondary}AA)`,
                            boxShadow: `0 6px 20px ${theme.glow}, 0 0 0 2px rgba(255,255,255,0.2)`
                          }}
                          animate={{
                            scale: [1, 1.4, 1],
                            rotate: [0, 360]
                          }}
                          transition={{
                            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                          }}
                        >
                          <motion.div
                            className="w-3 h-3 bg-white rounded-full shadow-lg"
                            animate={{ scale: [1, 0.8, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </motion.div>
                      )}

                      {/* Hover glow overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-[24px] opacity-0"
                        style={{ background: `linear-gradient(135deg, ${theme.color}20, ${theme.secondary}15, transparent)` }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Ultra-Futuristic Psychology Panel */}
              <motion.div
                className="relative overflow-hidden rounded-[28px] p-7 backdrop-blur-[20px]"
                style={{
                  background: `linear-gradient(135deg, ${selectedTheme.color}18, ${selectedTheme.secondary}12, ${selectedTheme.accent}08, transparent)`,
                  border: `1.5px solid ${selectedTheme.color}50`,
                  boxShadow: `0 16px 40px ${selectedTheme.glow}30, inset 0 1px 2px rgba(255,255,255,0.1)`
                }}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {/* Dynamic flowing accent */}
                <motion.div
                  className="absolute left-0 top-0 w-2 h-full rounded-r-full"
                  style={{ background: `linear-gradient(180deg, ${selectedTheme.color}FF, ${selectedTheme.secondary}CC, ${selectedTheme.accent}AA)` }}
                  animate={{
                    scaleY: [0, 1],
                    opacity: [0.6, 1, 0.8]
                  }}
                  transition={{
                    scaleY: { duration: 1.2, ease: "easeOut" },
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                />

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden rounded-[28px]">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full opacity-40"
                      style={{ background: selectedTheme.particleColor }}
                      animate={{
                        x: [0, 100, 200, 300],
                        y: [20 + i * 15, 40 + i * 10, 25 + i * 20, 35 + i * 15],
                        opacity: [0, 0.6, 0.3, 0]
                      }}
                      transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.8
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  <motion.div
                    className="w-3 h-3 rounded-full mt-3 flex-shrink-0 shadow-lg"
                    style={{
                      background: `radial-gradient(circle, ${selectedTheme.color}FF, ${selectedTheme.secondary}DD)`,
                      boxShadow: `0 4px 12px ${selectedTheme.glow}`
                    }}
                    animate={{
                      scale: [1, 1.4, 1],
                      boxShadow: [`0 4px 12px ${selectedTheme.glow}`, `0 6px 20px ${selectedTheme.glow}`, `0 4px 12px ${selectedTheme.glow}`]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="flex-1">
                    <motion.p
                      className="text-white/85 text-sm leading-relaxed font-medium bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {selectedTheme.psychology}
                    </motion.p>
                  </div>
                </div>

                {/* Subtle animated border */}
                <motion.div
                  className="absolute inset-0 rounded-[28px] border opacity-30"
                  style={{ borderColor: selectedTheme.color }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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