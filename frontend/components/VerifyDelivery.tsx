"use client";

import { useState } from "react";
import { openContractCall } from "@stacks/connect";
import {
  isWalletConnected,
  getStxAddress,
  getExplorerChainParam,
} from "@/lib/stacks-session";

interface VerifyDeliveryProps {
  amountSatoshis: number;
  onBack: () => void;
}

type Step = "idle" | "fetching" | "signing" | "success" | "error";

export default function VerifyDelivery({
  amountSatoshis,
  onBack,
}: VerifyDeliveryProps) {
  const [step, setStep] = useState<Step>("idle");
  const [txId, setTxId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!isWalletConnected()) {
      setErrorMsg("Wallet not connected");
      setStep("error");
      return;
    }

    setStep("fetching");
    try {
      const userAddress = getStxAddress();
      if (!userAddress) {
        setErrorMsg("Could not resolve wallet address");
        setStep("error");
        return;
      }

      // 1. Get contract call payload from backend
      const res = await fetch("/api/verify/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountSatoshis, userAddress }),
      });
      const data = await res.json();
      if (!res.ok || !data.payload)
        throw new Error(data.error ?? "Failed to build verification payload");

      // 2. Open wallet to sign & broadcast
      setStep("signing");

      openContractCall({
        contractAddress: data.payload.contractAddress,
        contractName: data.payload.contractName,
        functionName: data.payload.functionName,
        functionArgs: [],
        network: data.payload.network,
        postConditionMode: 0x01, // allow
        postConditions: [],
        onFinish: (result) => {
          setTxId(result.txId ?? null);
          setStep("success");
        },
        onCancel: () => {
          setErrorMsg("Transaction cancelled");
          setStep("error");
        },
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Verification failed");
      setStep("error");
    }
  };

  if (step === "success") {
    return (
      <div className="text-center animate-fade-up">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Delivery Verified!</h3>
        <p className="text-secondary text-sm mb-4">
          Your sBTC delivery has been confirmed on-chain. Your verification fee
          will be refunded.
        </p>
        {txId && (
          <a
            href={`https://explorer.hiro.so/txid/${txId}?chain=${getExplorerChainParam()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="badge badge-success inline-flex mb-4 hover:opacity-80 transition-opacity"
          >
            View TX: {txId.slice(0, 8)}…{txId.slice(-6)}
          </a>
        )}
        <div className="mt-2">
          <span className="badge badge-accent">
            🎖️ Verified On-Ramp Badge Earned
          </span>
        </div>
        <button onClick={onBack} className="btn-outline w-full mt-6 text-sm">
          ← Back
        </button>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="text-center animate-fade-up">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">❌</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Verification Failed</h3>
        <p className="text-sm text-red-400 mb-6">{errorMsg}</p>
        <div className="flex gap-3">
          <button onClick={handleVerify} className="btn-primary flex-1 text-sm">
            Retry
          </button>
          <button onClick={onBack} className="btn-outline flex-1 text-sm">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="bg-elevated rounded-xl p-5 mb-6">
        <h3 className="font-semibold mb-3">What happens when you verify?</h3>
        <ol className="space-y-3 text-sm text-secondary">
          {[
            "A 1 STX verification fee is escrowed to the smart contract",
            "You confirm delivery of your sBTC on-chain",
            "The contract refunds your fee + mints a verified badge",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 shrink-0 bg-accent-dim rounded-full flex items-center justify-center text-[10px] font-bold text-accent-primary mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-3">
        {step === "idle" && (
          <>
            <button onClick={handleVerify} className="btn-primary flex-1">
              Initiate Verification
            </button>
            <button onClick={onBack} className="btn-outline px-5">
              ←
            </button>
          </>
        )}
        {(step === "fetching" || step === "signing") && (
          <button disabled className="btn-primary flex-1 opacity-70">
            <svg
              className="animate-spin h-4 w-4 mr-2 inline"
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
            {step === "fetching" ? "Preparing…" : "Awaiting wallet…"}
          </button>
        )}
      </div>
    </div>
  );
}
