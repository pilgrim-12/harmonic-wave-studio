"use client";

import React, { useEffect, useState } from "react";
import { X, Crown, Check, Zap } from "lucide-react";
import { UserTier, getTierMetadata } from "@/config/tiers";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";

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
  requiredTier = "free",
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

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

  const tierMetadata = getTierMetadata(requiredTier ?? "free");
  const isSignInRequired = !user;

  const handleAction = async () => {
    setIsLoading(true);

    try {
      if (isSignInRequired) {
        // Sign in with Google to get full access
        await signInWithGoogle();
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
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
            <Zap size={32} className="text-blue-500" />
            <h2 className="text-2xl font-bold text-white">
              Sign In to Continue
            </h2>
          </div>

          {feature && (
            <p className="text-gray-400 text-sm">
              Sign in free to unlock {feature} and all features
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <p className="text-gray-300">
              Create a free account to unlock all features:
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
                ✨ <strong>Currently Free</strong> - Sign in to unlock these features at no cost
              </p>
            </div>

            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-300">
                💜 <strong>Want unlimited access?</strong> - Check out our{" "}
                <a href="/pricing" className="underline hover:text-purple-200">
                  Pro plan
                </a>{" "}
                for unlimited radii, projects, and more
              </p>
            </div>
          </div>
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
              ) : (
                "Sign In Free"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
