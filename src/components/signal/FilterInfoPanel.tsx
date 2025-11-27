"use client";

import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  FILTER_TYPE_INFO,
  FILTER_MODE_INFO,
  getFilterOrderAdvice,
} from "@/lib/signal/filterInfo";
import type { FilterSettings } from "@/store/filterStore";

interface FilterInfoPanelProps {
  filterSettings: FilterSettings | null;
}

export const FilterInfoPanel: React.FC<FilterInfoPanelProps> = ({
  filterSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!filterSettings) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
        <div className="flex items-center gap-2 text-gray-400">
          <Info size={16} />
          <span className="text-sm">
            Select a filter type to see information
          </span>
        </div>
      </div>
    );
  }

  const filterInfo = FILTER_TYPE_INFO[filterSettings.type];
  const modeInfo = FILTER_MODE_INFO[filterSettings.mode];
  const orderAdvice = getFilterOrderAdvice(filterSettings.order);

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#252525] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#667eea]/10 p-2 rounded-lg">
            <Info size={18} className="text-[#667eea]" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">
              {filterInfo.name} · {modeInfo.icon} {modeInfo.name}
            </h3>
            <p className="text-xs text-gray-400">
              Order: {filterSettings.order} · Cutoff: {filterSettings.cutoffFreq.toFixed(1)} Hz
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-[#2a2a2a]">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-[#667eea] mb-2">
              Description
            </h4>
            <p className="text-sm text-gray-300">{filterInfo.description}</p>
          </div>

          {/* Mode Info */}
          <div>
            <h4 className="text-sm font-semibold text-[#667eea] mb-2">
              Filter Mode
            </h4>
            <p className="text-sm text-gray-300">{modeInfo.description}</p>
          </div>

          {/* Order */}
          <div>
            <h4 className="text-sm font-semibold text-[#667eea] mb-2">
              Filter Order
            </h4>
            <p className="text-sm text-gray-300">{orderAdvice}</p>
          </div>

          {/* Characteristics */}
          <div>
            <h4 className="text-sm font-semibold text-[#667eea] mb-2">
              Characteristics
            </h4>
            <ul className="space-y-1">
              {filterInfo.characteristics.map((char, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-[#667eea] mt-1">•</span>
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h4 className="text-sm font-semibold text-[#667eea] mb-2">
              Use Cases
            </h4>
            <ul className="space-y-1">
              {filterInfo.useCases.map((useCase, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Details */}
          <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
            <h4 className="text-xs font-semibold text-[#667eea] mb-2 uppercase tracking-wide">
              Technical Details
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {filterInfo.technicalDetails}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
