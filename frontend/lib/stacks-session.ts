import { AppConfig, UserSession, authenticate } from "@stacks/connect";

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
