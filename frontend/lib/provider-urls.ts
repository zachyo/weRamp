/**
 * Provider Widget URL Builder — sBTC On-Ramp Aggregator
 *
 * Constructs embeddable widget URLs for each on-ramp provider.
 * All providers support URL/iframe-based embeds with query parameters
 * for amount, currency, crypto asset, and wallet address.
 */

// ─── Provider Config ─────────────────────────────────────────────────────────

export interface ProviderWidgetConfig {
  /** Base URL for the widget (sandbox vs production) */
  baseUrl: string;
  /** Whether the widget requires an API key */
  requiresApiKey: boolean;
  /** Environment variable name for the API key */
  apiKeyEnvVar?: string;
  /** Query parameter name for the API key */
  apiKeyParam?: string;
}

const IS_PRODUCTION = process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet";

const PROVIDER_CONFIGS: Record<string, ProviderWidgetConfig> = {
  MoonPay: {
    baseUrl: IS_PRODUCTION
      ? "https://buy.moonpay.com"
      : "https://buy-sandbox.moonpay.com",
    requiresApiKey: true,
    apiKeyEnvVar: "NEXT_PUBLIC_MOONPAY_API_KEY",
    apiKeyParam: "apiKey",
  },
  Transak: {
    baseUrl: IS_PRODUCTION
      ? "https://global.transak.com"
      : "https://global-stg.transak.com",
    requiresApiKey: true,
    apiKeyEnvVar: "NEXT_PUBLIC_TRANSAK_API_KEY",
    apiKeyParam: "apiKey",
  },
  "Ramp Network": {
    baseUrl: IS_PRODUCTION
      ? "https://app.ramp.network"
      : "https://app.demo.ramp.network",
    requiresApiKey: true,
    apiKeyEnvVar: "NEXT_PUBLIC_RAMP_API_KEY",
    apiKeyParam: "hostApiKey",
  },
  "Mt Pelerin": {
    baseUrl: "https://widget.mtpelerin.com",
    requiresApiKey: false,
  },
};

// ─── URL Builder ──────────────────────────────────────────────────────────────

export interface WidgetUrlParams {
  provider: string;
  amount: number;
  currency: string;
  walletAddress: string;
}

/**
 * Build the embeddable widget URL for a given provider.
 * Returns null if the provider requires an API key that isn't configured.
 */
export function buildProviderWidgetUrl(params: WidgetUrlParams): string | null {
  const { provider, amount, currency, walletAddress } = params;
  const config = PROVIDER_CONFIGS[provider];

  if (!config) return null;

  // Check API key availability
  let apiKey: string | undefined;
  if (config.requiresApiKey && config.apiKeyEnvVar) {
    apiKey = process.env[config.apiKeyEnvVar];
    if (!apiKey) {
      // Return a fallback direct link without embed
      return getProviderFallbackUrl(provider);
    }
  }

  const url = new URL(config.baseUrl);

  switch (provider) {
    case "MoonPay":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("currencyCode", "btc");
      url.searchParams.set("baseCurrencyCode", currency.toLowerCase());
      url.searchParams.set("baseCurrencyAmount", amount.toString());
      url.searchParams.set("walletAddress", walletAddress);
      url.searchParams.set("colorCode", "%23f7931a"); // Bitcoin orange
      url.searchParams.set("theme", "dark");
      break;

    case "Transak":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("cryptoCurrencyCode", "BTC");
      url.searchParams.set("fiatCurrency", currency.toUpperCase());
      url.searchParams.set("fiatAmount", amount.toString());
      url.searchParams.set("walletAddress", walletAddress);
      url.searchParams.set("network", "bitcoin");
      url.searchParams.set("themeColor", "f7931a");
      url.searchParams.set("hideMenu", "true");
      url.searchParams.set("disableWalletAddressForm", "true");
      break;

    case "Ramp Network":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("swapAsset", "BTC_BTC");
      url.searchParams.set("fiatValue", amount.toString());
      url.searchParams.set("fiatCurrency", currency.toUpperCase());
      url.searchParams.set("userAddress", walletAddress);
      url.searchParams.set("variant", "embedded-desktop");
      break;

    case "Mt Pelerin":
      url.searchParams.set("type", "buy");
      url.searchParams.set("tab", "buy");
      url.searchParams.set("crys", "BTC");
      url.searchParams.set("bsc", currency.toUpperCase());
      url.searchParams.set("bsa", amount.toString());
      url.searchParams.set("addr", walletAddress);
      url.searchParams.set("net", "bitcoin");
      url.searchParams.set("rfr", "sbtc-onramp"); // referral code placeholder
      break;

    default:
      return null;
  }

  return url.toString();
}

/**
 * Get a direct link to the provider's website (used when API key is missing).
 */
export function getProviderFallbackUrl(provider: string): string | null {
  const FALLBACK_URLS: Record<string, string> = {
    MoonPay: "https://www.moonpay.com/buy/btc",
    Transak: "https://global.transak.com",
    "Ramp Network": "https://ramp.network/buy",
    "Mt Pelerin": "https://www.mtpelerin.com/buy-bitcoin",
  };
  return FALLBACK_URLS[provider] ?? null;
}

/**
 * Check if a provider has a valid API key configured.
 */
export function isProviderConfigured(provider: string): boolean {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) return false;
  if (!config.requiresApiKey) return true; // Mt Pelerin
  if (!config.apiKeyEnvVar) return false;
  const key = process.env[config.apiKeyEnvVar];
  return !!key && !key.startsWith("pk_test_xxxx") && key !== "xxxx";
}

/**
 * Returns the list of all supported providers.
 */
export function getSupportedProviders(): string[] {
  return Object.keys(PROVIDER_CONFIGS);
}
