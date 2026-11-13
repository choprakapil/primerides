import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized, apiCreated } from "@/server/utils/api-response";
import { createBookingSafe } from "@/server/booking";

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
    const admin = await getCurrentAdmin(req);
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

    const [totalCount, bookings] = await Promise.all([
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
    ]);

    const pageCustomerIds = Array.from(
      new Set(bookings.map((b) => b.customer_id).filter((id): id is number => id !== null))
    );

    const verifiedDocs = pageCustomerIds.length > 0
      ? await prisma.identityDocument.findMany({
          where: {
            customer_id: { in: pageCustomerIds },
            status: "verified",
            type: { in: ["driving_license_front", "driving_license_back"] },
          },
          select: { customer_id: true },
          take: pageCustomerIds.length * 2,
        })
      : [];

    const verifiedCustomerIds = new Set(verifiedDocs.map((d) => d.customer_id));

    const sanitizedBookings = bookings.map((b) => {
      const capturedAmount = (b.payments || [])
        .filter((p) => (p.status === "captured" || p.status === "successful") && p.payment_method !== "refund")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const refundedAmount = (b.payments || [])
        .filter((p) => p.status === "refunded" || p.payment_method === "refund")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const refundableBalance = Math.max(0, capturedAmount - refundedAmount);
      const requiredTotal = Number(b.total_amount || 0);
      const isPaid = capturedAmount >= requiredTotal && requiredTotal > 0;

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
        totalPaid: capturedAmount,
        totalRefunded: refundedAmount,
        refundableBalance,
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

/**
 * POST /api/v1/admin/bookings
 * Creates an offline / walk-in / office booking initiated by staff.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.BOOKINGS_MANAGE)) {
      return apiError("Forbidden: You lack bookings.manage permission to create bookings.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const {
      fullName,
      phone,
      email,
      carId,
      rentalPlanId,
      locationId,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      withChauffeur,
      couponCode,
      notes,
      initialPayment,
      status: requestedStatus = "confirmed",
      drivingLicenseNumber,
      verifyDlInPerson,
    } = body;

    if (!fullName?.trim() || !phone?.trim() || !carId || !startDate || !endDate) {
      return apiError("Full name, phone, car, start date, and end date are required.", 400);
    }

    // Resolve rental plan if not provided: pick first active plan for car
    let targetPlanId = rentalPlanId ? Number(rentalPlanId) : null;
    if (!targetPlanId) {
      const defaultPlan = await prisma.rentalPlan.findFirst({
        where: { car_id: Number(carId), is_active: true },
        orderBy: { price: "asc" },
      });
      if (!defaultPlan) {
        return apiError("No active rental package available for this vehicle.", 400);
      }
      targetPlanId = defaultPlan.id;
    }

    // Look up or create CustomerUser profile by phone so walk-in bookings link to KYC documents and history
    let customer = await prisma.customerUser.findFirst({
      where: { phone: phone.trim(), deleted_at: null },
    });

    if (!customer) {
      customer = await prisma.customerUser.create({
        data: {
          phone: phone.trim(),
          full_name: fullName.trim(),
          email: email?.trim() || null,
          is_verified: true,
        },
      });
    } else if (email?.trim() && !customer.email) {
      customer = await prisma.customerUser.update({
        where: { id: customer.id },
        data: { email: email.trim() },
      });
    }

    // Create booking safely via booking engine (ensures row-locking, multi-unit availability, GST, sequential code)
    const bookingResult = await createBookingSafe({
      customerId: customer.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      carId: Number(carId),
      rentalPlanId: targetPlanId,
      locationId: locationId ? Number(locationId) : undefined,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      withChauffeur: !!withChauffeur,
      couponCode: couponCode ? String(couponCode).trim() : undefined,
      source: "office_walkin",
      notes: notes || `Walk-in / Office reservation created by ${admin.name} (${admin.username})`,
    });

    if (!bookingResult.success || !bookingResult.booking) {
      return apiError(bookingResult.error || "Failed to create walk-in booking.", bookingResult.statusCode || 400);
    }

    const createdBooking = bookingResult.booking;

    // Record initial offline payment if collected at reservation time (Cash, POS card, UPI)
    if (initialPayment && initialPayment.amount && Number(initialPayment.amount) > 0) {
      const paymentAmount = Number(initialPayment.amount);
      const paymentMethod = initialPayment.method || "cash";
      const paymentRef = initialPayment.reference || `WALKIN-${Date.now()}`;

      await prisma.payment.create({
        data: {
          booking_id: createdBooking.id,
          amount: paymentAmount,
          currency: "INR",
          gateway: "offline",
          payment_method: paymentMethod,
          status: "captured",
          transaction_ref: paymentRef,
        },
      });

      await prisma.booking.update({
        where: { id: createdBooking.id },
        data: {
          status: requestedStatus,
          admin_notes: `Initial payment of ₹${paymentAmount.toLocaleString("en-IN")} collected via ${paymentMethod.toUpperCase()} (${paymentRef}) by ${admin.name}`,
        },
      });
    } else if (requestedStatus && requestedStatus !== "pending") {
      await prisma.booking.update({
        where: { id: createdBooking.id },
        data: { status: requestedStatus },
      });
    }

    // If DL verified in person at office, create/verify identity document
    if (createdBooking.customer_id && (verifyDlInPerson || drivingLicenseNumber)) {
      await prisma.identityDocument.create({
        data: {
          customer_id: createdBooking.customer_id,
          type: "driving_license_front",
          storage_key: `office_verified_${Date.now()}`,
          file_name: drivingLicenseNumber ? `DL-${String(drivingLicenseNumber).trim().toUpperCase()}` : "In-Person Driving License Inspected",
          status: "verified",
          verified_at: new Date(),
          verified_by: admin.id,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "BOOKING_CREATE_WALKIN",
        entity: "Booking",
        entity_id: createdBooking.id,
        after_state: {
          booking_code: createdBooking.booking_code,
          customer: fullName,
          car_id: carId,
          total_amount: Number(createdBooking.total_amount),
          source: "office_walkin",
        },
      },
    });

    const finalized = await prisma.booking.findUnique({
      where: { id: createdBooking.id },
      include: {
        car: true,
        rental_plan: true,
        location: true,
        price_snapshot: true,
        payments: true,
      },
    });

    const hasVerifiedDL = createdBooking.customer_id
      ? !!(await prisma.identityDocument.findFirst({
          where: {
            customer_id: createdBooking.customer_id,
            status: "verified",
            type: { in: ["driving_license_front", "driving_license_back"] },
          },
        }))
      : false;

    return apiCreated(
      {
        ...finalized,
        hasVerifiedDL,
      },
      `Walk-in booking ${createdBooking.booking_code} created successfully.`
    );
  } catch (err: any) {
    console.error("Admin bookings POST error:", err);
    return apiError(err.message || "Failed to create walk-in booking.", 500);
  }
}
