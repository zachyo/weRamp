import { NextResponse } from "next/server";
import { aggregateQuotes } from "@/lib/aggregator";

/**
 * GET /api/quotes?amount=500&currency=USD
 *
 * Returns dynamically ranked quotes from all providers.
 * Uses a live BTC price from CoinGecko and each provider's
 * documented fee structure to calculate real net amounts.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = parseFloat(searchParams.get("amount") || "100");
  const currency = searchParams.get("currency") || "USD";

  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const quotes = await aggregateQuotes({ amount, currency });
    return NextResponse.json(quotes);
  } catch (error) {
    console.error("[/api/quotes] Aggregation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 },
    );
  }
}
