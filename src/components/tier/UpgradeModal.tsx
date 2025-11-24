"use client";

import React, { useEffect, useState } from "react";
import { X, Crown, Check, Zap } from "lucide-react";
import { UserTier, getTierMetadata } from "@/config/tiers";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  requiredTier?: UserTier;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  requiredTier = "pro",
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Закрывать при нажатии Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tierMetadata = getTierMetadata(requiredTier);
  const isSignInRequired = !user && requiredTier === "free";
  const isUpgradeRequired = user && requiredTier === "pro";

  const handleAction = async () => {
    setIsLoading(true);

    try {
      if (isSignInRequired) {
        // Sign in with Google
        await signInWithGoogle();
        onClose();
      } else if (isUpgradeRequired) {
        // Redirect to pricing page
        window.location.href = "/pricing";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            {requiredTier === "pro" ? (
              <Crown size={32} className="text-yellow-500" />
            ) : (
              <Zap size={32} className="text-blue-500" />
            )}
            <h2 className="text-2xl font-bold text-white">
              {isSignInRequired
                ? "Sign In to Continue"
                : `Upgrade to ${tierMetadata.displayName}`}
            </h2>
          </div>

          {feature && (
            <p className="text-gray-400 text-sm">
              {isSignInRequired
                ? `Sign in free to unlock ${feature}`
                : `Upgrade to unlock ${feature} and more`}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isSignInRequired ? (
            // Sign In Flow
            <div className="space-y-4">
              <p className="text-gray-300">
                Create a free account to unlock:
              </p>

              <div className="space-y-3">
                {getTierMetadata("free").benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  ✨ <strong>100% Free</strong> - No credit card required
                </p>
              </div>
            </div>
          ) : (
            // Upgrade to Pro Flow
            <div className="space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${tierMetadata.price}
                  </span>
                  <span className="text-gray-400">/month</span>
                </div>
                {tierMetadata.yearlyPrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    or ${tierMetadata.yearlyPrice}/year (save 17%)
                  </p>
                )}
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Everything in Free, plus:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tierMetadata.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check
                        size={18}
                        className="text-yellow-400 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-300 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlight */}
              <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-200">
                  🚀 <strong>Join 1,000+ Pro users</strong> creating amazing
                  harmonic visualizations
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isLoading}
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleAction}
              variant="primary"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : isSignInRequired ? (
                "Sign In Free"
              ) : (
                "Upgrade Now"
              )}
            </Button>
          </div>

          {isUpgradeRequired && (
            <p className="text-xs text-center text-gray-500 mt-3">
              30-day money-back guarantee • Cancel anytime
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
