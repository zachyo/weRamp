"use client";

import { useState } from "react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import QuoteForm from "@/components/QuoteForm";
import QuoteCard from "@/components/QuoteCard";
import { ProviderQuote } from "@/lib/aggregator";

// Lazy-load components that depend on @stacks/connect (browser-only)
const ProviderModal = nextDynamic(() => import("@/components/ProviderModal"), {
  ssr: false,
  loading: () => null,
});

const WalletConnect = nextDynamic(() => import("@/components/WalletConnect"), {
  ssr: false,
  loading: () => null,
});

function QuoteSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-elevated" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-elevated rounded w-32" />
          <div className="h-3 bg-elevated rounded w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-elevated rounded w-16" />
            <div className="h-4 bg-elevated rounded w-20" />
          </div>
        ))}
      </div>
      <div className="h-9 bg-elevated rounded-xl" />
    </div>
  );
}

export default function AppPage() {
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<ProviderQuote | null>(
    null,
  );
  const [lastParams, setLastParams] = useState<{
    amount: number;
    currency: string;
  } | null>(null);

  const fetchQuotes = async (amount: number, currency: string) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setLastParams({ amount, currency });

    try {
      const res = await fetch(
        `/api/quotes?amount=${amount}&currency=${currency}`,
      );
      if (!res.ok) throw new Error("Failed to fetch quotes");
      const data: ProviderQuote[] = await res.json();
      setQuotes(data);
    } catch {
      setError("Could not fetch quotes. Please try again.");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const availableCount = quotes.filter((q) => q.available).length;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-default">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center animate-pulse-glow">
            <span className="text-bg-base font-bold text-sm">s</span>
          </div>
          <span className="font-bold tracking-tight">
            sBTC <span className="text-accent-primary">Ramp</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Home
          </Link>
          <WalletConnect />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">
            Buy <span className="gradient-text">sBTC</span> Instantly
          </h1>
          <p className="text-secondary text-lg max-w-xl mx-auto">
            We aggregate the best no-KYC on-ramps in real-time and route you to
            the highest-value provider.
          </p>
        </div>

        {/* Quote form */}
        <div className="flex justify-center mb-12">
          <QuoteForm onSubmit={fetchQuotes} loading={loading} />
        </div>

        {/* Results */}
        {loading && (
          <div>
            <p className="text-center text-muted text-sm mb-6">
              Fetching live quotes from all providers…
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <QuoteSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="font-semibold mb-2">Something went wrong</p>
            <p className="text-muted text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && searched && quotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  {availableCount} Provider{availableCount !== 1 ? "s" : ""}{" "}
                  Available
                </h2>
                <p className="text-sm text-muted">
                  Sorted by best value · Prices fetched live
                </p>
              </div>
              {lastParams && (
                <span className="badge badge-accent">
                  {lastParams.amount} {lastParams.currency}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {quotes.map((quote, i) => (
                <QuoteCard
                  key={quote.provider}
                  quote={quote}
                  rank={i}
                  onSelect={setSelectedQuote}
                />
              ))}
            </div>

            <p className="text-center text-xs text-muted mt-8">
              Rates are indicative only. Final amounts depend on provider at
              time of purchase.
            </p>
          </div>
        )}

        {!loading && !error && searched && quotes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-4">🔍</p>
            <p className="font-semibold mb-2">No quotes found</p>
            <p className="text-muted text-sm">
              Try a different amount or currency.
            </p>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-20 opacity-60">
            <p className="text-5xl mb-4">₿</p>
            <p className="text-secondary">
              Enter an amount above to see live quotes.
            </p>
          </div>
        )}
      </div>

      {/* Provider modal — only renders client-side */}
      {selectedQuote && lastParams && (
        <ProviderModal
          quote={selectedQuote}
          amount={lastParams.amount}
          currency={lastParams.currency}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </div>
  );
}
