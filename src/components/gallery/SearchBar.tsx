"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search projects, tags, or authors...",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <Search
        size={18}
        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
          isFocused ? "text-[#667eea]" : "text-gray-500"
        }`}
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-10 py-2.5 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 transition-all focus:outline-none ${
          isFocused
            ? "border-[#667eea] ring-2 ring-[#667eea]/20"
            : "border-[#2a2a2a]"
        }`}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          title="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
