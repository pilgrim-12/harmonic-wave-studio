"use client";

import Link from "next/link";
import {
  Sparkles,
  Wand2,
  BarChart3,
  Download,
  Users,
  Zap,
  Crown,
  ArrowRight,
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
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
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
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all">
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

            {/* Feature 2 */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all">
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

            {/* Feature 3 */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all">
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

            {/* Feature 4 */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="text-yellow-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Preset Waveforms
              </h3>
              <p className="text-gray-400">
                Start with classic waveforms like Square, Sawtooth, Triangle, and
                more complex patterns.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Download className="text-red-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Export Projects
              </h3>
              <p className="text-gray-400">
                Save your work as JSON, export signal data as CSV, or capture
                visualizations as PNG images.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all">
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
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl p-12">
            <Crown className="text-white mx-auto mb-4" size={48} />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Start creating beautiful harmonic visualizations for free. Upgrade
              to Pro for unlimited creativity.
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
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
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
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
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
              <h4 className="font-semibold text-white mb-4">Follow Us</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} Harmonic Wave Studio. Built with ❤️
              using Next.js and React.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
