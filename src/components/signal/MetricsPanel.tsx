"use client";

import React from "react";
import { useSignalProcessingStore } from "@/store/signalProcessingStore";

export const MetricsPanel: React.FC = () => {
  const { metrics, noisy, filtered } = useSignalProcessingStore();

  if (!metrics) return null;

  const hasNoisy = noisy.length > 0;
  const hasFiltered = filtered.length > 0;

  return (
    <div className="space-y-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
      <h3 className="text-sm font-semibold text-white">Quality Metrics</h3>

      {/* Original vs Noisy */}
      {hasNoisy && (
        <div className="bg-[#0f0f0f] p-3 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-300 mb-2">
            Original vs Noisy
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <MetricItem
              label="SNR"
              value={metrics.originalVsNoisy.snr.toFixed(2)}
              unit="dB"
            />
            <MetricItem
              label="PSNR"
              value={metrics.originalVsNoisy.psnr.toFixed(2)}
              unit="dB"
            />
            <MetricItem
              label="MSE"
              value={metrics.originalVsNoisy.mse.toFixed(4)}
            />
            <MetricItem
              label="RMSE"
              value={metrics.originalVsNoisy.rmse.toFixed(4)}
            />
            <MetricItem
              label="Correlation"
              value={metrics.originalVsNoisy.correlation.toFixed(3)}
            />
          </div>
        </div>
      )}

      {/* Original vs Filtered */}
      {hasFiltered && (
        <div className="bg-[#0f0f0f] p-3 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-300 mb-2">
            Original vs Filtered
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <MetricItem
              label="SNR"
              value={metrics.originalVsFiltered.snr.toFixed(2)}
              unit="dB"
            />
            <MetricItem
              label="PSNR"
              value={metrics.originalVsFiltered.psnr.toFixed(2)}
              unit="dB"
            />
            <MetricItem
              label="MSE"
              value={metrics.originalVsFiltered.mse.toFixed(4)}
            />
            <MetricItem
              label="RMSE"
              value={metrics.originalVsFiltered.rmse.toFixed(4)}
            />
            <MetricItem
              label="Correlation"
              value={metrics.originalVsFiltered.correlation.toFixed(3)}
            />
          </div>
        </div>
      )}

      {/* Improvement */}
      {hasNoisy && hasFiltered && (
        <div className="bg-[#0f0f0f] p-3 rounded-lg border border-[#667eea]">
          <h4 className="text-xs font-semibold text-[#667eea] mb-2">
            SNR Improvement
          </h4>
          <div className="text-center">
            <span
              className={`text-2xl font-bold ${
                metrics.improvement > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {metrics.improvement > 0 ? "+" : ""}
              {metrics.improvement.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 ml-2">dB</span>
          </div>
        </div>
      )}

      {!hasNoisy && !hasFiltered && (
        <div className="text-center text-xs text-gray-500 py-8">
          Apply noise to see metrics
        </div>
      )}
    </div>
  );
};

interface MetricItemProps {
  label: string;
  value: string;
  unit?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, unit }) => (
  <div className="text-xs">
    <div className="text-gray-500">{label}</div>
    <div className="text-white font-mono">
      {value}
      {unit && <span className="text-gray-400 ml-1">{unit}</span>}
    </div>
  </div>
);
