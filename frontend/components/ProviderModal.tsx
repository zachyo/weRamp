"use client";

import { useState, useMemo } from "react";
import { ProviderQuote } from "@/lib/aggregator";
import {
  buildProviderWidgetUrl,
  getProviderFallbackUrl,
} from "@/lib/provider-urls";
import VerifyDelivery from "./VerifyDelivery";
import { isWalletConnected, userSession } from "./WalletConnect";

interface ProviderModalProps {
  quote: ProviderQuote;
  amount: number;
  currency: string;
  onClose: () => void;
}

type ModalView = "details" | "widget" | "verify";

export default function ProviderModal({
  quote,
  amount,
  currency,
  onClose,
}: ProviderModalProps) {
  const [view, setView] = useState<ModalView>("details");
  const [connected] = useState(isWalletConnected());

  const satoshis = Math.round(quote.amountOut * 1e8);

  // Get wallet address for widget URL
  const walletAddress = useMemo(() => {
    if (!connected || typeof window === "undefined") return "";
    try {
      const userData = userSession.loadUserData();
      const network =
        process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
          ? "mainnet"
          : "testnet";
      return (
        userData.profile.stxAddress[network] ??
        userData.profile.stxAddress.mainnet ??
        ""
      );
    } catch {
      return "";
    }
  }, [connected]);

  // Build widget URL
  const widgetUrl = useMemo(() => {
    if (!walletAddress) return null;
    return buildProviderWidgetUrl({
      provider: quote.provider,
      amount,
      currency,
      walletAddress,
    });
  }, [quote.provider, amount, currency, walletAddress]);

  const fallbackUrl = getProviderFallbackUrl(quote.provider);

  // ─── Details View ──────────────────────────────────────────────────────

  if (view === "details") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="card max-w-lg w-full p-8 relative animate-fade-up max-h-[90vh] overflow-y-auto">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-muted hover:text-primary transition-colors text-xl"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-2xl">
              🛒
            </div>
            <div>
              <h2 className="text-xl font-bold">{quote.provider}</h2>
              <p className="text-sm text-muted">
                {amount} {currency} →{" "}
                <span className="text-accent-primary font-bold">
                  {quote.amountOut.toFixed(8)} sBTC
                </span>
              </p>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-elevated rounded-xl p-5 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">You pay</span>
              <span className="font-semibold">
                {amount} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Fee</span>
              <span className="font-semibold">${quote.feeTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">You receive</span>
              <span className="font-bold text-accent-primary">
                {quote.amountOut.toFixed(8)} sBTC
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-default pt-3">
              <span className="text-muted">Est. time</span>
              <span className="font-semibold">{quote.estimatedTime}</span>
            </div>
            {!quote.noKyc && (
              <div className="flex justify-between text-sm border-t border-default pt-3">
                <span className="text-muted">KYC</span>
                <span className="text-yellow-400 font-semibold text-xs">
                  Required for amounts above ${quote.kycThreshold}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {connected ? (
              <>
                <button
                  onClick={() => setView("widget")}
                  className="btn-primary w-full"
                >
                  🚀 Buy with {quote.provider}
                </button>
                <button
                  onClick={() => setView("verify")}
                  className="btn-outline w-full text-sm"
                >
                  ✓ Already purchased? Verify Delivery
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted mb-3">
                  Connect your wallet to proceed with the purchase or verify
                  delivery.
                </p>
                {fallbackUrl && (
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full"
                  >
                    Open {quote.provider} Directly →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Widget View (iframe embed) ─────────────────────────────────────────

  if (view === "widget") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div
          className="card max-w-2xl w-full relative animate-fade-up overflow-hidden flex flex-col"
          style={{ height: "min(85vh, 700px)" }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-default shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("details")}
                className="text-muted hover:text-primary transition-colors text-sm"
              >
                ← Back
              </button>
              <span className="text-sm font-semibold">{quote.provider}</span>
              <span className="badge badge-accent text-[10px]">
                {amount} {currency}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {(widgetUrl || fallbackUrl) && (
                <a
                  href={widgetUrl || fallbackUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-accent-primary transition-colors"
                >
                  Open in new tab ↗
                </a>
              )}
              <button
                onClick={onClose}
                className="text-muted hover:text-primary transition-colors text-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Widget iframe */}
          <div className="flex-1 relative bg-elevated">
            {widgetUrl ? (
              <iframe
                src={widgetUrl}
                title={`${quote.provider} Buy Widget`}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                allow="payment; camera"
                loading="eager"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-3xl mb-4">🔑</p>
                <h3 className="text-lg font-bold mb-2">
                  API Key Not Configured
                </h3>
                <p className="text-sm text-muted mb-6 max-w-sm">
                  The {quote.provider} widget requires an API key. You can still
                  complete your purchase directly on their site.
                </p>
                {fallbackUrl && (
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Open {quote.provider} →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-default shrink-0 flex items-center justify-between">
            <p className="text-xs text-muted">
              Purchase handled securely by {quote.provider}. Non-custodial.
            </p>
            <button
              onClick={() => setView("verify")}
              className="text-xs text-accent-primary hover:underline font-semibold"
            >
              Purchased? Verify Delivery →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Verify View ──────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-8 relative animate-fade-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-primary transition-colors text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-2xl">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold">Verify Delivery</h2>
            <p className="text-sm text-muted">
              Confirm your sBTC arrived on-chain
            </p>
          </div>
        </div>

        <VerifyDelivery
          amountSatoshis={satoshis}
          onBack={() => setView("details")}
        />
      </div>
    </div>
  );
}
