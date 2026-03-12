/**
 * Quote Aggregator Engine — sBTC On-Ramp Aggregator
 *
 * Fetches quotes from multiple providers in parallel.
 * For each provider: attempts a real API call first, falls back
 * to computed quotes using live BTC price + documented fee structure.
 */

export interface ProviderQuote {
  provider: string;
  logoSymbol: string;
  rate: number; // How many USD per 1 sBTC (higher = better rate for fiat buyer)
  feeFixed: number; // Fixed fee in USD
  feePercent: number; // Percentage fee (e.g., 0.015 = 1.5%)
  feeTotal: number; // Calculated: feeFixed + amount * feePercent
  amountOut: number; // sBTC you receive for the given fiat amount
  estimatedTime: string;
  noKyc: boolean;
  kycThreshold: number; // Max USD purchasable without KYC
  minAmount: number;
  maxAmount: number;
  available: boolean;
  badge?: string;
  score: number; // Computed ranking score (higher = better)
  isLiveQuote: boolean; // true if quote came from real API, false if computed
}

export interface AggregatorParams {
  amount: number; // Fiat amount in USD
  currency?: string;
}

// ─── BTC Price Fetch ──────────────────────────────────────────────────────────

/**
 * Fetch a live BTC/USD price for realistic quote computation.
 * Uses CoinGecko's free public API (no key required).
 */
async function fetchBtcPrice(currency: string = "usd"): Promise<number> {
  try {
    const cur = currency.toLowerCase();
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${cur}`,
      { next: { revalidate: 60 } }, // Cache 1 minute
    );
    if (!res.ok) throw new Error("CoinGecko unavailable");
    const data = await res.json();
    return (data.bitcoin[cur] as number) ?? 85000;
  } catch {
    return 85000; // Fallback estimate
  }
}

// ─── Provider Quote Strategies ────────────────────────────────────────────────

/**
 * Helper: build a computed quote using known fee structures.
 * Used as fallback when real API calls fail or as primary when no API key exists.
 */
function computeQuote(
  provider: string,
  logoSymbol: string,
  amount: number,
  btcPrice: number,
  feePercent: number,
  feeFixed: number,
  estimatedTime: string,
  kycThreshold: number,
  minAmount: number,
  maxAmount: number,
  badge?: string,
): ProviderQuote {
  const feeTotal = amount * feePercent + feeFixed;
  const netAmount = amount - feeTotal;
  const amountOut = Math.round((netAmount / btcPrice) * 1e8) / 1e8;

  return {
    provider,
    logoSymbol,
    rate: btcPrice,
    feeFixed,
    feePercent,
    feeTotal: Math.round(feeTotal * 100) / 100,
    amountOut: Math.max(amountOut, 0),
    estimatedTime,
    noKyc: amount < kycThreshold,
    kycThreshold,
    minAmount,
    maxAmount,
    available: amount >= minAmount && amount <= maxAmount,
    badge,
    score: 0,
    isLiveQuote: false,
  };
}

// ─── MoonPay ──────────────────────────────────────────────────────────────────

async function fetchMoonPayQuote(
  amount: number,
  currency: string,
  btcPrice: number,
): Promise<ProviderQuote> {
  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "";

  // Attempt real API call
  if (apiKey && !apiKey.startsWith("pk_test_xxxx")) {
    try {
      const res = await fetch(
        `https://api.moonpay.com/v3/currencies/btc/buy_quote?` +
          `baseCurrencyAmount=${amount}` +
          `&baseCurrencyCode=${currency.toLowerCase()}` +
          `&apiKey=${apiKey}`,
        { next: { revalidate: 30 } },
      );
      if (res.ok) {
        const data = await res.json();
        const feeTotal = (data.feeAmount ?? 0) + (data.extraFeeAmount ?? 0);
        const amountOut =
          Math.round((data.quoteCurrencyAmount ?? 0) * 1e8) / 1e8;
        const feePercent = amount > 0 ? feeTotal / amount : 0.035;

        return {
          provider: "MoonPay",
          logoSymbol: "M",
          rate: data.quoteCurrencyPrice ?? btcPrice,
          feeFixed: 0,
          feePercent,
          feeTotal: Math.round(feeTotal * 100) / 100,
          amountOut,
          estimatedTime: "~2 mins",
          noKyc: amount < 150,
          kycThreshold: 150,
          minAmount: 30,
          maxAmount: 2000,
          available: amount >= 30 && amount <= 2000,
          score: 0,
          isLiveQuote: true,
        };
      }
    } catch {
      // Fall through to computed
    }
  }

  // Fallback: computed quote
  return computeQuote(
    "MoonPay",
    "M",
    amount,
    btcPrice,
    0.035,
    0,
    "~2 mins",
    150,
    30,
    2000,
  );
}

// ─── Ramp Network ─────────────────────────────────────────────────────────────

async function fetchRampQuote(
  amount: number,
  currency: string,
  btcPrice: number,
): Promise<ProviderQuote> {
  // Ramp's quote API requires a server-side secret key,
  // so we always compute from their documented fee structure.
  // Bank transfer: ~0.9%, Card: ~2.9%. We use bank transfer (best case).
  return computeQuote(
    "Ramp Network",
    "R",
    amount,
    btcPrice,
    0.009,
    0,
    "~5 mins",
    250,
    20,
    5000,
    "Best Rate",
  );
}

// ─── Transak ──────────────────────────────────────────────────────────────────

async function fetchTransakQuote(
  amount: number,
  currency: string,
  btcPrice: number,
): Promise<ProviderQuote> {
  // Attempt real API call — Transak has a public pricing endpoint
  try {
    const res = await fetch(
      `https://api.transak.com/api/v1/pricing/public/quotes?` +
        `fiatCurrency=${currency.toUpperCase()}` +
        `&cryptoCurrency=BTC` +
        `&fiatAmount=${amount}` +
        `&isBuyOrSell=BUY` +
        `&paymentMethod=credit_debit_card` +
        `&network=mainnet`,
      { next: { revalidate: 30 } },
    );
    if (res.ok) {
      const data = await res.json();
      const response = data.response;
      if (response && response.cryptoAmount) {
        const amountOut = Math.round(response.cryptoAmount * 1e8) / 1e8;
        const feeTotal = response.totalFee ?? response.feeDecimal ?? 0;
        const feePercent = amount > 0 ? feeTotal / amount : 0.015;

        return {
          provider: "Transak",
          logoSymbol: "T",
          rate: response.cryptoPrice ?? btcPrice,
          feeFixed: 0,
          feePercent,
          feeTotal: Math.round(feeTotal * 100) / 100,
          amountOut,
          estimatedTime: "~5 mins",
          noKyc: amount < 500,
          kycThreshold: 500,
          minAmount: 40,
          maxAmount: 3000,
          available: amount >= 40 && amount <= 3000,
          score: 0,
          isLiveQuote: true,
        };
      }
    }
  } catch {
    // Fall through to computed
  }

  return computeQuote(
    "Transak",
    "T",
    amount,
    btcPrice,
    0.015,
    0,
    "~5 mins",
    500,
    40,
    3000,
  );
}

// ─── Mt Pelerin ───────────────────────────────────────────────────────────────

async function fetchMtPelerinQuote(
  amount: number,
  currency: string,
  btcPrice: number,
): Promise<ProviderQuote> {
  // Attempt real API call — Mt Pelerin has a public price endpoint
  try {
    const res = await fetch(
      `https://api.mtpelerin.com/v1/prices?crypto=BTC&fiat=${currency.toUpperCase()}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const data = await res.json();
      // Mt Pelerin returns price in fiat per 1 BTC
      if (data && data.BTC) {
        const realRate = data.BTC;
        const feePercent = 0.009; // Documented ~0.9%
        const feeTotal = amount * feePercent;
        const netAmount = amount - feeTotal;
        const amountOut = Math.round((netAmount / realRate) * 1e8) / 1e8;

        return {
          provider: "Mt Pelerin",
          logoSymbol: "P",
          rate: realRate,
          feeFixed: 0,
          feePercent,
          feeTotal: Math.round(feeTotal * 100) / 100,
          amountOut: Math.max(amountOut, 0),
          estimatedTime: "10–30 mins",
          noKyc: amount < 1000,
          kycThreshold: 1000,
          minAmount: 50,
          maxAmount: 10000,
          available: amount >= 50 && amount <= 10000,
          badge: "Best No-KYC",
          score: 0,
          isLiveQuote: true,
        };
      }
    }
  } catch {
    // Fall through to computed
  }

  return computeQuote(
    "Mt Pelerin",
    "P",
    amount,
    btcPrice,
    0.009,
    0,
    "10–30 mins",
    1000,
    50,
    10000,
    "Best No-KYC",
  );
}

// ─── Ranking Algorithm ───────────────────────────────────────────────────────

/**
 * Score each quote. Higher is better.
 * Formula: (amountOut / maxAmountOut) * 60   [rate weight: 60%]
 *        + (1 - feePercent / maxFee) * 30     [fee weight: 30%]
 *        + (noKyc ? 1 : 0) * 10               [no-kyc bonus: 10%]
 */
function rankQuotes(quotes: ProviderQuote[]): ProviderQuote[] {
  const available = quotes.filter((q) => q.available);
  if (available.length === 0) return quotes;

  const maxAmountOut = Math.max(...available.map((q) => q.amountOut));
  const maxFeePercent = Math.max(...available.map((q) => q.feePercent));

  return quotes.map((q) => {
    if (!q.available) return { ...q, score: 0 };

    const rateScore = maxAmountOut > 0 ? (q.amountOut / maxAmountOut) * 60 : 0;
    const feeScore =
      maxFeePercent > 0 ? (1 - q.feePercent / maxFeePercent) * 30 : 30;
    const kycScore = q.noKyc ? 10 : 0;

    return { ...q, score: Math.round(rateScore + feeScore + kycScore) };
  });
}

// ─── Public Aggregator ────────────────────────────────────────────────────────

export async function aggregateQuotes(
  params: AggregatorParams,
): Promise<ProviderQuote[]> {
  const { amount, currency = "USD" } = params;

  // Fetch live BTC price first
  const btcPrice = await fetchBtcPrice(currency);

  // Fetch all provider quotes in parallel (real API → fallback)
  const [moonpay, ramp, transak, mtpelerin] = await Promise.all([
    fetchMoonPayQuote(amount, currency, btcPrice),
    fetchRampQuote(amount, currency, btcPrice),
    fetchTransakQuote(amount, currency, btcPrice),
    fetchMtPelerinQuote(amount, currency, btcPrice),
  ]);

  const results = [moonpay, ramp, transak, mtpelerin];

  // Rank and sort (best first)
  const ranked = rankQuotes(results);
  return ranked.sort((a, b) => b.score - a.score);
}
