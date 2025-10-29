import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, label, showValue = true, valueFormatter, value, ...props },
    ref
  ) => {
    const displayValue = valueFormatter ? valueFormatter(Number(value)) : value;

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            {showValue && (
              <span className="text-sm font-semibold text-[#667eea]">
                {displayValue}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            "w-full h-2 bg-[#252525] rounded-lg appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:bg-[#667eea] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[#667eea]",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";
