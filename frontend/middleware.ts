import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory store for rate limiting (Edge compatible)
// Note: In a true serverless environment, this resets per cold start/instance.
// For production scale, consider @upstash/ratelimit.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to /api routes
  if (pathname.startsWith("/api/")) {
    // ─── 1. CORS ───────────────────────────────────────────────────────────
    const origin = request.headers.get("origin") ?? "";
    const allowedOrigins = [
      "http://localhost:3000",
      process.env.NEXT_PUBLIC_APP_URL || "",
    ].filter(Boolean);

    const isAllowedOrigin = allowedOrigins.includes(origin) || !origin;

    const response = NextResponse.next();

    if (isAllowedOrigin && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    // Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { headers: response.headers });
    }

    // ─── 2. Rate Limiting ──────────────────────────────────────────────────
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const now = Date.now();

    let clientContext = rateLimitMap.get(ip);
    if (
      !clientContext ||
      now - clientContext.lastReset > RATE_LIMIT_WINDOW_MS
    ) {
      // Reset window
      clientContext = { count: 1, lastReset: now };
    } else {
      clientContext.count++;
    }
    rateLimitMap.set(ip, clientContext);

    // Clean up map occasionally to prevent memory leaks
    if (rateLimitMap.size > 10000) {
      rateLimitMap.clear();
    }

    if (clientContext.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: response.headers },
      );
    }

    // Set rate limit headers
    response.headers.set(
      "X-RateLimit-Limit",
      MAX_REQUESTS_PER_WINDOW.toString(),
    );
    response.headers.set(
      "X-RateLimit-Remaining",
      Math.max(0, MAX_REQUESTS_PER_WINDOW - clientContext.count).toString(),
    );

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
