"use client";

import React, { useState } from "react";
import { X, Send, Check } from "lucide-react";
import {
  FeedbackCategory,
  FEEDBACK_CATEGORIES,
} from "@/types/feedback";
import { feedbackService } from "@/lib/firebase/feedbackService";
import { useAuth } from "@/contexts/AuthContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] =
    useState<FeedbackCategory>("feedback");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to submit feedback");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await feedbackService.createFeedback({
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || undefined,
        category: selectedCategory,
        message: message.trim(),
      });

      setIsSuccess(true);
      setMessage("");

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      setSelectedCategory("feedback");
      setError(null);
      setIsSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white">Send Feedback</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Success Message */}
          {isSuccess && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <Check size={20} className="text-green-400" />
              <span className="text-green-400">
                Thank you for your feedback!
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FEEDBACK_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  disabled={isSubmitting || isSuccess}
                  className={`
                    p-3 rounded-lg border transition-all text-left
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      selectedCategory === category.value
                        ? "bg-[#667eea]/20 border-[#667eea] text-white"
                        : "bg-[#252525] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]"
                    }
                  `}
                >
                  <div className="text-sm font-medium">{category.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {category.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting || isSuccess}
              placeholder="Tell us what you think..."
              className="w-full h-32 px-4 py-3 bg-[#252525] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
            <div className="text-xs text-gray-500 mt-2">
              {message.length} / 1000 characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess || !message.trim()}
              className="px-6 py-2 bg-[#667eea] text-white rounded-lg hover:bg-[#5568d3] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
