"use client";

import React from "react";

export interface QuoteAnalysisCardProps {
  /** When provided, the compact variant renders an "Open full analysis" button */
  onExpand?: () => void;
  matched_scenario?: string;
  estimated_price?: number;
  currency?: string;
  base_fee?: number;
  per_km_rate?: number;
  assumed_distance_km?: number;
  breakdown_lines?: { label: string; amount: number }[];
  confidence?: string;
  confidence_explanation?: string;
  assumptions?: string[];
  highlights?: string[];
}

function confidenceClass(confidence?: string): string {
  if (!confidence) return "";
  const val = confidence.toLowerCase();
  if (val === "high") return "dck-confidence-high";
  if (val === "medium") return "dck-confidence-medium";
  return "dck-confidence-low";
}

function formatAmount(amount: number, currency?: string): string {
  if (!currency) return amount.toLocaleString();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function QuoteAnalysisCard(props: QuoteAnalysisCardProps) {
  const {
    matched_scenario,
    estimated_price,
    currency,
    base_fee,
    per_km_rate,
    assumed_distance_km,
    breakdown_lines,
    confidence,
    confidence_explanation,
    assumptions,
    highlights,
  } = props;

  const hasRateRow =
    base_fee !== undefined ||
    per_km_rate !== undefined ||
    assumed_distance_km !== undefined;

  return (
    <div className="dck-analysis-card">
      {/* Header row */}
      {(matched_scenario || confidence) && (
        <div className="dck-analysis-header">
          {matched_scenario && (
            <span className="dck-scenario-chip">{matched_scenario}</span>
          )}
          {confidence && (
            <span className={`dck-confidence-badge ${confidenceClass(confidence)}`}>
              {confidence} confidence
            </span>
          )}
        </div>
      )}

      {/* Price hero */}
      {estimated_price !== undefined && (
        <div className="dck-price-hero">
          <span className="dck-price-amount">
            {formatAmount(estimated_price, currency)}
          </span>
          <span className="dck-price-label">Estimated total</span>
        </div>
      )}

      {/* Confidence explanation */}
      {confidence_explanation && (
        <p className="dck-confidence-explanation">{confidence_explanation}</p>
      )}

      {/* Rate card */}
      {hasRateRow && (
        <div className="dck-rate-row">
          {base_fee !== undefined && (
            <div className="dck-rate-chip">
              <span className="dck-rate-chip-label">Base fee</span>
              <span className="dck-rate-chip-value">
                {formatAmount(base_fee, currency)}
              </span>
            </div>
          )}
          {per_km_rate !== undefined && (
            <div className="dck-rate-chip">
              <span className="dck-rate-chip-label">Per km</span>
              <span className="dck-rate-chip-value">
                {formatAmount(per_km_rate, currency)}
              </span>
            </div>
          )}
          {assumed_distance_km !== undefined && (
            <div className="dck-rate-chip">
              <span className="dck-rate-chip-label">Distance</span>
              <span className="dck-rate-chip-value">
                {assumed_distance_km.toLocaleString()} km
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cost breakdown */}
      {breakdown_lines && breakdown_lines.length > 0 && (
        <div className="dck-breakdown">
          <p className="dck-section-label">Cost breakdown</p>
          <ul className="dck-breakdown-list">
            {breakdown_lines.map((line, i) => (
              <li key={i} className="dck-breakdown-row">
                <span className="dck-breakdown-line-label">{line.label}</span>
                <span className="dck-breakdown-line-amount">
                  {formatAmount(line.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="dck-highlights">
          <p className="dck-section-label">Highlights</p>
          <ul className="dck-highlights-list">
            {highlights.map((item, i) => (
              <li key={i} className="dck-highlight-item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Assumptions */}
      {assumptions && assumptions.length > 0 && (
        <div className="dck-assumptions">
          <p className="dck-section-label">Assumptions</p>
          <ol className="dck-assumptions-list">
            {assumptions.map((item, i) => (
              <li key={i} className="dck-assumption-item">
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/** Compact card shown inside the Copilot sidebar conversation bubble */
export function QuoteAnalysisCardCompact(props: QuoteAnalysisCardProps) {
  const {
    matched_scenario,
    estimated_price,
    currency,
    base_fee,
    per_km_rate,
    assumed_distance_km,
    confidence,
    onExpand,
  } = props;

  const hasRateRow =
    base_fee !== undefined ||
    per_km_rate !== undefined ||
    assumed_distance_km !== undefined;

  return (
    <div className="dck-analysis-card dck-analysis-card--compact">
      {/* Header */}
      {(matched_scenario || confidence) && (
        <div className="dck-analysis-header">
          {matched_scenario && (
            <span className="dck-scenario-chip">{matched_scenario}</span>
          )}
          {confidence && (
            <span className={`dck-confidence-badge ${confidenceClass(confidence)}`}>
              {confidence} confidence
            </span>
          )}
        </div>
      )}

      {/* Price */}
      {estimated_price !== undefined && (
        <div className="dck-price-hero">
          <span className="dck-price-amount">
            {formatAmount(estimated_price, currency)}
          </span>
          <span className="dck-price-label">Estimated total</span>
        </div>
      )}

      {/* Rate chips */}
      {hasRateRow && (
        <div className="dck-rate-row">
          {base_fee !== undefined && (
            <div className="dck-rate-chip">
              <span className="dck-rate-chip-label">Base fee</span>
              <span className="dck-rate-chip-value">{formatAmount(base_fee, currency)}</span>
            </div>
          )}
          {per_km_rate !== undefined && (
            <div className="dck-rate-chip">
              <span className="dck-rate-chip-label">Per km</span>
              <span className="dck-rate-chip-value">{formatAmount(per_km_rate, currency)}</span>
            </div>
          )}
          {assumed_distance_km !== undefined && (
            <div className="dck-rate-chip">
              <span className="dck-rate-chip-label">Distance</span>
              <span className="dck-rate-chip-value">{assumed_distance_km.toLocaleString()} km</span>
            </div>
          )}
        </div>
      )}

      {/* Expand button */}
      {onExpand && (
        <button onClick={onExpand} className="dck-expand-btn">
          View full breakdown
          <svg viewBox="0 0 16 16" className="dck-expand-btn-icon" aria-hidden>
            <path d="M3 5.5a.5.5 0 0 1 .854-.354L8 9.293l4.146-4.147a.5.5 0 0 1 .708.708l-4.5 4.5a.5.5 0 0 1-.708 0l-4.5-4.5A.5.5 0 0 1 3 5.5Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
