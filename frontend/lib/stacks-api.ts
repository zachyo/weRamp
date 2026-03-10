/**
 * Stacks API Utilities — sBTC On-Ramp Aggregator
 *
 * Utilities for reading contract state and building unsigned
 * contract call payloads that the frontend can pass to @stacks/connect.
 */

import { uintCV, FungibleConditionCode, Pc } from "@stacks/transactions";

// ─── Config ──────────────────────────────────────────────────────────────────

const NETWORK_NAME =
  process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet" ? "mainnet" : "testnet";

const API_BASE =
  NETWORK_NAME === "mainnet"
    ? "https://api.hiro.so"
    : "https://api.testnet.hiro.so";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || "agg";

// ─── Read: Verification Status ────────────────────────────────────────────────

export interface VerificationStatus {
  expectedAmount: number;
  status: string;
  timestamp: number;
}

/**
 * Fetch the current on-chain verification status for a given STX address.
 * Uses the Stacks read-only function endpoint — no wallet required.
 */
export async function getVerificationStatus(
  userAddress: string,
): Promise<VerificationStatus | null> {
  try {
    const res = await fetch(
      `${API_BASE}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-verification-status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: userAddress,
          arguments: [],
        }),
      },
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (!data.result || data.result === "0x09") return null;

    return {
      expectedAmount: 0,
      status: "pending",
      timestamp: 0,
    };
  } catch {
    return null;
  }
}

// ─── Write: Build Contract Call Payloads ──────────────────────────────────────

export interface ContractCallPayload {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: string[];
  network: string;
  postConditions: unknown[];
  postConditionMode: string;
  fee: string;
}

/**
 * Build the payload needed by @stacks/connect's openContractCall
 * to call `initiate-verification` on-chain.
 */
export function buildInitiateVerificationPayload(
  expectedSbtcSatoshis: number,
  userAddress: string,
): ContractCallPayload {
  const uintArg = uintCV(BigInt(expectedSbtcSatoshis));
  const argHex =
    "0x01" + BigInt(expectedSbtcSatoshis).toString(16).padStart(32, "0");

  // Post-condition: User transfers exactly 1 STX (1,000,000 microSTX)
  const postCondition = Pc.principal(userAddress).willSendEq(1000000).ustx();

  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "initiate-verification",
    functionArgs: [argHex],
    network: NETWORK_NAME,
    postConditions: [postCondition],
    postConditionMode: "deny", // Secure mode: explicitly deny unexpected transfers
    fee: "2000",
  };
}

/**
 * Build the payload for `confirm-delivery`.
 * tx-proof is a (buff 32) — placeholder for MVP.
 */
export function buildConfirmDeliveryPayload(
  txHashHex: string,
): ContractCallPayload {
  const padded = txHashHex.replace("0x", "").padEnd(64, "0").slice(0, 64);
  const bufferArg = "0x02" + "00000020" + padded;

  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "confirm-delivery",
    functionArgs: [bufferArg],
    network: NETWORK_NAME,
    postConditions: [], // No STX sent by user in this call
    postConditionMode: "deny",
    fee: "2000",
  };
}
