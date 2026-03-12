"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  isWalletConnected,
  connectWallet,
  disconnectWallet,
  getStxAddress,
  getExpectedNetwork,
  isWrongNetwork,
  type StacksNetworkName,
} from "@/lib/stacks-session";

// ─── Context shape ────────────────────────────────────────────────────────────

interface WalletContextValue {
  /** Wallet address if connected, null otherwise */
  address: string | null;
  /** Whether the wallet is connected */
  connected: boolean;
  /** Whether the wallet is on the wrong network */
  wrongNetwork: boolean;
  /** The expected network name */
  network: StacksNetworkName;
  /** Start the wallet authentication flow */
  connect: () => void;
  /** Sign out and clear state */
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // Hydrate wallet state on mount (client-only)
  useEffect(() => {
    if (isWalletConnected()) {
      setAddress(getStxAddress());
      setWrongNetwork(isWrongNetwork());
    }
  }, []);

  const connect = useCallback(() => {
    connectWallet(() => {
      setAddress(getStxAddress());
      setWrongNetwork(isWrongNetwork());
    });
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setAddress(null);
    setWrongNetwork(false);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        connected: !!address,
        wrongNetwork,
        network: getExpectedNetwork(),
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    // Return safe defaults when rendered outside the provider
    // (e.g. during SSR/prerender before Providers has mounted)
    return {
      address: null,
      connected: false,
      wrongNetwork: false,
      network: "testnet",
      connect: () => {},
      disconnect: () => {},
    };
  }
  return ctx;
}
