"use client";

import { useState } from "react";
import { AppConfig, authenticate, UserSession } from "@stacks/connect";

// ─── Shared session — single source of truth for wallet state ─────────────────
const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });

/** Check whether the wallet is currently signed in */
export function isWalletConnected(): boolean {
  return userSession.isUserSignedIn();
}

/** Trigger the Stacks wallet authentication flow */
export function connectWallet(onDone?: () => void) {
  authenticate({
    appDetails: {
      name: "sBTC On-Ramp Aggregator",
      icon:
        typeof window !== "undefined"
          ? window.location.origin + "/favicon.ico"
          : "",
    },
    redirectTo: "/",
    onFinish: () => {
      onDone?.();
    },
    userSession,
  });
}

// ─── UI component ─────────────────────────────────────────────────────────────
export default function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setAddress(userData.profile.stxAddress.mainnet);
    }
  }

  const handleAuthenticate = () => {
    connectWallet(() => {
      const userData = userSession.loadUserData();
      setAddress(userData.profile.stxAddress.mainnet);
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setAddress(null);
  };

  if (!mounted) return <button className="btn-outline">Connect Wallet</button>;

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="btn-outline border-accent/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
      >
        {address.substring(0, 5)}...{address.substring(address.length - 4)}
        <span className="text-xs text-muted ml-2">(Disconnect)</span>
      </button>
    );
  }

  return (
    <button onClick={handleAuthenticate} className="btn-outline">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 7H5C3.89543 7 3 7.89543 3 9V15C3 16.1046 3.89543 17 5 17H19C20.1046 17 21 16.1046 21 15V9C21 7.89543 20.1046 7 19 7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 12H16.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Connect Wallet
    </button>
  );
}
