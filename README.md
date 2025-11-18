# 🌊 Harmonic Wave Studio

**Visualize, Analyze, Filter, Share - Signal Processing with Epicycles**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://harmonic-wave-studio.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An interactive web application for visualizing and analyzing signals through rotating epicycles and Fourier decomposition. Create complex waveforms, **analyze them with FFT**, **auto-generate epicycles**, **share with public links**, hear them as audio, and export your work - all in your browser!

**🔗 Live Demo:** [harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

## ✨ Features

### 🎨 Interactive Visualization

- **Real-time epicycle animation** with smooth 60 FPS rendering
- **Dynamic signal graph** with auto-scaling and time tracking
- **Grid overlay on all graphs** - coordinate reference lines always visible ⭐ NEW!
- **Customizable radii** - adjust length, speed, direction, and color
- **Visual branch tracking** - highlight active radius chains
- **Trail visualization** - see the path traced by epicycles
- **Auto-start on project load** - animation begins immediately after loading ⭐ NEW!

### 📊 FFT Analysis

- **Real-time frequency analysis** - FFT (Fast Fourier Transform) of any signal
- **Frequency spectrum visualization** - interactive bar chart with color-coded frequencies ⭐
- **Peak detection** - automatic identification of significant components
- **Harmonic analysis** - find fundamental frequency and harmonics
- **THD calculation** - Total Harmonic Distortion metrics
- **Customizable generation** - dialog with adjustable settings for epicycle generation ⭐
- **Auto-generate epicycles** - reverse engineer signals into rotating radii! ✨
- **Manual zoom control** - adjust visualization scale (10%-200%) ⭐

### 🔐 User Authentication & Cloud Storage ⭐ NEW!

- **Google Sign-In** - secure Firebase authentication
- **Project persistence** - save projects to cloud database
- **User profiles** - manage your projects in one place
- **Auto-save** - projects saved automatically on changes
- **Load from anywhere** - access your work from any device

### 🔗 Project Sharing ⭐ NEW!

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

- **Undo/Redo** - full history tracking ⭐ NEW!
- **Grid and axes** - toggle reference lines
- **Animation speed** - control playback rate
- **Trail length** - adjust visual persistence
- **Graph duration** - customize time window
- **Manual zoom** - scale visualization 10%-200% ⭐
- **Performance optimizations** - smooth rendering even with many radii

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
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projects collection (Private)
    match /projects/{projectId} {
      allow read, write: if request.auth != null &&
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.userId;
    }

    // Shared Projects collection (Public reads)
    match /shared-projects/{shareId} {
      allow read: if true;  // Anyone can read
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
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 📖 How to Use

### Getting Started

1. **Sign In** - Click "Sign In" and use your Google account
2. **Create Project** - Add radii and build your signal
3. **Save** - Click "Save" to store in cloud
4. **Share** - Click "Share" to create public link

### Creating Your First Signal

1. **Add Radii** - Click "Add Radius" to create rotating vectors
2. **Adjust Parameters** - Edit length, speed, and direction inline
3. **Start Animation** - Press "Start" or hit **Space**
4. **Watch the Magic** - See your signal form in real-time!

### Loading Presets

1. Click **"Presets"** button
2. Choose from 6 classic waveforms
3. Experiment and modify as needed

### Sharing Your Work ⭐ NEW!

1. **Create & Save** - Build your project and click "Save"
2. **Open Share Dialog** - Click "Share" button
3. **Add Details:**
   - Project name
   - Description (optional, max 200 chars)
   - Tags (comma-separated)
4. **Generate Link** - Click "Share Project"
5. **Copy & Share** - Link auto-copies to clipboard!
6. **Track Views** - See how many people viewed your project
7. **Manage** - Click "Manage Share" to update or revoke

**Anyone with the link can:**

- View your project details
- See the configuration (radii, settings)
- Click "Open in Studio" to edit their own copy

### Managing Your Projects

1. **Profile** - Click your avatar → "Profile"
2. **View Projects** - See all your saved projects
3. **Shared Badge** - Projects with 🔗 are publicly shared
4. **Load** - Click "Load" to open in studio
5. **Delete** - Remove unwanted projects

### Analyzing Signals with FFT

1. **Create a signal** - Use presets (Square Wave recommended) or add custom radii
2. **Run animation** - Press Start and let it run for 5-10 seconds
3. **Stop animation** - Press Stop to capture the signal
4. **Open Analysis panel** - Click "Analysis" in the left sidebar
5. **Analyze Signal** - Click the purple button to run FFT analysis
6. **View spectrum visualization** - Interactive bar chart shows frequency components ⭐
7. **Review metrics:**
   - Fundamental frequency
   - Top 5 frequency peaks with color indicators
   - Harmonics breakdown
   - THD (Total Harmonic Distortion)
8. **Customize generation** - Click "Generate Epicycles from FFT" to open settings dialog ⭐
9. **Adjust settings:**
   - Number of radii (3-20)
   - Scale factor (20-150px)
   - Minimum amplitude threshold (1-30%)
   - Include DC offset option
10. **Preview & Generate** - See preview stats and generate optimized epicycles! ✨
11. **Adjust zoom** - Use Visualization panel zoom slider (10-200%) for perfect viewing ⭐

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
- **Share discoveries** - Publish findings with public links ⭐

### For Teachers

- **Interactive demonstrations** - Engage students visually
- **Real-time experimentation** - Instant feedback on parameter changes
- **Cross-disciplinary** - Math, physics, music, engineering
- **Share examples** - Create public links for homework/demos ⭐
- **Reverse engineering** - Show how any signal = sum of frequencies ⭐
- **Track engagement** - See view counts on shared projects ⭐

### For Researchers

- **Signal visualization** - Quick prototyping and exploration
- **Export data** - Integrate with MATLAB, Python, etc.
- **Custom patterns** - Create specific test signals
- **Educational outreach** - Explain concepts intuitively
- **FFT prototyping** - Fast frequency analysis tool ⭐
- **Collaborate** - Share projects with colleagues via links ⭐

---

## 🏗️ Technology Stack

**Frontend:**

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [fft.js](https://github.com/indutny/fft.js) - Fast Fourier Transform ⭐
- Canvas API - High-performance rendering
- Web Audio API - Audio synthesis

**Backend & Database:**

- [Firebase Authentication](https://firebase.google.com/products/auth) - Google Sign-In ⭐
- [Cloud Firestore](https://firebase.google.com/products/firestore) - NoSQL database ⭐
- Firebase Security Rules - Access control ⭐

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
│   │   ├── profile/      # ⭐ User profile page
│   │   └── project/      # ⭐ Public share pages
│   │       └── [id]/     #    /project/share_xxx
│   ├── components/       # React components
│   │   ├── analysis/     # FFT Analysis components
│   │   ├── auth/         # ⭐ Authentication UI
│   │   ├── share/        # ⭐ Share button & modal
│   │   ├── ui/           # Reusable UI components
│   │   └── workspace/    # Main application components
│   ├── contexts/         # ⭐ React contexts
│   │   └── AuthContext   #    Authentication state
│   ├── lib/              # Utilities and logic
│   │   ├── audio/        # Audio synthesis
│   │   ├── canvas/       # Rendering and calculations
│   │   ├── export/       # Export utilities
│   │   ├── firebase/     # ⭐ Firebase config
│   │   ├── fourier/      # FFT, analyzer, generator
│   │   └── presets/      # Waveform presets
│   ├── services/         # ⭐ Business logic
│   │   ├── projectService # Cloud project CRUD
│   │   └── shareService   # Public sharing logic
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript definitions
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
└── firestore.rules       # ⭐ Firebase security rules
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

### Phase 2 - FFT Analysis & UX ✅ COMPLETE

- ✅ **FFT library integration** ⭐
- ✅ **Frequency spectrum analyzer** ⭐
- ✅ **Auto-generate epicycles from FFT** ⭐
- ✅ **Peak detection and harmonic analysis** ⭐
- ✅ **Spectrum visualization (bar chart canvas)** ⭐
- ✅ **Generation options dialog** ⭐
- ✅ **Manual zoom control** ⭐
- ✅ **Grid overlay on all visualizations** ⭐
- ✅ **Auto-start animation on project load** ⭐
- ✅ **Signal graph legends and labels** ⭐
- ✅ **Undo/Redo with history** ⭐

### Phase 13 - Project Sharing ✅ COMPLETE ⭐ NEW!

- ✅ **Firebase Authentication** - Google Sign-In
- ✅ **Cloud Firestore** - Project persistence
- ✅ **User Profiles** - Manage saved projects
- ✅ **Public Share Links** - One-click sharing
- ✅ **Share Metadata** - Descriptions & tags
- ✅ **View Counter** - Track engagement
- ✅ **Open in Studio** - Clone shared projects
- ✅ **Share Management** - Update/revoke links
- ✅ **Security Rules** - Proper access control

### Phase 3 - DSP Features (PLANNED)

- [ ] Noise generation (white, pink, gaussian)
- [ ] Digital filters (low-pass, high-pass, band-pass)
- [ ] SNR and quality metrics
- [ ] Before/after signal comparison
- [ ] CSV/audio signal import
- [ ] Signal reconstruction comparison

### Phase 4 - Community & UX (PLANNED)

- [ ] Public Gallery - Browse shared projects
- [ ] Search & Filter - Find projects by tags
- [ ] Like & Comment - Engage with community
- [ ] Featured Projects - Showcase best work
- [ ] Dark/Light theme toggle
- [ ] Mobile-optimized interface
- [ ] Tutorial and onboarding
- [ ] Project collections/playlists

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
- Authentication & database by [Firebase](https://firebase.google.com/) ⭐

---

## 📧 Contact

**Project Link:** [https://github.com/pilgrim-12/harmonic-wave-studio](https://github.com/pilgrim-12/harmonic-wave-studio)

**Live Demo:** [https://harmonic-wave-studio.vercel.app](https://harmonic-wave-studio.vercel.app)

---

**Made with ❤️ for signal processing enthusiasts**

**Latest Update:** Phase 13 Complete - Project Sharing with Firebase! 🔗⭐  
**Progress:** Phases 1, 2, 13 = 100% Complete! 🚀

```

---

## 🎉 Ready to commit!

**Commit message:**
```

feat: Phase 13 - Project Sharing Complete 🔗

✅ Firebase Authentication (Google Sign-In)
✅ Cloud Firestore persistence
✅ User profiles with project management
✅ Public share links with metadata
✅ View counter & share analytics
✅ "Open in Studio" - clone shared projects
✅ Share management (update/revoke)
✅ Firestore security rules
✅ Share badge in project list
✅ Auto-copy link on first share
✅ Modal UX improvements

Phase 13: 100% Complete! 🚀
