# Chronosphere - Advanced Focus System

A sophisticated 3D focus timer application featuring an interactive metallic sphere, dynamic theme system, and immersive cosmic background. Built with React, Three.js, and modern web technologies to enhance productivity through visual engagement.

## ✨ Features

### 🎯 Core Functionality
- **Pomodoro Timer**: 25-minute focus sessions with automatic tracking
- **Session Counter**: Track daily productivity with persistent session count
- **Interactive Controls**: Play/pause functionality with smooth animations
- **Time Adjustment**: Modify timer duration on the fly

### 🌐 3D Interactive Sphere
- **Liquid Metal Rendering**: Beautiful shader-based metallic sphere with dynamic reflections
- **Real-time Animations**: Smooth morphing and pulsing effects
- **Theme System**: Multiple sphere themes with unique color palettes
  - Power Mode (Blue)
  - Zen Mode (Green)
  - Creative Mode (Purple)
  - Focus Mode (Amber)
  - Night Mode (Dark)
  - Energy Mode (Red)
- **Mouse Interaction**: Hover and click effects with visual feedback

### 🌌 Immersive Background
- **Dynamic Galaxy**: Animated star field with multiple star types
- **Shooting Stars**: Aurora-effect shooting stars with trails
- **Nebula Clouds**: Drifting cosmic clouds for depth
- **Particle Effects**: 800+ animated dust particles
- **Constellation Patterns**: Dynamic star groupings that respond to timer state

### 🎨 Modern UI Design
- **Glassmorphism**: Frosted glass effect panels with backdrop blur
- **Responsive Layout**: Adapts to all screen sizes
- **Animated Transitions**: Smooth state changes and hover effects
- **Professional Typography**: System font stack for optimal readability

### 🎮 User Experience
- **Theme Selector**: Bottom-left modal with visual previews
- **Progress Indicators**: Real-time session progress tracking
- **Cognitive State Selection**: Choose your mental mode
- **Portal System**: Unlock new dimensions after completing sessions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AsteriodBlues/Chronosphere.git
cd Chronosphere
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

## 🛠 Tech Stack

### Core Technologies
- **React 18** - UI library with hooks and modern patterns
- **Vite** - Lightning-fast build tool and dev server
- **Three.js** - 3D graphics and WebGL rendering
- **React Three Fiber** - React renderer for Three.js

### Animation & Effects
- **Framer Motion** - Declarative animations and gestures
- **Custom Shaders** - GLSL shaders for liquid metal effects
- **RequestAnimationFrame** - Smooth 60fps animations

### Styling
- **CSS Modules** - Scoped styling
- **Tailwind CSS** - Utility-first CSS framework
- **Glassmorphism** - Modern translucent UI design

## 📁 Project Structure

```
Chronosphere/
├── src/
│   ├── components/
│   │   └── sphere/
│   │       └── SphereSelector.jsx    # Theme selection interface
│   ├── stores/
│   │   └── timerStore.js              # Timer state management
│   ├── App-integrated.jsx             # Main application component
│   ├── main.jsx                       # Application entry point
│   └── index.css                      # Global styles
├── public/                            # Static assets
├── package.json                       # Dependencies and scripts
└── vite.config.js                     # Vite configuration
```

## 🎨 Component Architecture

### SimpleLiquidMetalSphere
The centerpiece 3D sphere with custom shader materials:
- Vertex displacement for liquid effect
- Metallic material properties
- Dynamic color based on selected theme
- Responsive to user interactions

### BackgroundGalaxy
Multi-layered cosmic environment:
- 200+ animated stars with varying types
- Shooting stars with aurora trails
- Nebula cloud generation
- Particle dust system
- Dynamic energy waves

### EnhancedHUD
Glass-morphism interface overlay:
- Timer display with progress indicators
- Control buttons with hover states
- Session counter
- Cognitive state selector
- Progress tracking

### SphereSelector
Theme selection interface:
- Visual theme previews
- Smooth theme transitions
- Color psychology descriptions
- Glassmorphism design

## 🔧 Configuration

### Timer Settings
Default timer duration is 25 minutes. Modify in `App-integrated.jsx`:
```javascript
const [time, setTime] = useState(25 * 60) // Change 25 to desired minutes
```

### Theme Customization
Add new themes in `SphereSelector.jsx`:
```javascript
export const sphereThemes = [
  {
    id: 'custom',
    name: 'Custom Theme',
    color: '#hexcolor',
    accent: '#hexcolor',
    description: 'Your description'
  }
]
```

## 🎯 Usage Tips

1. **Starting a Session**: Click the sphere or play button to begin focus time
2. **Changing Themes**: Use the bottom-left selector to switch visual modes
3. **Tracking Progress**: Monitor session count in the top-right corner
4. **Adjusting Time**: Click on the timer display to modify duration
5. **Cognitive States**: Select your mental state for optimized visuals

## 🚀 Performance Optimization

- **Memoized Components**: React.memo for expensive renders
- **Optimized Shaders**: Efficient GLSL code for GPU rendering
- **Lazy Loading**: Suspense boundaries for async components
- **RAF Loops**: Controlled animation frames
- **Texture Atlasing**: Combined texture maps for fewer draw calls

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Three.js community for 3D rendering capabilities
- React team for the excellent framework
- Vite for the blazing-fast development experience
- Open source contributors who make projects like this possible

---

**Built with 🍕 late-night pizza and questionable energy drinks**

Experience the next level of productivity with Chronosphere - because if you're going to procrastinate, at least do it with a cool spinning sphere!