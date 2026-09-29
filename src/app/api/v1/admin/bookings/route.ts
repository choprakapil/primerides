import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/bookings
 * Server-side filtering, searching, and pagination for bookings.
 * 
 * Query Params:
 * - search: query across booking code, customer name, phone, email, vehicle name
 * - status: "all" | "pending" | "confirmed" | "active" | "completed" | "cancelled"
 * - dateFrom: ISO string or YYYY-MM-DD
 * - dateTo: ISO string or YYYY-MM-DD
 * - page: default 1
 * - limit: default 50
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (
      !hasAdminPermission(admin, [
        ADMIN_PERMISSIONS.BOOKINGS_VIEW,
        ADMIN_PERMISSIONS.BOOKINGS_MANAGE,
      ])
    ) {
      return apiError("Forbidden: You lack permission to view reservations.", 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const dateFrom = searchParams.get("dateFrom")?.trim() || "";
    const dateTo = searchParams.get("dateTo")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { booking_code: { contains: search } },
        { full_name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { car_name: { contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      where.start_date = {};
      if (dateFrom) {
        where.start_date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set to end of day if YYYY-MM-DD
        const toDate = new Date(dateTo);
        if (dateTo.length <= 10) {
          toDate.setHours(23, 59, 59, 999);
        }
        where.start_date.lte = toDate;
      }
    }

    const [totalCount, bookings, verifiedDocs] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          car: true,
          location: true,
          price_snapshot: true,
          payments: true,
          trip: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.identityDocument.findMany({
        where: {
          status: "verified",
          type: { in: ["driving_license_front", "driving_license_back"] },
        },
        select: { customer_id: true },
      }),
    ]);

    const verifiedCustomerIds = new Set(verifiedDocs.map((d) => d.customer_id));

    const sanitizedBookings = bookings.map((b) => {
      const totalPaid = (b.payments || [])
        .filter((p) => p.status === "captured" || p.status === "successful")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const requiredTotal = Number(b.total_amount || 0);
      const isPaid = totalPaid >= requiredTotal && requiredTotal > 0;

      return {
        id: b.id,
        booking_code: b.booking_code,
        customer_id: b.customer_id,
        full_name: b.full_name,
        phone: b.phone,
        email: b.email,
        car_name: b.car_name,
        car: b.car ? { name: b.car.name, brand: b.car.brand } : null,
        location: b.location ? { name: b.location.name, city: b.location.city } : null,
        start_date: b.start_date.toISOString(),
        end_date: b.end_date.toISOString(),
        with_chauffeur: b.with_chauffeur,
        base_amount: Number(b.base_amount || 0),
        coupon_code: b.coupon_code || null,
        discount_amount: Number(b.discount_amount || 0),
        total_amount: requiredTotal,
        totalPaid,
        isPaid,
        payments: (b.payments || []).map((p) => ({
          id: p.id,
          amount: Number(p.amount || 0),
          gateway: p.gateway,
          status: p.status,
          payment_method: p.payment_method,
          transaction_ref: p.transaction_ref,
          created_at: p.created_at.toISOString(),
        })),
        trip: b.trip
          ? {
              start_odometer: b.trip.start_odometer,
              end_odometer: b.trip.end_odometer,
              start_fuel_level: b.trip.start_fuel_level,
              end_fuel_level: b.trip.end_fuel_level,
              inspection_notes: b.trip.inspection_notes,
            }
          : null,
        status: b.status,
        admin_notes: b.admin_notes,
        price_snapshot: b.price_snapshot
          ? {
              plan_name: b.price_snapshot.plan_name,
              free_km: b.price_snapshot.free_km,
              security_deposit: Number(b.price_snapshot.security_deposit || 5000),
            }
          : null,
        hasVerifiedDL: b.customer_id ? verifiedCustomerIds.has(b.customer_id) : false,
      };
    });

    return apiSuccess({
      bookings: sanitizedBookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch bookings", 500);
  }
}
