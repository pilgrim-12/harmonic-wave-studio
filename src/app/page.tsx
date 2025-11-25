"use client";

import React from "react";
import Link from "next/link";
import {
  Waves,
  Sparkles,
  Wand2,
  BarChart3,
  Download,
  Users,
  Zap,
  Crown,
  ArrowRight,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="text-[#667eea]" size={28} />
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
              href="#examples"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Examples
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
            <a
              href="https://github.com/pilgrim-12/harmonic-wave-studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg" className="text-lg px-8">
                <Github size={20} />
                View on GitHub
              </Button>
            </a>
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
                <Waves className="text-blue-400" size={24} />
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
                <Waves className="text-[#667eea]" size={24} />
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
                  <a
                    href="https://github.com/pilgrim-12/harmonic-wave-studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Discord
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
