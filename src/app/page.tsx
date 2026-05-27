"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Wand2,
  BarChart3,
  Download,
  Users,
  Zap,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span className="text-xl font-bold text-white">
              Harmonic Wave Studio
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link href="/studio">
              <Button size="sm">Launch Studio</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
              <Sparkles size={16} />
              Interactive Fourier Series Visualization
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Explore the Beauty of
            <br />
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              Harmonic Waves
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Create stunning visualizations of Fourier series, analyze frequency
            components, and explore signal processing — all in real-time with an
            intuitive interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/studio">
              <Button size="lg" className="text-lg px-8">
                <Zap size={20} />
                Start Creating
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="secondary" size="lg" className="text-lg px-8">
                <Users size={20} />
                View Gallery
              </Button>
            </Link>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            No installation required • Works in your browser • Free to start
          </div>

          {/* Hero Screenshot */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 blur-3xl rounded-full" />
            <div className="relative rounded-xl overflow-hidden border border-gray-700 shadow-2xl shadow-purple-500/10">
              <Image
                src="/screenshots/studio-main.jpg"
                alt="Harmonic Wave Studio Interface"
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-[#0f0f0f]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to create, analyze, and understand harmonic wave
            patterns.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all overflow-hidden group">
              <div className="h-40 overflow-hidden">
                <Image
                  src="/screenshots/astrix-project.jpg"
                  alt="Real-time Visualization"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🌊</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Real-time Visualization
                </h3>
                <p className="text-gray-400">
                  Watch epicycles rotate in real-time as they construct complex
                  waveforms through Fourier series.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all overflow-hidden group">
              <div className="h-40 overflow-hidden">
                <Image
                  src="/screenshots/spectrum-fullscreen.jpg"
                  alt="FFT Analysis"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-purple-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  FFT Analysis
                </h3>
                <p className="text-gray-400">
                  Analyze frequency components with Fast Fourier Transform and
                  visualize the frequency spectrum.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all overflow-hidden group">
              <div className="h-40 overflow-hidden">
                <Image
                  src="/screenshots/apply-filters.jpg"
                  alt="Digital Filters"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Wand2 className="text-green-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Digital Filters
                </h3>
                <p className="text-gray-400">
                  Apply low-pass, high-pass, band-pass, and notch filters to shape
                  your signals in real-time.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all overflow-hidden group">
              <div className="h-40 overflow-hidden">
                <Image
                  src="/screenshots/decomposition.jpg"
                  alt="Signal Decomposition"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="text-yellow-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Signal Decomposition
                </h3>
                <p className="text-gray-400">
                  See how complex signals are built from individual sine waves,
                  each with its own frequency and amplitude.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all overflow-hidden group">
              <div className="h-40 overflow-hidden">
                <Image
                  src="/screenshots/presets.jpg"
                  alt="Presets and Export"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Download className="text-red-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Presets & Export
                </h3>
                <p className="text-gray-400">
                  Start with classic waveforms like Square, Sawtooth, Triangle.
                  Export as JSON, CSV, or PNG images.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all overflow-hidden group">
              <div className="h-40 overflow-hidden">
                <Image
                  src="/screenshots/gallery-all.jpg"
                  alt="Community Gallery"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-pink-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Share & Collaborate
                </h3>
                <p className="text-gray-400">
                  Share your creations with a public link and explore projects from
                  the community gallery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl p-12">
            <Zap className="text-white mx-auto mb-4" size={48} />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Start creating beautiful harmonic visualizations. Sign in for free
              to unlock all features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/studio">
                <Button
                  size="lg"
                  className="bg-white text-[#667eea] hover:bg-gray-100"
                >
                  Launch Studio
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-[#0f0f0f]">
        <div className="container mx-auto max-w-2xl text-center">
          <Mail className="text-[#667eea] mx-auto mb-4" size={36} />
          <h2 className="text-2xl font-bold text-white mb-3">
            Have Ideas, Questions, or Suggestions?
          </h2>
          <p className="text-gray-400 mb-6">
            We&apos;d love to hear from you! Feel free to reach out with any feedback or ideas.
          </p>
          <a
            href="mailto:yurachernov12@gmail.com"
            className="inline-flex items-center gap-2 text-[#667eea] hover:text-[#8b9ff5] transition-colors text-lg font-medium"
          >
            <Mail size={18} />
            yurachernov12@gmail.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌊</span>
                <span className="font-bold text-white">
                  Harmonic Wave Studio
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Interactive Fourier series and harmonic wave visualization tool.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/studio" className="hover:text-white transition-colors">
                    Studio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery"
                    className="hover:text-white transition-colors"
                  >
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-white transition-colors">
                    Gallery
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="mailto:yurachernov12@gmail.com" className="hover:text-white transition-colors">
                    yurachernov12@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Harmonic Wave Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
