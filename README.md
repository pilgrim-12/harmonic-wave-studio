# 🌊 Harmonic Wave Studio

**Visualize, Analyze, Filter - Signal Processing with Epicycles**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://harmonic-wave-studio.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An interactive web application for visualizing and analyzing signals through rotating epicycles and Fourier decomposition. Create complex waveforms, hear them as audio, and export your work - all in your browser!

**🔗 Live Demo:** [harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

## ✨ Features

### 🎨 Interactive Visualization

- **Real-time epicycle animation** with smooth 60 FPS rendering
- **Dynamic signal graph** with auto-scaling and time tracking
- **Customizable radii** - adjust length, speed, direction, and color
- **Visual branch tracking** - highlight active radius chains
- **Trail visualization** - see the path traced by epicycles

### 🎵 Audio Synthesis

- **Signal-to-sound conversion** using Web Audio API
- **Musical note selection** (C4 through C5)
- **Hear your waveforms** - transform visual patterns into audio
- **Real-time playback** with periodic wave generation

### 📦 Export & Import

- **JSON export** - save complete projects with all parameters
- **CSV export** - export signal data for analysis
- **PNG export** - capture beautiful screenshots
- **One-click downloads** - no server required

### ⚡ Preset Waveforms

- **Sine Wave** - pure fundamental frequency
- **Square Wave** - odd harmonics (1, 3, 5, 7...)
- **Sawtooth Wave** - all harmonics (1, 2, 3, 4...)
- **Triangle Wave** - odd harmonics with alternating phase
- **Complex Patterns** - multi-frequency combinations
- **Beating Frequencies** - interference patterns

### ⌨️ Keyboard Shortcuts

- **Space** - Play/Pause animation
- **S** - Stop
- **R** - Reset
- **Delete** - Remove selected radius
- **Escape** - Close modals

### 🎛️ Advanced Controls

- **Grid and axes** - toggle reference lines
- **Animation speed** - control playback rate
- **Trail length** - adjust visual persistence
- **Graph duration** - customize time window
- **Performance optimizations** - smooth rendering even with many radii

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/pilgrim-12/harmonic-wave-studio.git
cd harmonic-wave-studio

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 📖 How to Use

### Creating Your First Signal

1. **Add Radii** - Click "Add Radius" to create rotating vectors
2. **Adjust Parameters** - Edit length, speed, and direction inline
3. **Start Animation** - Press "Start" or hit **Space**
4. **Watch the Magic** - See your signal form in real-time!

### Loading Presets

1. Click **"Presets"** button
2. Choose from 6 classic waveforms
3. Experiment and modify as needed

### Playing Audio

1. Run the animation to generate signal data
2. Select a musical note (e.g., A4 = 440 Hz)
3. Click **"Play"** to hear your waveform!
4. Different waveforms = different timbres 🎵

### Exporting Your Work

- **JSON** - Save complete project with all radii
- **CSV** - Export time-series data for analysis
- **PNG** - Capture beautiful visualizations

---

## 🎓 Educational Use Cases

### For Students

- **Understand Fourier Series** - See how complex signals decompose
- **Visualize harmonics** - Observe frequency relationships
- **Explore waveforms** - Compare sine, square, sawtooth waves
- **Learn through sound** - Connect visual and audio representations

### For Teachers

- **Interactive demonstrations** - Engage students visually
- **Real-time experimentation** - Instant feedback on parameter changes
- **Cross-disciplinary** - Math, physics, music, engineering
- **Share examples** - Export and distribute projects easily

### For Researchers

- **Signal visualization** - Quick prototyping and exploration
- **Export data** - Integrate with MATLAB, Python, etc.
- **Custom patterns** - Create specific test signals
- **Educational outreach** - Explain concepts intuitively

---

## 🏗️ Technology Stack

**Frontend:**

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Zustand](https://github.com/pmndrs/zustand) - State management
- Canvas API - High-performance rendering
- Web Audio API - Audio synthesis

**Deployment:**

- [Vercel](https://vercel.com/) - Serverless deployment with CI/CD

**Development:**

- ESLint - Code linting
- Prettier - Code formatting
- Git - Version control

---

## 📁 Project Structure

```
harmonic-wave-studio/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── workspace/   # Main application components
│   ├── lib/             # Utilities and logic
│   │   ├── audio/       # Audio synthesis
│   │   ├── canvas/      # Rendering and calculations
│   │   ├── export/      # Export utilities
│   │   └── presets/     # Waveform presets
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript definitions
│   └── hooks/           # Custom React hooks
└── public/              # Static assets
```

---

## 🎯 Roadmap

### Phase 2 - Advanced Analysis (Planned)

- [ ] FFT Analysis - reverse engineer signals
- [ ] Signal import from CSV/audio files
- [ ] Automatic epicycle generation from FFT
- [ ] Frequency spectrum visualization
- [ ] Signal reconstruction comparison

### Phase 3 - DSP Features (Planned)

- [ ] Noise generation (white, pink, gaussian)
- [ ] Digital filters (low-pass, high-pass, band-pass)
- [ ] SNR and quality metrics
- [ ] Before/after signal comparison

### Phase 4 - Enhanced UX (Planned)

- [ ] Dark/Light theme toggle
- [ ] Mobile-optimized interface
- [ ] Tutorial and onboarding
- [ ] Project library and favorites
- [ ] Community gallery

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the beauty of Fourier decomposition
- Built with modern web technologies
- Designed for education and exploration

---

## 📧 Contact

**Project Link:** [https://github.com/pilgrim-12/harmonic-wave-studio](https://github.com/pilgrim-12/harmonic-wave-studio)

**Live Demo:** [https://harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

**Made with ❤️ for signal processing enthusiasts**
