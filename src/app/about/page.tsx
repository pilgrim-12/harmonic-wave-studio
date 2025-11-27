"use client";

import Link from "next/link";
import {
  Waves,
  Target,
  Lightbulb,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Users,
  BookOpen,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Waves className="text-[#667eea]" size={28} />
            <span className="text-xl font-bold text-white">
              Harmonic Wave Studio
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-white font-semibold"
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
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <span className="text-purple-400 text-sm font-semibold flex items-center gap-2">
              <Lightbulb size={16} />
              Making Math Visual and Interactive
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            About
            <br />
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              Harmonic Wave Studio
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            A powerful tool for visualizing and understanding Fourier series,
            making complex mathematical concepts accessible to everyone.
          </p>
        </div>
      </section>

      {/* Why We Built This */}
      <section className="py-20 px-4 bg-[#0f0f0f]">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-[#667eea]" size={32} />
            <h2 className="text-3xl font-bold text-white">Why We Built This</h2>
          </div>

          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Fourier series and harmonic analysis are fundamental concepts in
              mathematics, physics, and engineering. They explain how complex
              signals can be broken down into simple sine and cosine waves,
              powering everything from music compression to medical imaging.
            </p>

            <p>
              However, traditional teaching methods often struggle to convey
              the beauty and intuition behind these concepts. Students are
              presented with formulas and equations, but rarely get to{" "}
              <span className="text-white font-semibold">see</span> how
              epicycles actually construct complex waveforms in real-time.
            </p>

            <p>
              We created Harmonic Wave Studio to bridge this gap—to make
              abstract mathematics tangible, interactive, and beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits & Use Cases */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-[#667eea]" size={32} />
            <h2 className="text-3xl font-bold text-white">Who Benefits?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Students */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="text-blue-400" size={24} />
                <h3 className="text-xl font-semibold text-white">Students</h3>
              </div>
              <p className="text-gray-400">
                Learn Fourier series, signal processing, and frequency analysis
                through interactive visualization. See formulas come to life
                and build intuition for complex concepts.
              </p>
            </div>

            {/* Educators */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-green-400" size={24} />
                <h3 className="text-xl font-semibold text-white">Educators</h3>
              </div>
              <p className="text-gray-400">
                Create engaging demonstrations for your classes. Show students
                how epicycles construct waveforms, apply filters, and analyze
                frequency spectra in real-time.
              </p>
            </div>

            {/* Engineers */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-yellow-400" size={24} />
                <h3 className="text-xl font-semibold text-white">Engineers</h3>
              </div>
              <p className="text-gray-400">
                Rapidly prototype signal processing pipelines, test filter
                designs, and visualize frequency domain transformations without
                writing code.
              </p>
            </div>

            {/* Enthusiasts */}
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="text-purple-400" size={24} />
                <h3 className="text-xl font-semibold text-white">Enthusiasts</h3>
              </div>
              <p className="text-gray-400">
                Explore the beauty of mathematics and create stunning
                visualizations. Share your creations with the community and
                discover new patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We've Built */}
      <section className="py-20 px-4 bg-[#0f0f0f]">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="text-[#667eea]" size={32} />
            <h2 className="text-3xl font-bold text-white">What We've Built</h2>
          </div>

          <div className="space-y-4">
            {[
              "Real-time epicycle visualization with interactive controls",
              "Fast Fourier Transform (FFT) analysis and frequency spectrum visualization",
              "Digital filters: Low-pass, High-pass, Band-pass, and Notch filters",
              "Signal decomposition showing individual harmonic components",
              "Preset waveforms: Square, Sawtooth, Triangle, and more",
              "Drawing mode: Create custom waveforms with your mouse",
              "Project export/import as JSON files",
              "Signal data export as CSV for further analysis",
              "Visualization export as PNG images",
              "Real-time noise simulation and filtering",
              "Multiple trail tracking for complex visualizations",
              "Graph visibility controls for focused analysis",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800"
              >
                <CheckCircle2 className="text-green-400 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="text-[#667eea]" size={32} />
            <h2 className="text-3xl font-bold text-white">Future Plans</h2>
          </div>

          <div className="space-y-6 text-gray-300 text-lg leading-relaxed mb-8">
            <p>
              We're constantly working to improve Harmonic Wave Studio and add
              new features. Here's what's on our roadmap:
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Audio Integration",
                description:
                  "Generate and playback audio from your waveforms, turning visual patterns into sound.",
              },
              {
                title: "3D Visualizations",
                description:
                  "Explore epicycles and waveforms in three-dimensional space for even more stunning visuals.",
              },
              {
                title: "Collaborative Features",
                description:
                  "Share projects in real-time with others, perfect for remote teaching and collaboration.",
              },
              {
                title: "Advanced Signal Processing",
                description:
                  "Wavelet transforms, time-frequency analysis, and more advanced DSP tools.",
              },
              {
                title: "Mobile Apps",
                description:
                  "Native iOS and Android apps for learning on the go.",
              },
              {
                title: "Educational Curriculum",
                description:
                  "Step-by-step tutorials and lessons for students at all levels.",
              },
            ].map((plan, index) => (
              <div
                key={index}
                className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#667eea] transition-all"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {plan.title}
                </h3>
                <p className="text-gray-400">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Explore?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Start creating beautiful harmonic visualizations today.
            </p>
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
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-white transition-colors">
                    Gallery
                  </Link>
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
