import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./server/auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. ADMIN ROUTE GUARD (Strictly requires AdminUser session via primerides_admin_token)
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

  // 2. CUSTOMER ACCOUNT GUARD (Strictly requires CustomerUser session via primerides_customer_token)
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
  matcher: ["/admin/:path*", "/account/:path*"],
};
