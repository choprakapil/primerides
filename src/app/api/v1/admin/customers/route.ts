import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/customers
 * Lists customers with their reservation counts, KYC document statuses, and full dossiers.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    // Accessible to superadmins or anyone with customers.view / bookings.view / bookings.manage
    const canView =
      admin.role === "superadmin" ||
      hasAdminPermission(admin, [
        ADMIN_PERMISSIONS.CUSTOMERS_VIEW,
        ADMIN_PERMISSIONS.BOOKINGS_VIEW,
        ADMIN_PERMISSIONS.BOOKINGS_MANAGE,
      ]);

    if (!canView) {
      return apiError("Forbidden: You lack permissions to view customer profiles.", 403);
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const statusFilter = searchParams.get("status")?.trim()?.toLowerCase(); // 'all' | 'verified' | 'pending' | 'unverified'

    const whereClause: any = {
      deleted_at: null,
    };

    if (q) {
      whereClause.OR = [
        { full_name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const customers = await prisma.customerUser.findMany({
      where: whereClause,
      select: {
        id: true,
        phone: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
        bookings: {
          select: {
            id: true,
            booking_code: true,
            status: true,
            start_date: true,
            end_date: true,
            total_amount: true,
            created_at: true,
            car: {
              select: {
                id: true,
                brand: true,
                name: true,
                primary_image: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
        documents: {
          select: {
            id: true,
            type: true,
            status: true,
            storage_key: true,
            mime_type: true,
            file_name: true,
            rejection_reason: true,
            verified_at: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

interface CustomerQueryResult {
  id: number;
  phone: string;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
  bookings: Array<{
    id: number;
    booking_code: string;
    status: string;
    start_date: Date;
    end_date: Date;
    total_amount: any;
    created_at: Date;
    car: { id: number; brand: string; name: string; primary_image: string | null } | null;
  }>;
  documents: Array<{
    id: number;
    type: string;
    status: string;
    storage_key: string;
    mime_type: string | null;
    file_name: string | null;
    rejection_reason: string | null;
    verified_at: Date | null;
    created_at: Date;
  }>;
}

    // Compute metrics
    let totalCustomers = customers.length;
    let verifiedKycCount = 0;
    let pendingKycCount = 0;
    let activeRentersCount = 0;

    const enrichedCustomers = (customers as unknown as CustomerQueryResult[]).map((c) => {
      const hasPendingDoc = c.documents.some((d) => d.status === "pending");
      const hasVerifiedLicense = c.documents.some(
        (d) => d.status === "verified" && d.type.startsWith("driving_license")
      );
      const isVerified = c.is_verified || hasVerifiedLicense;

      if (isVerified) verifiedKycCount++;
      if (hasPendingDoc) pendingKycCount++;

      const activeBookings = c.bookings.filter((b) => b.status === "active" || b.status === "confirmed");
      if (activeBookings.length > 0) activeRentersCount++;

      const totalSpend = c.bookings.reduce((sum: number, b) => sum + Number(b.total_amount || 0), 0);

      return {
        ...c,
        computedKycStatus: isVerified ? "verified" : hasPendingDoc ? "pending" : "unverified",
        totalSpend,
        totalBookings: c.bookings.length,
        activeBookingsCount: activeBookings.length,
      };
    });

    // Apply status filter if requested
    const filteredCustomers = statusFilter && statusFilter !== "all"
      ? enrichedCustomers.filter((c) => c.computedKycStatus === statusFilter)
      : enrichedCustomers;

    return apiSuccess(
      {
        customers: filteredCustomers,
        telemetry: {
          totalCustomers,
          verifiedKycCount,
          pendingKycCount,
          activeRentersCount,
        },
      },
      "Customer directory retrieved successfully."
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch customer directory", 500);
  }
}
