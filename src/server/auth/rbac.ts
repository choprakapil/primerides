import { cookies, headers } from "next/headers";
import { prisma } from "../db/client";
import { verifyAccessToken } from "./jwt";

export const ADMIN_PERMISSIONS = {
  FLEET_MANAGE: "fleet.manage",
  BOOKINGS_MANAGE: "bookings.manage",
  BOOKINGS_VIEW: "bookings.view",
  DOCUMENTS_MANAGE: "documents.manage",
  LEADS_MANAGE: "leads.manage",
  CONTENT_MANAGE: "content.manage",
  PRICING_MANAGE: "pricing.manage",
  ADMINS_MANAGE: "admins.manage",
  CUSTOMERS_VIEW: "customers.view",
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_MANAGE: "payments.manage",
  COUPONS_VIEW: "coupons.view",
  COUPONS_MANAGE: "coupons.manage",
} as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

export const ALL_PERMISSIONS: { key: AdminPermission; label: string; description: string }[] = [
  {
    key: ADMIN_PERMISSIONS.COUPONS_VIEW,
    label: "Coupons & Offers (View)",
    description: "View promotional coupons, discounts, usage limits, and redemption statistics",
  },
  {
    key: ADMIN_PERMISSIONS.COUPONS_MANAGE,
    label: "Coupons & Discounts (Manage)",
    description: "Create, edit, toggle active status, and retire promo coupon codes",
  },
  {
    key: ADMIN_PERMISSIONS.PAYMENTS_VIEW,
    label: "Accounts & Financial Reports",
    description: "View payment ledger, revenue analytics, cash/POS collections, and payment mode reports",
  },
  {
    key: ADMIN_PERMISSIONS.PAYMENTS_MANAGE,
    label: "Payments & Accounting Operations",
    description: "Issue refunds, record offline settlement, adjust billing notes, and reconcile transactions",
  },
  {
    key: ADMIN_PERMISSIONS.FLEET_MANAGE,
    label: "Fleet Management",
    description: "Create, edit, and delete vehicles, update specifications and availability",
  },
  {
    key: ADMIN_PERMISSIONS.BOOKINGS_MANAGE,
    label: "Bookings Management",
    description: "Confirm, assign drivers, cancel, and modify reservation statuses",
  },
  {
    key: ADMIN_PERMISSIONS.BOOKINGS_VIEW,
    label: "Bookings Read-Only",
    description: "View reservations, customer itineraries, and trip details without editing",
  },
  {
    key: ADMIN_PERMISSIONS.CUSTOMERS_VIEW,
    label: "Customers & Directory",
    description: "View registered customer profiles, contact info, booking history, and dossiers",
  },
  {
    key: ADMIN_PERMISSIONS.DOCUMENTS_MANAGE,
    label: "KYC & Identity Documents",
    description: "Review, verify, and reject customer driving licenses, Aadhaar, and identity documents",
  },
  {
    key: ADMIN_PERMISSIONS.LEADS_MANAGE,
    label: "Inquiries & Leads",
    description: "Manage contact inquiries, callback requests, and corporate leads",
  },
  {
    key: ADMIN_PERMISSIONS.CONTENT_MANAGE,
    label: "Content & Dynamic SEO",
    description: "Publish blogs, update FAQs, manage reviews, and edit route SEO metadata",
  },
  {
    key: ADMIN_PERMISSIONS.PRICING_MANAGE,
    label: "Pricing & Tariffs",
    description: "Modify daily rates, hourly pricing, and security deposit requirements",
  },
  {
    key: ADMIN_PERMISSIONS.ADMINS_MANAGE,
    label: "Staff & RBAC Administration",
    description: "Create staff accounts, assign granular permissions, and review audit logs",
  },
];

export interface CurrentAdmin {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: AdminPermission[];
  isActive: boolean;
}

/**
 * Checks if an admin possesses a given permission (or if they are superadmin).
 */
export function hasAdminPermission(
  admin: { role: string; permissions?: any },
  permission: AdminPermission | AdminPermission[]
): boolean {
  if (!admin) return false;
  if (admin.role === "superadmin") return true;

  const raw = admin.permissions;
  const userPerms: string[] = Array.isArray(raw) ? raw : typeof raw === "string" ? JSON.parse(raw) : [];

  if (userPerms.includes("*")) return true;

  if (Array.isArray(permission)) {
    return permission.some((p) => userPerms.includes(p));
  }

  return userPerms.includes(permission);
}

/**
 * Resolves current admin user from Authorization header OR HTTP-only cookie 'primerides_admin_token'.
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  try {
    let token: string | undefined;

    // A. Check Authorization Bearer Header
    const headerList = await headers();
    const authHeader = headerList.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // B. Check Cookie if no Bearer header
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("primerides_admin_token")?.value;
    }

    if (!token) return null;

    const payload = await verifyAccessToken(token);
    if (!payload || payload.type !== "admin") return null;

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.id, deleted_at: null },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        is_active: true,
      },
    });

    if (!admin || !admin.is_active) return null;

    const raw = admin.permissions;
    const permissions: AdminPermission[] = admin.role === "superadmin"
      ? (Object.values(ADMIN_PERMISSIONS) as AdminPermission[])
      : (Array.isArray(raw) ? raw : typeof raw === "string" ? JSON.parse(raw) : []);

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions,
      isActive: admin.is_active,
    };
  } catch (err) {
    console.error("Error resolving current admin:", err);
    return null;
  }
}

/**
 * Guard that enforces an admin is authenticated with the specified permission.
 */
export async function requireAdminPermission(
  permission: AdminPermission | AdminPermission[]
): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED: Please sign in as an administrator.");
  }

  if (!hasAdminPermission(admin, permission)) {
    const needed = Array.isArray(permission) ? permission.join(" or ") : permission;
    throw new Error(`FORBIDDEN: You lack the required permission (${needed}) to access this resource.`);
  }

  return admin;
}
