"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { UserSession } from "@stacks/connect";

let userSessionInstance: UserSession | null = null;

const getUserSession = async (): Promise<UserSession> => {
  if (!userSessionInstance) {
    const { AppConfig, UserSession } = await import("@stacks/connect");
    const appConfig = new AppConfig(["store_write", "publish_data"]);
    userSessionInstance = new UserSession({ appConfig });
  }
  return userSessionInstance;
};

interface WalletContextType {
  connected: boolean;
  address: string | null;
  network: string;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  network: "testnet",
  connect: () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getUserSession().then((session) => {
      if (session.isUserSignedIn()) {
        const userData = session.loadUserData();
        setAddress(userData.profile.stxAddress.testnet);
        setConnected(true);
      } else if (session.isSignInPending()) {
        session.handlePendingSignIn().then((userData) => {
          setAddress(userData.profile.stxAddress.testnet);
          setConnected(true);
        });
      }
    });
  }, []);

  const connect = async () => {
    const { authenticate } = await import("@stacks/connect");
    const session = await getUserSession();
    authenticate({
      appDetails: {
        name: "weRamp",
        icon: window.location.origin + "/favicon.ico", // Placeholder icon
      },
      redirectTo: "/",
      onFinish: () => {
        const userData = session.loadUserData();
        setAddress(userData.profile.stxAddress.testnet);
        setConnected(true);
      },
      userSession: session,
    });
  };

  const disconnect = async () => {
    const session = await getUserSession();
    session.signUserOut();
    setAddress(null);
    setConnected(false);
  };

  if (!mounted) {
    // Avoid hydration mismatch by not rendering until mounted
    return null;
  }

  return (
    <WalletContext.Provider value={{ connected, address, network: "testnet", connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}
