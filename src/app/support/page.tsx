"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Check, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function SupportPage() {
  const { user, signInWithGoogle } = useAuth();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (address: string, label: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(label);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/studio">
          <Button variant="secondary" className="mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Back to Studio
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <Heart size={48} className="mx-auto text-red-500 mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Support Harmonic Wave Studio
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            100% free forever. If you find it useful, consider supporting development.
          </p>
        </div>

        {/* Sign In CTA for non-users */}
        {!user && (
          <div className="mb-8 p-5 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Get Full Access - 100% Free
              </h2>
              <p className="text-gray-300 mb-3 text-sm">
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

        {/* Why Support? - Compact */}
        <div className="mb-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">
            Why Support?
          </h2>
          <p className="text-gray-300 text-sm mb-4">
            Your donations help with server costs, development, maintenance, and educational resources.
          </p>
        </div>

        {/* Donation Options - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* PayPal */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="text-lg font-bold text-white mb-2">PayPal</h3>
            <p className="text-gray-400 text-sm mb-4">
              One-time donation
            </p>
            <a
              href="https://paypal.com/paypalme/yuriichernov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >
                Donate
              </Button>
            </a>
          </div>

          {/* Patreon */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-white mb-2">Patreon</h3>
            <p className="text-gray-400 text-sm mb-4">
              Monthly support
            </p>
            <a
              href="https://patreon.com/harmonicwave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button
                variant="primary"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white text-sm"
              >
                Coming Soon
              </Button>
            </a>
          </div>

          {/* Crypto */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-3xl mb-3">₿</div>
            <h3 className="text-lg font-bold text-white mb-2">Crypto</h3>
            <p className="text-gray-400 text-sm mb-4">
              Multiple networks
            </p>
            <Button
              variant="primary"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm"
              onClick={() => {
                document.getElementById("crypto-details")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Addresses
            </Button>
          </div>
        </div>

        {/* Crypto Details Section */}
        <div id="crypto-details" className="mb-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">₿</span>
            Cryptocurrency Addresses
          </h3>
          <div className="space-y-3">
            {/* BSC/BNB */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-300">BSC (BNB Chain)</p>
                <button
                  onClick={() => copyToClipboard("0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5", "BSC")}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copiedAddress === "BSC" ? (
                    <>
                      <CheckCircle2 size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <code className="text-xs text-gray-400 break-all block">
                0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5
              </code>
            </div>

            {/* TRON */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-300">TRON (TRX, USDT TRC20)</p>
                <button
                  onClick={() => copyToClipboard("TKpT9iSDZEbvQ5GRW85mabUGCGWQ1CdPyw", "TRON")}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copiedAddress === "TRON" ? (
                    <>
                      <CheckCircle2 size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <code className="text-xs text-gray-400 break-all block">
                TKpT9iSDZEbvQ5GRW85mabUGCGWQ1CdPyw
              </code>
            </div>

            {/* Ethereum */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-300">Ethereum (ETH, USDT, USDC)</p>
                <button
                  onClick={() => copyToClipboard("0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5", "ETH")}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copiedAddress === "ETH" ? (
                    <>
                      <CheckCircle2 size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <code className="text-xs text-gray-400 break-all block">
                0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5
              </code>
            </div>
          </div>
        </div>

        {/* Thank You Section - Compact */}
        <div className="text-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">
            Thank You! 💜
          </h2>
          <p className="text-gray-300 text-sm mb-4">
            Whether you donate or not, thank you for using Harmonic Wave Studio!
          </p>
          <div className="flex gap-4 justify-center text-sm">
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
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 All features will always remain free for registered users.
          </p>
        </div>
      </div>
    </div>
  );
}
