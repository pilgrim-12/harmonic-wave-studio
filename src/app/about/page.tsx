"use client";

import Link from "next/link";
import {
  Target,
  Lightbulb,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Users,
  BookOpen,
  Zap,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
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
                <span className="text-xl">🌊</span>
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
