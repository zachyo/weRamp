/**
 * Backend unit tests for the aggregator engine and contract payload utilities.
 * Run with: npx vitest run frontend/tests/backend.test.ts
 * (Also runnable with: npm run test:backend inside frontend/)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { aggregateQuotes } from "../lib/aggregator";
import {
  buildInitiateVerificationPayload,
  buildConfirmDeliveryPayload,
} from "../lib/stacks-api";

// Mock global fetch to avoid real network calls in tests
const mockBtcPrice = 85000;

beforeEach(() => {
  vi.stubGlobal("fetch", async (url: string) => {
    if (url.includes("coingecko")) {
      return {
        ok: true,
        json: async () => ({ bitcoin: { usd: mockBtcPrice } }),
      };
    }
    return { ok: false, json: async () => ({}) };
  });
});

// ─── Aggregator Tests ────────────────────────────────────────────────────────

describe("aggregateQuotes", () => {
  it("returns 4 providers for a valid mid-range amount", async () => {
    const quotes = await aggregateQuotes({ amount: 200 });
    expect(quotes).toHaveLength(4);
  });

  it("best quote has highest score", async () => {
    const quotes = await aggregateQuotes({ amount: 200 });
    const scores = quotes.map((q) => q.score);
    expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
  });

  it("calculates correct amountOut based on BTC price", async () => {
    const quotes = await aggregateQuotes({ amount: 100 });
    quotes.forEach((q) => {
      if (q.available) {
        const expectedNet = 100 - q.feeTotal;
        const expectedOut =
          Math.round((expectedNet / mockBtcPrice) * 1e8) / 1e8;
        expect(q.amountOut).toBeCloseTo(expectedOut, 5);
      }
    });
  });

  it("marks providers as unavailable if amount < minAmount", async () => {
    const quotes = await aggregateQuotes({ amount: 5 }); // Below all minAmounts
    quotes.forEach((q) => {
      expect(q.available).toBe(false);
    });
  });

  it("correctly identifies no-KYC eligibility by provider threshold", async () => {
    const quotes = await aggregateQuotes({ amount: 600 });
    // Mt Pelerin allows no-KYC up to $1000
    const mtPelerin = quotes.find((q) => q.provider === "Mt Pelerin");
    expect(mtPelerin?.noKyc).toBe(true);

    // MoonPay KYC threshold is $150
    const moonpay = quotes.find((q) => q.provider === "MoonPay");
    expect(moonpay?.noKyc).toBe(false);
  });

  it("lower fee providers score higher (all else equal)", async () => {
    const quotes = await aggregateQuotes({ amount: 100 });
    const ramp = quotes.find((q) => q.provider === "Ramp Network");
    const moonpay = quotes.find((q) => q.provider === "MoonPay");
    expect(ramp?.score).toBeGreaterThan(moonpay?.score ?? 0);
  });
});

// ─── Contract Payload Tests ──────────────────────────────────────────────────

describe("buildInitiateVerificationPayload", () => {
  it("returns the correct contract name and function", () => {
    const payload = buildInitiateVerificationPayload(100_000_000);
    expect(payload.contractName).toBe("agg");
    expect(payload.functionName).toBe("initiate-verification");
  });

  it("includes exactly 1 function arg", () => {
    const payload = buildInitiateVerificationPayload(100_000_000);
    expect(payload.functionArgs).toHaveLength(1);
  });

  it("uses testnet by default", () => {
    const payload = buildInitiateVerificationPayload(100_000_000);
    expect(payload.network).toBe("testnet");
  });
});

describe("buildConfirmDeliveryPayload", () => {
  it("returns the correct function name", () => {
    const payload = buildConfirmDeliveryPayload("aabbcc");
    expect(payload.functionName).toBe("confirm-delivery");
  });

  it("includes exactly 1 function arg for the proof buffer", () => {
    const payload = buildConfirmDeliveryPayload("aabbcc");
    expect(payload.functionArgs).toHaveLength(1);
  });
});
