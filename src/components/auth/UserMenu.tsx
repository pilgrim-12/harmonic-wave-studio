"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  User as UserIcon,
  FolderOpen,
  MessageSquare,
  Heart,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { UserTier } from "@/config/tiers";
import { UsageIndicator } from "@/components/tier/UsageIndicator";
import { useUsageStats } from "@/hooks/useUsageStats";
import { useRadiusStore } from "@/store/radiusStore";
import { useToast } from "@/contexts/ToastContext";

// Helper function to get tier badge config
const getTierBadge = (tier: UserTier) => {
  switch (tier) {
    case "pro":
      return {
        label: "PRO",
        icon: Sparkles,
        bgColor: "bg-purple-500/20",
        textColor: "text-purple-400",
      };
    case "free":
      return {
        label: "FREE",
        icon: UserIcon,
        bgColor: "bg-blue-500/20",
        textColor: "text-blue-400",
      };
    case "anonymous":
    default:
      return {
        label: "GUEST",
        icon: UserIcon,
        bgColor: "bg-gray-500/20",
        textColor: "text-gray-400",
      };
  }
};

export const UserMenu: React.FC = () => {
  const { user, signOut, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { radii } = useRadiusStore();
  const toast = useToast();

  const currentTier: UserTier = userProfile?.tier || (user ? "free" : "anonymous");
  const tierBadge = getTierBadge(currentTier);
  const BadgeIcon = tierBadge.icon;

  // Fetch usage stats
  const { stats, loading: statsLoading } = useUsageStats(radii.length);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleMyProjects = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#252525] transition-colors"
        title={user.displayName || user.email || "User"}
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#667eea] flex items-center justify-center">
            <UserIcon size={18} className="text-white" />
          </div>
        )}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-gray-300">
            {user.displayName || "User"}
          </span>
          {/* Tier Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${tierBadge.bgColor} ${tierBadge.textColor}`}
          >
            <BadgeIcon size={10} />
            {tierBadge.label}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-xl z-50">
          <div className="p-4 border-b border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">
                {user.displayName || "User"}
              </p>
              {/* Tier Badge in dropdown */}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${tierBadge.bgColor} ${tierBadge.textColor}`}
              >
                <BadgeIcon size={10} />
                {tierBadge.label}
              </span>
            </div>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>

          {/* Usage Indicators */}
          {!statsLoading && currentTier !== "anonymous" && (
            <div className="px-4 py-3 border-b border-[#2a2a2a] space-y-2">
              <div className="text-xs font-semibold text-gray-400 mb-2">
                Usage
              </div>
              <UsageIndicator
                label="Radii"
                current={stats.radii.current}
                limit={stats.radii.limit}
              />
              <UsageIndicator
                label="Projects"
                current={stats.projects.current}
                limit={stats.projects.limit}
              />
              <UsageIndicator
                label="Shares"
                current={stats.shares.current}
                limit={stats.shares.limit}
              />
            </div>
          )}

          <div className="py-2">
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#252525] transition-colors flex items-center gap-2"
              onClick={handleMyProjects}
            >
              <FolderOpen size={16} />
              My Projects
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#252525] transition-colors flex items-center gap-2"
              onClick={() => {
                setIsOpen(false);
                setIsFeedbackOpen(true);
              }}
            >
              <MessageSquare size={16} />
              Send Feedback
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#252525] transition-colors flex items-center gap-2"
              onClick={() => {
                setIsOpen(false);
                router.push("/support");
              }}
            >
              <Heart size={16} />
              Support Us
            </button>

            <hr className="my-2 border-[#2a2a2a]" />

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#252525] transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};
