import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./server/auth/jwt";

const ALLOWED_ORIGIN_PATTERNS = [
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:8081", // Expo local web bundler
  "http://localhost:19006", // Expo legacy web port
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGIN_PATTERNS.includes(origin)) return true;
  // Allow mobile client schemes or local network IPs during development/LAN testing
  if (origin.startsWith("primerides://") || origin.startsWith("exp://")) return true;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // 1. API CORS & PREFLIGHT HANDLING (/api/v1/*)
  if (pathname.startsWith("/api/v1")) {
    const isAllowed = isAllowedOrigin(origin);

    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      const headers = new Headers();
      if (isAllowed && origin) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-idempotency-key");
        headers.set("Access-Control-Max-Age", "86400"); // 24 hours preflight cache
      }
      return new NextResponse(null, { status: isAllowed ? 204 : 403, headers });
    }

    // For non-OPTIONS API requests, verify origin if present
    const response = NextResponse.next();
    if (isAllowed && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-idempotency-key");
    }
    return response;
  }

  // 2. ADMIN ROUTE GUARD (Strictly requires AdminUser session via primerides_admin_token)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminToken = req.cookies.get("primerides_admin_token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const payload = await verifyAccessToken(adminToken);
    // Explicit type isolation: Only type === 'admin' can access /admin
    if (!payload || payload.type !== "admin") {
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.delete("primerides_admin_token");
      return response;
    }
  }

  // 3. CUSTOMER ACCOUNT GUARD (Strictly requires CustomerUser session via primerides_customer_token)
  if (
    pathname.startsWith("/account") &&
    !pathname.startsWith("/account/login") &&
    !pathname.startsWith("/account/register")
  ) {
    const customerToken = req.cookies.get("primerides_customer_token")?.value;
    if (!customerToken) {
      const loginUrl = new URL("/account/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAccessToken(customerToken);
    // Explicit type isolation: Only type === 'customer' can access /account
    if (!payload || payload.type !== "customer") {
      const loginUrl = new URL("/account/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("primerides_customer_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/api/v1/:path*"],
};
