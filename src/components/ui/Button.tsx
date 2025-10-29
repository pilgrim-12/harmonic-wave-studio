import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-semibold transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // Variants
          {
            "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90 focus:ring-[#667eea]":
              variant === "primary",
            "bg-[#252525] text-gray-300 border border-[#333] hover:bg-[#2a2a2a] focus:ring-gray-500":
              variant === "secondary",
            "bg-gradient-to-r from-[#f093fb] to-[#f5576c] text-white hover:opacity-90 focus:ring-[#f5576c]":
              variant === "danger",
          },

          // Sizes
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
