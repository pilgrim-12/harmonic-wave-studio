"use client";

import React from "react";
import Link from "next/link";
import { Heart, Coffee, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function SupportPage() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/studio">
          <Button variant="secondary" className="mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to Studio
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <Heart size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Support Harmonic Wave Studio
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            This project is 100% free and always will be. If you find it useful, consider supporting its development.
          </p>
        </div>

        {/* Sign In CTA for non-users */}
        {!user && (
          <div className="mb-12 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-3">
                Get Full Access - 100% Free
              </h2>
              <p className="text-gray-300 mb-4">
                Sign in to unlock all features at no cost. No credit card required.
              </p>
              <Button
                onClick={signInWithGoogle}
                variant="primary"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
              >
                Sign In Free
              </Button>
            </div>
          </div>
        )}

        {/* Why Support? */}
        <div className="mb-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Why Support This Project?
          </h2>
          <p className="text-gray-300 mb-4">
            Harmonic Wave Studio is a passion project built to help people explore mathematical beauty through epicycles, Fourier analysis, and harmonic motion visualization.
          </p>
          <p className="text-gray-300 mb-6">
            Your donations help with:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Server and hosting costs for the gallery and project storage</span>
            </div>
            <div className="flex items-start gap-3">
              <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Development time for new features and improvements</span>
            </div>
            <div className="flex items-start gap-3">
              <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Maintenance and bug fixes</span>
            </div>
            <div className="flex items-start gap-3">
              <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Educational resources and documentation</span>
            </div>
          </div>
        </div>

        {/* Donation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Buy Me a Coffee */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 flex flex-col">
            <Coffee size={48} className="text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Buy Me a Coffee
            </h3>
            <p className="text-gray-400 mb-6 flex-1">
              One-time donation to support development. Any amount is appreciated!
            </p>
            <a
              href="https://buymeacoffee.com/harmonicwave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="primary"
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white"
              >
                <Coffee size={18} className="mr-2" />
                Buy Me a Coffee
              </Button>
            </a>
          </div>

          {/* Crypto */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 flex flex-col">
            <div className="text-4xl mb-4">₿</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Crypto Donations
            </h3>
            <p className="text-gray-400 mb-4 flex-1">
              Support with cryptocurrency (USDT, USDC, ETH, BTC)
            </p>
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">USDT/USDC (ERC-20):</p>
              <code className="text-sm text-blue-400 break-all">
                0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
              </code>
            </div>
            <p className="text-xs text-gray-500 text-center">
              More addresses available on request
            </p>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="text-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Thank You! 💜
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Whether you donate or not, thank you for using Harmonic Wave Studio.
            Your feedback, bug reports, and sharing the project with others is also incredibly valuable!
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <a
              href="https://github.com/harmonicwave/studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Star on GitHub
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="mailto:support@harmonicwave.studio"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Send Feedback
            </a>
          </div>
        </div>

        {/* Transparency Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔒 This is a passion project with no investor pressure or hidden costs.
            All features will always remain free for registered users.
          </p>
        </div>
      </div>
    </div>
  );
}
