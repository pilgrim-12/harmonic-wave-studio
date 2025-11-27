"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) => {
  useEffect(() => {
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

  const variantStyles = {
    danger: {
      iconColor: "text-red-500",
      bgGradient: "from-red-900/20 to-red-900/10",
      borderColor: "border-red-500/30",
      buttonBg: "bg-red-600 hover:bg-red-500",
    },
    warning: {
      iconColor: "text-yellow-500",
      bgGradient: "from-yellow-900/20 to-yellow-900/10",
      borderColor: "border-yellow-500/30",
      buttonBg: "bg-yellow-600 hover:bg-yellow-500",
    },
    info: {
      iconColor: "text-blue-500",
      bgGradient: "from-blue-900/20 to-blue-900/10",
      borderColor: "border-blue-500/30",
      buttonBg: "bg-blue-600 hover:bg-blue-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`relative p-6 border-b border-[#2a2a2a] bg-gradient-to-r ${styles.bgGradient}`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-3">
            <AlertTriangle size={32} className={styles.iconColor} />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant="primary"
            className={`flex-1 ${styles.buttonBg}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
