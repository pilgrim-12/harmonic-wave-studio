import React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2 bg-[#252525] border border-[#333] rounded-md",
            "text-white",
            "focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "cursor-pointer",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
