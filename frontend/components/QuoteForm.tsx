"use client";

import { useState, FormEvent } from "react";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN"];

interface QuoteFormProps {
  onSubmit: (amount: number, currency: string) => void;
  loading: boolean;
}

export default function QuoteForm({ onSubmit, loading }: QuoteFormProps) {
  const [amount, setAmount] = useState<string>("200");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 10) {
      setError("Minimum amount is $10");
      return;
    }
    setError("");
    onSubmit(parsed, currency);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-2">Find the Best Rate</h2>
        <p className="text-secondary mb-8">
          Enter how much fiat you want to spend to receive sBTC.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Amount */}
          <div className="flex-1">
            <label
              htmlFor="amount"
              className="block text-sm font-semibold text-secondary mb-2"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">
                {currency === "EUR"
                  ? "€"
                  : currency === "GBP"
                    ? "£"
                    : currency === "NGN"
                      ? "₦"
                      : "$"}
              </span>
              <input
                id="amount"
                type="number"
                min="10"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-8"
                placeholder="200"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="sm:w-36">
            <label
              htmlFor="currency"
              className="block text-sm font-semibold text-secondary mb-2"
            >
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-field"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="sm:self-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Fetching…
                </span>
              ) : (
                "Get Quotes →"
              )}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <p className="mt-6 text-xs text-muted">
          Quotes reflect real-time BTC prices. No-KYC limits vary by provider
          and jurisdiction.
        </p>
      </div>
    </form>
  );
}
