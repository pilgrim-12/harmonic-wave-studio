"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/50",
    iconColor: "text-green-500",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/50",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/50",
    iconColor: "text-yellow-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/50",
    iconColor: "text-blue-500",
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} backdrop-blur-sm shadow-lg animate-slide-in-right`}
      style={{ minWidth: "320px", maxWidth: "420px" }}
    >
      <Icon size={20} className={`flex-shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-white mb-1">{title}</p>
        )}
        <p className="text-sm text-gray-300 break-words">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};
