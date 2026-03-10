"use client";

import { ProviderQuote } from "@/lib/aggregator";

interface QuoteCardProps {
  quote: ProviderQuote;
  rank: number;
  onSelect: (quote: ProviderQuote) => void;
}

const LOGO_COLORS: Record<string, string> = {
  M: "#7b3fe4",
  R: "#0d76fc",
  T: "#1a56db",
  P: "#16a34a",
};

export default function QuoteCard({ quote, rank, onSelect }: QuoteCardProps) {
  const feePercentDisplay = (quote.feePercent * 100).toFixed(1);
  const amountOutBtc = quote.amountOut.toFixed(8);

  return (
    <div
      className={`card p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
        !quote.available ? "opacity-40 cursor-not-allowed" : ""
      } ${rank === 0 && quote.available ? "ring-1 ring-accent-primary/40" : ""}`}
      onClick={() => quote.available && onSelect(quote)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Provider avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: LOGO_COLORS[quote.logoSymbol] ?? "#555" }}
          >
            {quote.logoSymbol}
          </div>
          <div>
            <p className="font-bold text-base leading-tight">
              {quote.provider}
            </p>
            <p className="text-xs text-muted mt-0.5">{quote.estimatedTime}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-end gap-1">
          {rank === 0 && quote.available && (
            <span className="badge badge-accent text-[10px]">
              🏆 Best Overall
            </span>
          )}
          {quote.badge && (
            <span className="badge badge-accent text-[10px]">
              {quote.badge}
            </span>
          )}
          {quote.noKyc && (
            <span className="badge badge-success text-[10px]">✓ No KYC</span>
          )}
          {quote.isLiveQuote !== undefined && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                quote.isLiveQuote
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {quote.isLiveQuote ? "● Live" : "○ Est."}
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div>
          <p className="text-xs text-muted mb-1">You receive</p>
          <p className="font-bold text-sm">
            {quote.available ? `${amountOutBtc}` : "—"}
          </p>
          <p className="text-[10px] text-muted">sBTC</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Fee</p>
          <p className="font-bold text-sm">{feePercentDisplay}%</p>
          <p className="text-[10px] text-muted">${quote.feeTotal} USD</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">KYC limit</p>
          <p className="font-bold text-sm">${quote.kycThreshold}</p>
          <p className="text-[10px] text-muted">threshold</p>
        </div>
      </div>

      {/* Score bar */}
      {quote.available && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted">Score</span>
            <span className="text-xs font-bold text-accent-primary">
              {quote.score}/100
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${quote.score}%`,
                background:
                  "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
              }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!quote.available}
        onClick={(e) => {
          e.stopPropagation();
          quote.available && onSelect(quote);
        }}
        className={
          quote.available
            ? "btn-primary w-full"
            : "btn-outline w-full opacity-40 cursor-not-allowed"
        }
      >
        {quote.available ? "Select Provider →" : `Min $${quote.minAmount}`}
      </button>
    </div>
  );
}
