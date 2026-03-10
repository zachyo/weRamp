import { NextResponse } from "next/server";
import { buildInitiateVerificationPayload } from "@/lib/stacks-api";

/**
 * POST /api/verify/initiate
 *
 * Accepts: { amountSatoshis: number }
 * Returns: An unsigned contract call payload ready for @stacks/connect openContractCall
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountSatoshis, userAddress } = body;

    if (
      !amountSatoshis ||
      typeof amountSatoshis !== "number" ||
      amountSatoshis <= 0 ||
      !userAddress ||
      typeof userAddress !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid amountSatoshis or userAddress" },
        { status: 400 },
      );
    }

    const payload = buildInitiateVerificationPayload(
      amountSatoshis,
      userAddress,
    );

    return NextResponse.json({ success: true, payload });
  } catch (error) {
    console.error("[verify/initiate] Error:", error);
    return NextResponse.json(
      { error: "Failed to build initiation payload" },
      { status: 500 },
    );
  }
}
