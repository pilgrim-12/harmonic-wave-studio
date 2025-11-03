# 🌊 Harmonic Wave Studio

**Visualize, Analyze, Filter - Signal Processing with Epicycles**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://harmonic-wave-studio.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An interactive web application for visualizing and analyzing signals through rotating epicycles and Fourier decomposition. Create complex waveforms, **analyze them with FFT**, **auto-generate epicycles**, hear them as audio, and export your work - all in your browser!

**🔗 Live Demo:** [harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

## ✨ Features

### 🎨 Interactive Visualization

- **Real-time epicycle animation** with smooth 60 FPS rendering
- **Dynamic signal graph** with auto-scaling and time tracking
- **Customizable radii** - adjust length, speed, direction, and color
- **Visual branch tracking** - highlight active radius chains
- **Trail visualization** - see the path traced by epicycles

### 📊 FFT Analysis ⭐ NEW!

- **Real-time frequency analysis** - FFT (Fast Fourier Transform) of any signal
- **Frequency spectrum** - visualize dominant frequencies and amplitudes
- **Peak detection** - automatic identification of significant components
- **Harmonic analysis** - find fundamental frequency and harmonics
- **THD calculation** - Total Harmonic Distortion metrics
- **Auto-generate epicycles** - reverse engineer signals into rotating radii! ✨
- **One-click generation** - from any signal to perfect epicycle reconstruction

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

### Analyzing Signals with FFT ⭐ NEW!

1. **Create a signal** - Use presets (Square Wave recommended) or add custom radii
2. **Run animation** - Press Start and let it run for 5-10 seconds
3. **Open Analysis panel** - Click "Analysis" in the left sidebar
4. **Analyze Signal** - Click the purple button to run FFT analysis
5. **View results:**
   - Fundamental frequency
   - Top 5 frequency peaks
   - Harmonics breakdown
   - THD (Total Harmonic Distortion)
6. **Generate Epicycles** - Click "Generate Epicycles from FFT"
7. **See the magic!** - Auto-generated radii perfectly recreate your signal! ✨

**This is Fourier transform magic** - any complex signal decomposed into simple rotating circles!

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
- **FFT Analysis** - See frequency domain representation in real-time ⭐

### For Teachers

- **Interactive demonstrations** - Engage students visually
- **Real-time experimentation** - Instant feedback on parameter changes
- **Cross-disciplinary** - Math, physics, music, engineering
- **Share examples** - Export and distribute projects easily
- **Reverse engineering** - Show how any signal = sum of frequencies ⭐

### For Researchers

- **Signal visualization** - Quick prototyping and exploration
- **Export data** - Integrate with MATLAB, Python, etc.
- **Custom patterns** - Create specific test signals
- **Educational outreach** - Explain concepts intuitively
- **FFT prototyping** - Fast frequency analysis tool ⭐

---

## �️ Technology Stack

**Frontend:**

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [fft.js](https://github.com/indutny/fft.js) - Fast Fourier Transform ⭐
- Canvas API - High-performance rendering
- Web Audio API - Audio synthesis

**Deployment:**

- [Vercel](https://vercel.com/) - Serverless deployment with CI/CD

**Development:**

- ESLint - Code linting
- Git - Version control

---

## 📁 Project Structure

```
harmonic-wave-studio/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── analysis/     # ⭐ FFT Analysis components
│   │   ├── ui/           # Reusable UI components
│   │   └── workspace/    # Main application components
│   ├── lib/              # Utilities and logic
│   │   ├── audio/        # Audio synthesis
│   │   ├── canvas/       # Rendering and calculations
│   │   ├── export/       # Export utilities
│   │   ├── fourier/      # ⭐ FFT, analyzer, generator
│   │   └── presets/      # Waveform presets
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript definitions
│   └── hooks/            # Custom React hooks
└── public/               # Static assets
```

---

## 🎯 Roadmap

### Phase 1 - MVP ✅ COMPLETE

- ✅ Real-time epicycle visualization
- ✅ Signal graph with auto-scaling
- ✅ Radius management (CRUD)
- ✅ Audio synthesis
- ✅ Export (JSON, CSV, PNG)
- ✅ 6 preset waveforms
- ✅ Keyboard shortcuts

### Phase 2 - FFT Analysis (IN PROGRESS)

- ✅ **FFT library integration** ⭐ NEW!
- ✅ **Frequency spectrum analyzer** ⭐ NEW!
- ✅ **Auto-generate epicycles from FFT** ⭐ NEW!
- ✅ **Peak detection and harmonic analysis** ⭐ NEW!
- [ ] Spectrum visualization (bar chart canvas)
- [ ] Generation options dialog
- [ ] CSV/audio signal import
- [ ] Signal reconstruction comparison

### Phase 3 - DSP Features (PLANNED)

- [ ] Noise generation (white, pink, gaussian)
- [ ] Digital filters (low-pass, high-pass, band-pass)
- [ ] SNR and quality metrics
- [ ] Before/after signal comparison

### Phase 4 - Enhanced UX (PLANNED)

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
- FFT magic powered by [fft.js](https://github.com/indutny/fft.js) ⭐

---

## 📧 Contact

**Project Link:** [https://github.com/pilgrim-12/harmonic-wave-studio](https://github.com/pilgrim-12/harmonic-wave-studio)

**Live Demo:** [https://harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

**Made with ❤️ for signal processing enthusiasts**

**Latest Update:** Phase 2.1 Complete - FFT Analysis & Auto-Generate Epicycles! ⭐
