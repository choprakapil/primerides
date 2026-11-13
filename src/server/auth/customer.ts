import { cookies, headers } from "next/headers";
import { prisma } from "../db/client";
import { verifyAccessToken } from "./jwt";

export interface CurrentCustomer {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
}

/**
 * Resolves the authenticated customer from either:
 * 1. HTTP-only cookie 'primerides_customer_token' (Web App)
 * 2. Header 'Authorization: Bearer <token>' (API / Mobile)
 */
export async function getCurrentCustomer(
  req?: Request | { headers?: Headers | { get(name: string): string | null }; cookies?: any }
): Promise<CurrentCustomer | null> {
  try {
    let token: string | undefined;

    // A. Check Authorization Header from passed req or Next.js headers
    if (req && "headers" in req && req.headers) {
      const authHeader =
        typeof (req.headers as any).get === "function"
          ? (req.headers as any).get("authorization")
          : (req.headers as any).authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      try {
        const headerList = await headers();
        const authHeader = headerList.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      } catch {}
    }

    // B. Check HTTP-only Web Cookie
    if (!token && req && "cookies" in req && req.cookies) {
      if (typeof req.cookies.get === "function") {
        token = req.cookies.get("primerides_customer_token")?.value;
      } else if (typeof req.cookies === "object") {
        token = (req.cookies as any).primerides_customer_token;
      }
    }

    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get("primerides_customer_token")?.value;
      } catch {}
    }

    if (!token) return null;

    const payload = await verifyAccessToken(token);
    if (!payload || payload.type !== "customer") return null;

    const customer = await prisma.customerUser.findUnique({
      where: { id: payload.id, deleted_at: null },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        avatar_url: true,
        is_verified: true,
        created_at: true,
      },
    });

    if (!customer) return null;

    return {
      id: customer.id,
      fullName: customer.full_name,
      phone: customer.phone,
      email: customer.email,
      avatarUrl: customer.avatar_url,
      isVerified: customer.is_verified,
      createdAt: customer.created_at,
    };
  } catch (err) {
    console.error("Error resolving current customer:", err);
    return null;
  }
}

/**
 * Revokes a customer session by sessionId or refreshTokenHash.
 */
export async function revokeCustomerSession(sessionId: string) {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { is_revoked: true },
    });
  } catch (err) {
    console.warn("Could not revoke session:", err);
  }
}
