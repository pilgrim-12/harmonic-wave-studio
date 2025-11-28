"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Copy, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export default function SupportPage() {
  const { user, signInWithGoogle } = useAuth();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
        {/* Header with logo */}
        <Link href="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity w-fit">
          <span className="text-2xl">🌊</span>
          <span className="text-xl font-bold text-white">
            Harmonic Wave Studio
          </span>
        </Link>

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

        {/* Donation Options - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

          {/* Ko-fi */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-3xl mb-3">☕</div>
            <h3 className="text-lg font-bold text-white mb-2">Ko-fi</h3>
            <p className="text-gray-400 text-sm mb-4">
              One-time & monthly
            </p>
            <a
              href="https://ko-fi.com/yuriichernov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button
                variant="primary"
                className="w-full bg-[#13C3FF] hover:bg-[#0FA3D9] text-white text-sm"
              >
                Support
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
              href="https://www.patreon.com/c/YuriiChernov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button
                variant="primary"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white text-sm"
              >
                Support
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
              onClick={() => setIsCryptoModalOpen(true)}
            >
              View Addresses
            </Button>
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
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Send Feedback
            </button>
          </div>
        </div>

        {/* Transparency Note */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 All features will always remain free for registered users.
          </p>
        </div>
      </div>

      {/* Crypto Modal */}
      {isCryptoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsCryptoModalOpen(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-purple-900/20 to-blue-900/20">
              <button
                onClick={() => setIsCryptoModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">₿</span>
                <h2 className="text-2xl font-bold text-white">
                  Cryptocurrency Addresses
                </h2>
              </div>
              <p className="text-gray-400 text-sm">
                Select a network to copy the wallet address
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                {/* BSC/BNB */}
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-5 hover:border-yellow-500/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
                      <path d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z" fill="white"/>
                    </svg>
                    <div>
                      <h3 className="text-white font-semibold">BNB Smart Chain</h3>
                      <p className="text-xs text-gray-500">BNB, USDT BEP20</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-black/30 rounded-lg p-3">
                    <code className="text-xs text-gray-300 break-all flex-1">
                      0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5
                    </code>
                    <button
                      onClick={() => copyToClipboard("0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5", "BSC")}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap ml-2"
                    >
                      {copiedAddress === "BSC" ? (
                        <>
                          <CheckCircle2 size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* TRON */}
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-5 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="16" fill="#FF060A"/>
                      <path d="M21.996 9.464l-13.532-.928L6 24.536l10.068-4.6 5.928-10.472zM9.932 22.068l1.332-9.668 8.732 6.8-10.064 2.868zm10.664-3.4l-8.464-6.6 11.064.8-2.6 5.8z" fill="white"/>
                    </svg>
                    <div>
                      <h3 className="text-white font-semibold">TRON</h3>
                      <p className="text-xs text-gray-500">TRX, USDT TRC20</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-black/30 rounded-lg p-3">
                    <code className="text-xs text-gray-300 break-all flex-1">
                      TKpT9iSDZEbvQ5GRW85mabUGCGWQ1CdPyw
                    </code>
                    <button
                      onClick={() => copyToClipboard("TKpT9iSDZEbvQ5GRW85mabUGCGWQ1CdPyw", "TRON")}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap ml-2"
                    >
                      {copiedAddress === "TRON" ? (
                        <>
                          <CheckCircle2 size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ethereum */}
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-5 hover:border-purple-500/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
                      <path d="M16.001 4L15.866 4.457v14.896l.135.135 6.193-3.662L16.001 4z" fill="white" fillOpacity="0.602"/>
                      <path d="M16.001 4L9.808 15.826l6.193 3.662V4z" fill="white"/>
                      <path d="M16.001 21.284l-.076.093v4.753l.076.222 6.197-8.727-6.197 3.659z" fill="white" fillOpacity="0.602"/>
                      <path d="M16.001 26.352v-5.068l-6.193-3.659 6.193 8.727z" fill="white"/>
                      <path d="M16.001 19.488l6.193-3.662-6.193-2.81v6.472z" fill="white" fillOpacity="0.2"/>
                      <path d="M9.808 15.826l6.193 3.662v-6.472l-6.193 2.81z" fill="white" fillOpacity="0.602"/>
                    </svg>
                    <div>
                      <h3 className="text-white font-semibold">Ethereum</h3>
                      <p className="text-xs text-gray-500">ETH, USDT ERC20, USDC</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-black/30 rounded-lg p-3">
                    <code className="text-xs text-gray-300 break-all flex-1">
                      0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5
                    </code>
                    <button
                      onClick={() => copyToClipboard("0x5f9fc192aA7437a482CD40824385D7B8ACB7C3D5", "ETH")}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap ml-2"
                    >
                      {copiedAddress === "ETH" ? (
                        <>
                          <CheckCircle2 size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2a2a2a] bg-[#0f0f0f] text-center">
              <p className="text-xs text-gray-500">
                Double-check the network before sending. Wrong network = lost funds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
