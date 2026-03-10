import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "your-sentry-org",
  project: "sbtc-onramp-aggr",
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
});
