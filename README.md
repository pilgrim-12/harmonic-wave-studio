# 🌊 Harmonic Wave Studio

**Visualize, Analyze, Filter, Share - Signal Processing with Epicycles**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://harmonic-wave-studio.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An interactive web application for visualizing and analyzing signals through rotating epicycles and Fourier decomposition. Create complex waveforms, **analyze them with FFT**, **auto-generate epicycles**, **add noise and filters**, **share with public links**, hear them as audio, and export your work - all in your browser!

**🔗 Live Demo:** [harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

## ✨ Features

### 🎨 Interactive Visualization

- **Real-time epicycle animation** with smooth 60 FPS rendering
- **Synchronized signal graphs** with unified scaling ⭐ NEW!
- **Three graph views**: Original Signal, Signal with Noise, Signal Comparison
- **Grid overlay on all graphs** - coordinate reference lines always visible
- **Customizable radii** - adjust length, speed, direction, and color
- **Visual branch tracking** - highlight active radius chains
- **Trail visualization** - see the path traced by epicycles
- **Auto-start on project load** - animation begins immediately after loading

### 🎛️ Signal Processing ⭐ NEW!

- **Noise Generation** - add white, pink, or gaussian noise
- **SNR Control** - adjustable signal-to-noise ratio (0-40 dB)
- **Digital Filters** - Butterworth low-pass, high-pass, band-pass, band-stop
- **Real-time Filtering** - see filter effects instantly
- **Filter Parameters** - cutoff frequency, filter order (1-4)
- **Before/After Comparison** - see original, noisy, and filtered signals together

### 📊 FFT Analysis

- **Real-time frequency analysis** - FFT (Fast Fourier Transform) of any signal
- **Frequency spectrum visualization** - interactive bar chart with color-coded frequencies
- **Peak detection** - automatic identification of significant components
- **Harmonic analysis** - find fundamental frequency and harmonics
- **THD calculation** - Total Harmonic Distortion metrics
- **Customizable generation** - dialog with adjustable settings for epicycle generation
- **Auto-generate epicycles** - reverse engineer signals into rotating radii!
- **Manual zoom control** - adjust visualization scale (10%-200%)

### 🔐 User Authentication & Cloud Storage

- **Google Sign-In** - secure Firebase authentication
- **Project persistence** - save projects to cloud database
- **User profiles** - manage your projects in one place
- **Auto-save** - projects saved automatically on changes
- **Load from anywhere** - access your work from any device

### 🔗 Project Sharing

- **Public share links** - one-click sharing with custom URLs
- **Share metadata** - add descriptions and tags to projects
- **View counter** - track how many people viewed your work
- **Open in Studio** - clone shared projects to edit
- **Manage shares** - update or revoke public links anytime
- **Gallery ready** - prepare projects for future community gallery

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
- **Ctrl+S** - Save project
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo

### 🎛️ Advanced Controls

- **Undo/Redo** - full history tracking
- **Grid and axes** - toggle reference lines
- **Animation speed** - control playback rate
- **Trail length** - adjust visual persistence
- **Graph duration** - customize time window
- **Manual zoom** - scale visualization 10%-200%
- **Sample rate control** - 30-2000 Hz for signal generation
- **Performance optimizations** - smooth rendering even with many radii

---

## 🏗️ Architecture

### Signal Flow (Single Source of Truth) ⭐ NEW!

```
┌─────────────────────────────────────────────────────────────────┐
│                    page.tsx (Animation Loop)                     │
│                                                                  │
│  1. calculateRadiusPositions(radii, center, time)               │
│  2. getFinalPoint(positions)                                    │
│  3. pushSignalPoint(time, y) ──────────────────────┐            │
│                                                     │            │
│  Throttled: 30 updates/sec for performance         │            │
└─────────────────────────────────────────────────────┼────────────┘
                                                      │
                                                      ▼
                    ┌─────────────────────────────────────────────┐
                    │       signalProcessingStore (Zustand)       │
                    │                                             │
                    │  signalBuffer: {time, y}[]  ← Ring buffer   │
                    │  original: number[]         ← Y values      │
                    │  noisy: number[]            ← With noise    │
                    │  scale: {minY, maxY, avgY}  ← Shared scale  │
                    │                                             │
                    │  ✅ Auto-applies noise when enabled         │
                    │  ✅ Calculates unified scale for all graphs │
                    └──────────┬──────────┬───────────────────────┘
                               │          │
                ┌──────────────┼──────────┼──────────────┐
                ▼              ▼          ▼              ▼
         ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
         │ Signal   │   │  Noisy   │   │ Filtered │   │  Filter  │
         │  Graph   │   │  Signal  │   │  Signal  │   │  Store   │
         │          │   │  Graph   │   │  Graph   │   │          │
         │ original │   │ original │   │ original │   │ filtered │
         │          │   │ + noisy  │   │ + noisy  │   │ signal   │
         └──────────┘   └──────────┘   │ +filtered│   └──────────┘
                                       └──────────┘
```

### Key Architectural Decisions

1. **Single Source of Truth**: All signal data flows through `signalProcessingStore`
2. **Ring Buffer**: Efficient time-windowed data storage with auto-cleanup
3. **Unified Scaling**: All graphs share the same Y-axis scale from store
4. **Throttled Updates**: 30 Hz store updates for smooth performance
5. **Time-Based Rendering**: X-axis synchronized across all graphs

### Store Structure

```typescript
// signalProcessingStore.ts
interface SignalProcessingStore {
  // Ring buffer with time + value
  signalBuffer: { time: number; y: number }[];
  bufferMaxDuration: number; // seconds to keep

  // Processed signals
  original: number[]; // Raw Y values
  noisy: number[]; // With noise applied

  // Unified scale for all graphs
  scale: {
    minY: number;
    maxY: number;
    avgY: number; // DC offset
  };

  // Noise configuration
  noiseApplied: boolean;
  noiseConfig: { type; snr; frequency };

  // Actions
  pushSignalPoint(time, y): void; // Single entry point!
  applyNoise(type, snr): void;
  resetSignal(): void;
}

// filterStore.ts
interface FilterStore {
  filteredSignal: number[];
  isFilterApplied: boolean;
  filterSettings: { type; mode; cutoff; order };

  applyFilterToSignal(signal, settings, sampleRate): void;
}
```

### Graph Components

All three graphs use identical rendering logic:

```typescript
// Shared across SignalGraph, NoisySignalGraph, FilteredSignalGraph
const { signalBuffer, scale } = useSignalProcessingStore.getState();
const { minY, maxY, avgY } = scale;

// Time-based X positioning
const timeScale = (width - 100) / graphDuration;
const x = currentX - (currentTime - point.time) * timeScale;

// Unified Y scaling
const centered = value - avgY;
const y = centerY - (centered - (minY + maxY) / 2) * yScale;
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account (for authentication & database)

### Installation

```bash
# Clone the repository
git clone https://github.com/pilgrim-12/harmonic-wave-studio.git
cd harmonic-wave-studio

# Install dependencies
npm install

# Set up Firebase
# 1. Create a Firebase project at https://console.firebase.google.com
# 2. Enable Google Authentication
# 3. Create a Firestore database
# 4. Copy your Firebase config to .env.local:
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Setup

1. **Create Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project

2. **Enable Authentication**

   - Authentication → Sign-in method → Google → Enable

3. **Create Firestore Database**

   - Firestore Database → Create database → Start in production mode

4. **Set Security Rules** (in Firestore → Rules tab):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /projects/{projectId} {
      allow read, write: if request.auth != null &&
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.userId;
    }
    match /shared-projects/{shareId} {
      allow read: if true;
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.userId;
    }
  }
}
```

5. **Get Firebase Config**
   - Project Settings → General → Your apps → Web app
   - Copy config to `.env.local`

### Build for Production

```bash
npm run build
npm start
```

---

## 📖 How to Use

### Signal Processing Workflow ⭐ NEW!

1. **Create Signal** - Add radii or load a preset
2. **Start Animation** - Press Play or Space
3. **Add Noise** - Signal Processing panel → Select noise type → Apply
4. **Apply Filter** - Choose filter type and cutoff → Apply Filter
5. **Compare** - See all three signals in the comparison graph!

### Creating Your First Signal

1. **Add Radii** - Click "Add Radius" to create rotating vectors
2. **Adjust Parameters** - Edit length, speed, and direction inline
3. **Start Animation** - Press "Start" or hit **Space**
4. **Watch the Magic** - See your signal form in real-time!

### Noise & Filtering

1. **Open Signal Processing** panel in sidebar
2. **Select Noise Type**: White, Pink, or Gaussian
3. **Adjust SNR** (0-40 dB) - lower = more noise
4. **Click "Apply Noise"**
5. **Select Filter**: Butterworth (Low-pass, High-pass, etc.)
6. **Set Cutoff Frequency** and Order
7. **Click "Apply Filter"** or enable real-time updates

### Analyzing Signals with FFT

1. **Create a signal** - Use presets (Square Wave recommended) or add custom radii
2. **Run animation** - Press Start and let it run for 5-10 seconds
3. **Stop animation** - Press Stop to capture the signal
4. **Open Analysis panel** - Click "Analysis" in the left sidebar
5. **Analyze Signal** - Click the purple button to run FFT analysis
6. **View spectrum visualization** - Interactive bar chart shows frequency components
7. **Review metrics:**
   - Fundamental frequency
   - Top 5 frequency peaks with color indicators
   - Harmonics breakdown
   - THD (Total Harmonic Distortion)
8. **Customize generation** - Click "Generate Epicycles from FFT" to open settings dialog
9. **Adjust settings:**
   - Number of radii (3-20)
   - Scale factor (20-150px)
   - Minimum amplitude threshold (1-30%)
   - Include DC offset option
10. **Preview & Generate** - See preview stats and generate optimized epicycles! ✨
11. **Adjust zoom** - Use Visualization panel zoom slider (10-200%) for perfect viewing

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
- **FFT Analysis** - See frequency domain representation in real-time
- **Signal Processing** - Learn noise and filtering concepts ⭐ NEW!
- **Share discoveries** - Publish findings with public links

### For Teachers

- **Interactive demonstrations** - Engage students visually
- **Real-time experimentation** - Instant feedback on parameter changes
- **Cross-disciplinary** - Math, physics, music, engineering
- **DSP education** - Demonstrate filters and noise effects ⭐ NEW!
- **Share examples** - Create public links for homework/demos
- **Reverse engineering** - Show how any signal = sum of frequencies
- **Track engagement** - See view counts on shared projects

### For Researchers

- **Signal visualization** - Quick prototyping and exploration
- **Export data** - Integrate with MATLAB, Python, etc.
- **Custom patterns** - Create specific test signals
- **Filter prototyping** - Test Butterworth filter designs ⭐ NEW!
- **Educational outreach** - Explain concepts intuitively
- **FFT prototyping** - Fast frequency analysis tool
- **Collaborate** - Share projects with colleagues via links

---

## 🏗️ Technology Stack

**Frontend:**

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [fft.js](https://github.com/indutny/fft.js) - Fast Fourier Transform
- Canvas API - High-performance rendering
- Web Audio API - Audio synthesis

**Backend & Database:**

- [Firebase Authentication](https://firebase.google.com/products/auth) - Google Sign-In
- [Cloud Firestore](https://firebase.google.com/products/firestore) - NoSQL database
- Firebase Security Rules - Access control

**Deployment:**

- [Vercel](https://vercel.com/) - Serverless deployment with CI/CD

---

## 📁 Project Structure

```
harmonic-wave-studio/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (app)/page.tsx      # Main page with animation loop ⭐
│   │   ├── profile/            # User profile page
│   │   └── project/[id]/       # Public share pages
│   ├── components/
│   │   ├── analysis/           # FFT Analysis components
│   │   ├── auth/               # Authentication UI
│   │   ├── share/              # Share button & modal
│   │   ├── signal/             # ⭐ Signal graphs (Noisy, Filtered)
│   │   ├── ui/                 # Reusable UI components
│   │   └── workspace/          # Main workspace components
│   │       └── SignalGraph.tsx # ⭐ Original signal graph
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication state
│   ├── lib/
│   │   ├── audio/              # Audio synthesis
│   │   ├── canvas/             # Rendering and calculations
│   │   ├── export/             # Export utilities
│   │   ├── firebase/           # Firebase config
│   │   ├── fourier/            # FFT, analyzer, generator
│   │   ├── presets/            # Waveform presets
│   │   └── dsp/                # ⭐ Digital Signal Processing
│   │       ├── noise.ts        # Noise generation
│   │       └── filters.ts      # Butterworth filters
│   ├── services/
│   │   ├── projectService.ts   # Cloud project CRUD
│   │   └── shareService.ts     # Public sharing logic
│   ├── store/                  # ⭐ Zustand state management
│   │   ├── signalProcessingStore.ts  # Signal buffer & scale
│   │   ├── filterStore.ts      # Filter state
│   │   ├── radiusStore.ts      # Epicycle radii
│   │   └── simulationStore.ts  # Animation state
│   ├── types/                  # TypeScript definitions
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
└── firestore.rules             # Firebase security rules
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

### Phase 2 - FFT Analysis ✅ COMPLETE

- ✅ FFT library integration
- ✅ Frequency spectrum analyzer
- ✅ Auto-generate epicycles from FFT
- ✅ Peak detection and harmonic analysis
- ✅ Generation options dialog
- ✅ Manual zoom control
- ✅ Undo/Redo with history

### Phase 3 - Project Sharing ✅ COMPLETE

- ✅ Firebase Authentication
- ✅ Cloud Firestore persistence
- ✅ Public share links
- ✅ View counter & analytics

### Phase 4 - Signal Processing ✅ COMPLETE ⭐ NEW!

- ✅ **Centralized signal architecture** - Single source of truth
- ✅ **Ring buffer** - Efficient time-windowed storage
- ✅ **Unified scaling** - All graphs in sync
- ✅ **Noise generation** - White, pink, gaussian
- ✅ **SNR control** - 0-40 dB range
- ✅ **Digital filters** - Butterworth (LP, HP, BP, BS)
- ✅ **Real-time filtering** - Instant visual feedback
- ✅ **Three synchronized graphs** - Original, Noisy, Comparison

### Phase 5 - Community (PLANNED)

- [ ] Public Gallery - Browse shared projects
- [ ] Search & Filter - Find projects by tags
- [ ] Like & Comment - Engage with community
- [ ] Featured Projects - Showcase best work
- [ ] Mobile-optimized interface
- [ ] Tutorial and onboarding

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
- FFT magic powered by [fft.js](https://github.com/indutny/fft.js)
- Authentication & database by [Firebase](https://firebase.google.com/)

---

## 📧 Contact

**Project Link:** [https://github.com/pilgrim-12/harmonic-wave-studio](https://github.com/pilgrim-12/harmonic-wave-studio)

**Live Demo:** [https://harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

**Made with ❤️ for signal processing enthusiasts**

**Latest Update:** Phase 4 Complete - Signal Processing Architecture! 🎛️⭐  
**Progress:** Phases 1-4 = 100% Complete! 🚀
