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

// ─── Network helpers ──────────────────────────────────────────────────────────

export type StacksNetworkName = "mainnet" | "testnet";

/** Return the expected network from the env var (lazy read). */
export function getExpectedNetwork(): StacksNetworkName {
  return process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
    ? "mainnet"
    : "testnet";
}

/**
 * Return the STX address for the currently signed-in user,
 * choosing mainnet or testnet based on the configured network.
 * Returns null if the user is not signed in or has no address.
 */
export function getStxAddress(): string | null {
  if (!userSession.isUserSignedIn()) return null;
  try {
    const userData = userSession.loadUserData();
    const network = getExpectedNetwork();
    return (
      userData.profile?.stxAddress?.[network] ??
      userData.profile?.stxAddress?.mainnet ??
      null
    );
  } catch {
    return null;
  }
}

/**
 * Detect whether the connected wallet address looks like the wrong network.
 *
 * Stacks mainnet addresses start with "SP", testnet/devnet start with "ST".
 * Returns true if there's a mismatch.
 */
export function isWrongNetwork(): boolean {
  const address = getStxAddress();
  if (!address) return false;
  const expected = getExpectedNetwork();
  if (expected === "mainnet") return address.startsWith("ST");
  return address.startsWith("SP");
}

/** Returns the Hiro explorer base URL for the configured network. */
export function getExplorerBaseUrl(): string {
  const network = getExpectedNetwork();
  return network === "mainnet"
    ? "https://explorer.hiro.so"
    : "https://explorer.hiro.so";
}

/** Returns the chain query param for explorer links. */
export function getExplorerChainParam(): string {
  return getExpectedNetwork() === "mainnet" ? "mainnet" : "testnet";
}
