"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  User as UserIcon,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      alert("Failed to sign out. Please try again.");
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
        <span className="text-sm text-gray-300 hidden md:block">
          {user.displayName || "User"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-xl z-50">
          <div className="p-4 border-b border-[#2a2a2a]">
            <p className="text-sm font-semibold text-white">
              {user.displayName || "User"}
            </p>
            <p className="text-xs text-gray-400 mt-1">{user.email}</p>
          </div>

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
