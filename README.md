# Chronosphere - Advanced Focus System

**Transform your focus sessions into an immersive 3D experience.** Chronosphere combines the proven Pomodoro technique with stunning visual feedback - watch a liquid metal sphere morph and pulse as you work, surrounded by a living galaxy that responds to your productivity. Every focus session becomes a journey through space, making productivity not just effective, but genuinely enjoyable.

Perfect for developers, designers, students, and anyone who wants their work sessions to feel less like a chore and more like piloting a spacecraft through the cosmos.

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

</div>

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
- **React 18** - Component-based UI with hooks
- **Vite** - Lightning-fast HMR and build tool
- **Three.js** - WebGL 3D graphics library
- **React Three Fiber** - React renderer for Three.js

### Key Features
- **GLSL Shaders** - Custom liquid metal effects
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **Glassmorphism** - Modern UI aesthetic

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