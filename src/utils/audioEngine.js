/**
 * Advanced Audio Engine for Chronosphere
 * Handles notifications, ambient sounds, and spatial audio
 */

export class AudioEngine {
  constructor() {
    this.context = null
    this.masterGain = null
    this.initialized = false
    this.sounds = new Map()
    this.ambientSources = new Map()
    this.isEnabled = true
    this.masterVolume = 0.7
  }

  async initialize() {
    if (this.initialized) return

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.context.createGain()
      this.masterGain.connect(this.context.destination)
      this.masterGain.gain.value = this.masterVolume

      // Create sound library
      await this.loadSounds()
      this.initialized = true
    } catch (error) {
      console.warn('AudioEngine initialization failed:', error)
      this.initialized = false
    }
  }

  async loadSounds() {
    const soundDefinitions = {
      // Notification sounds
      sessionComplete: {
        type: 'chord',
        frequencies: [523.25, 659.25, 783.99, 1046.5], // C-E-G-C chord
        duration: 2.0,
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.0 }
      },
      breakComplete: {
        type: 'chord',
        frequencies: [392.00, 493.88, 587.33], // G-B-D chord
        duration: 1.5,
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }
      },
      tick: {
        type: 'sine',
        frequency: 800,
        duration: 0.1,
        envelope: { attack: 0.01, decay: 0.09, sustain: 0, release: 0 }
      },
      warning: {
        type: 'chord',
        frequencies: [440, 554.37], // A-C# (tension)
        duration: 0.8,
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.45 }
      },
      quantum: {
        type: 'formant',
        baseFreq: 220,
        harmonics: [1, 1.5, 2.2, 3.1, 4.7],
        duration: 3.0,
        envelope: { attack: 0.2, decay: 0.5, sustain: 0.8, release: 1.5 }
      },
      flow: {
        type: 'sweep',
        startFreq: 200,
        endFreq: 800,
        duration: 2.5,
        envelope: { attack: 0.3, decay: 0.2, sustain: 0.9, release: 1.1 }
      }
    }

    for (const [name, definition] of Object.entries(soundDefinitions)) {
      this.sounds.set(name, definition)
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize()
    }
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  async playSound(soundName, options = {}) {
    if (!this.isEnabled) return
    await this.ensureInitialized()

    const soundDef = this.sounds.get(soundName)
    if (!soundDef) {
      console.warn(`Sound '${soundName}' not found`)
      return
    }

    const {
      volume = 1.0,
      pitch = 1.0,
      spatialPosition = null,
      delay = 0
    } = options

    const startTime = this.context.currentTime + delay

    switch (soundDef.type) {
      case 'sine':
      case 'square':
      case 'sawtooth':
      case 'triangle':
        this.playOscillator(soundDef, { volume, pitch, spatialPosition, startTime })
        break
      case 'chord':
        this.playChord(soundDef, { volume, pitch, spatialPosition, startTime })
        break
      case 'formant':
        this.playFormant(soundDef, { volume, pitch, spatialPosition, startTime })
        break
      case 'sweep':
        this.playSweep(soundDef, { volume, pitch, spatialPosition, startTime })
        break
    }
  }

  playOscillator(soundDef, options) {
    const { volume, pitch, spatialPosition, startTime } = options
    const oscillator = this.context.createOscillator()
    const gainNode = this.context.createGain()

    oscillator.type = soundDef.type
    oscillator.frequency.value = soundDef.frequency * pitch

    // Apply envelope
    const envelope = soundDef.envelope
    const duration = soundDef.duration
    
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + envelope.attack)
    gainNode.gain.linearRampToValueAtTime(volume * envelope.sustain, startTime + envelope.attack + envelope.decay)
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

    // Connect audio graph
    oscillator.connect(gainNode)
    this.connectWithSpatialAudio(gainNode, spatialPosition)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  playChord(soundDef, options) {
    const { volume, pitch, spatialPosition, startTime } = options
    const chordVolume = volume / soundDef.frequencies.length

    soundDef.frequencies.forEach((freq, index) => {
      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = freq * pitch

      // Stagger chord notes slightly for more natural sound
      const noteDelay = index * 0.05
      const noteStartTime = startTime + noteDelay

      // Apply envelope
      const envelope = soundDef.envelope
      const duration = soundDef.duration
      
      gainNode.gain.setValueAtTime(0, noteStartTime)
      gainNode.gain.linearRampToValueAtTime(chordVolume, noteStartTime + envelope.attack)
      gainNode.gain.linearRampToValueAtTime(chordVolume * envelope.sustain, noteStartTime + envelope.attack + envelope.decay)
      gainNode.gain.linearRampToValueAtTime(0, noteStartTime + duration)

      oscillator.connect(gainNode)
      this.connectWithSpatialAudio(gainNode, spatialPosition)

      oscillator.start(noteStartTime)
      oscillator.stop(noteStartTime + duration)
    })
  }

  playFormant(soundDef, options) {
    const { volume, pitch, spatialPosition, startTime } = options
    const baseFreq = soundDef.baseFreq * pitch

    soundDef.harmonics.forEach((harmonic, index) => {
      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = baseFreq * harmonic

      // Harmonic amplitude rolloff
      const harmonicVolume = volume / (index + 1) * 0.7

      // Apply envelope
      const envelope = soundDef.envelope
      const duration = soundDef.duration
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(harmonicVolume, startTime + envelope.attack)
      gainNode.gain.linearRampToValueAtTime(harmonicVolume * envelope.sustain, startTime + envelope.attack + envelope.decay)
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

      oscillator.connect(gainNode)
      this.connectWithSpatialAudio(gainNode, spatialPosition)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    })
  }

  playSweep(soundDef, options) {
    const { volume, pitch, spatialPosition, startTime } = options
    const oscillator = this.context.createOscillator()
    const gainNode = this.context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(soundDef.startFreq * pitch, startTime)
    oscillator.frequency.exponentialRampToValueAtTime(soundDef.endFreq * pitch, startTime + soundDef.duration)

    // Apply envelope
    const envelope = soundDef.envelope
    const duration = soundDef.duration
    
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + envelope.attack)
    gainNode.gain.linearRampToValueAtTime(volume * envelope.sustain, startTime + envelope.attack + envelope.decay)
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

    oscillator.connect(gainNode)
    this.connectWithSpatialAudio(gainNode, spatialPosition)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  connectWithSpatialAudio(gainNode, spatialPosition) {
    if (spatialPosition && this.context.createPanner) {
      const panner = this.context.createPanner()
      panner.panningModel = 'HRTF'
      panner.distanceModel = 'inverse'
      panner.refDistance = 1
      panner.maxDistance = 10000
      panner.rolloffFactor = 1
      panner.coneInnerAngle = 360
      panner.coneOuterAngle = 0
      panner.coneOuterGain = 0

      panner.positionX.value = spatialPosition.x
      panner.positionY.value = spatialPosition.y
      panner.positionZ.value = spatialPosition.z

      gainNode.connect(panner)
      panner.connect(this.masterGain)
    } else {
      gainNode.connect(this.masterGain)
    }
  }

  // Ambient sound management
  async startAmbientSound(name, soundConfig) {
    if (!this.isEnabled) return
    await this.ensureInitialized()

    if (this.ambientSources.has(name)) {
      this.stopAmbientSound(name)
    }

    const source = this.createAmbientSource(soundConfig)
    this.ambientSources.set(name, source)
    source.start()
  }

  createAmbientSource(config) {
    const oscillator = this.context.createOscillator()
    const gainNode = this.context.createGain()
    const filterNode = this.context.createBiquadFilter()

    oscillator.type = config.type || 'sine'
    oscillator.frequency.value = config.frequency || 220

    filterNode.type = 'lowpass'
    filterNode.frequency.value = config.filterFreq || 1000
    filterNode.Q.value = config.filterQ || 1

    gainNode.gain.value = config.volume || 0.1

    oscillator.connect(filterNode)
    filterNode.connect(gainNode)
    gainNode.connect(this.masterGain)

    return {
      oscillator,
      gainNode,
      filterNode,
      start: () => oscillator.start(),
      stop: () => {
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5)
        oscillator.stop(this.context.currentTime + 0.5)
      }
    }
  }

  stopAmbientSound(name) {
    const source = this.ambientSources.get(name)
    if (source) {
      source.stop()
      this.ambientSources.delete(name)
    }
  }

  // Volume control
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled
    if (!enabled) {
      this.stopAllSounds()
    }
  }

  stopAllSounds() {
    // Stop all ambient sounds
    for (const [name] of this.ambientSources) {
      this.stopAmbientSound(name)
    }
  }

  // Notification sequences
  async playSessionCompleteSequence() {
    await this.playSound('sessionComplete', { volume: 0.8 })
    // Optional: Add celebratory sound effects
    setTimeout(() => {
      this.playSound('quantum', { volume: 0.3, delay: 0.5 })
    }, 1000)
  }

  async playBreakCompleteSequence() {
    await this.playSound('breakComplete', { volume: 0.6 })
  }

  async playWarningSequence(minutesRemaining) {
    const urgency = Math.max(0, (5 - minutesRemaining) / 5) // Increase urgency as time runs out
    const volume = 0.3 + (urgency * 0.4)
    const pitch = 1.0 + (urgency * 0.3)
    
    await this.playSound('warning', { volume, pitch })
  }

  async playTickSound(volume = 0.1) {
    await this.playSound('tick', { volume })
  }

  // State change notifications
  async playStateTransition(fromState, toState) {
    const transitionSounds = {
      'idle-focus': 'flow',
      'focus-break': 'sessionComplete',
      'break-focus': 'flow',
      'focus-flow': 'quantum',
      'flow-quantum': 'quantum'
    }

    const soundName = transitionSounds[`${fromState}-${toState}`]
    if (soundName) {
      await this.playSound(soundName, { volume: 0.5 })
    }
  }
}

// Global audio engine instance
export const audioEngine = new AudioEngine()

// Notification system
export class NotificationSystem {
  constructor() {
    this.permissions = 'default'
    this.audioEngine = audioEngine
    this.enabledTypes = {
      sessionStart: true,
      sessionComplete: true,
      breakStart: true,
      breakComplete: true,
      warning: true,
      milestone: true
    }
  }

  async initialize() {
    // Request notification permission
    if ('Notification' in window) {
      this.permissions = await Notification.requestPermission()
    }

    // Initialize audio engine
    await this.audioEngine.initialize()
  }

  async notify(type, options = {}) {
    if (!this.enabledTypes[type]) return

    const {
      title,
      message,
      icon = '/icon-192.png',
      sound = true,
      desktop = true,
      duration = 5000
    } = options

    // Play sound notification
    if (sound) {
      await this.playNotificationSound(type, options)
    }

    // Show desktop notification
    if (desktop && this.permissions === 'granted') {
      this.showDesktopNotification(title, message, icon, duration)
    }

    // Show in-app notification
    this.showInAppNotification(type, title, message, duration)
  }

  async playNotificationSound(type, options) {
    const soundMap = {
      sessionStart: () => this.audioEngine.playSound('flow', { volume: 0.4 }),
      sessionComplete: () => this.audioEngine.playSessionCompleteSequence(),
      breakStart: () => this.audioEngine.playSound('breakComplete', { volume: 0.3 }),
      breakComplete: () => this.audioEngine.playBreakCompleteSequence(),
      warning: () => this.audioEngine.playWarningSequence(options.minutesRemaining || 5),
      milestone: () => this.audioEngine.playSound('quantum', { volume: 0.6 })
    }

    const soundFunction = soundMap[type]
    if (soundFunction) {
      await soundFunction()
    }
  }

  showDesktopNotification(title, message, icon, duration) {
    const notification = new Notification(title, {
      body: message,
      icon,
      badge: icon,
      tag: 'chronosphere-timer',
      requireInteraction: false
    })

    // Auto-close after duration
    setTimeout(() => {
      notification.close()
    }, duration)

    return notification
  }

  showInAppNotification(type, title, message, duration) {
    // This would integrate with a toast notification system
    const event = new CustomEvent('chronosphere-notification', {
      detail: { type, title, message, duration }
    })
    window.dispatchEvent(event)
  }

  setEnabled(type, enabled) {
    this.enabledTypes[type] = enabled
  }

  setAudioEnabled(enabled) {
    this.audioEngine.setEnabled(enabled)
  }

  setVolume(volume) {
    this.audioEngine.setMasterVolume(volume)
  }
}

// Global notification system instance
export const notificationSystem = new NotificationSystem()

export default AudioEngine