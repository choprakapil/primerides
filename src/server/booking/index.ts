import { prisma } from "../db/client";
import { notifyBookingConfirmed, notifyBookingCancelled } from "@/server/notifications";
import { createRazorpayRefund } from "@/server/payments/razorpay";
import { calculateGst, SAC_CODE } from "@/server/invoicing/gst";
import { generateSequentialBookingCode } from "@/server/invoicing/sequence";
import { getSiteSettings, getSiteSettingsAsync } from "@/server/settings";
import { formatIstDateTime } from "@/lib/dates";

export interface CreateBookingInput {
  fullName: string;
  phone: string;
  email?: string;
  carId: number;
  rentalPlanId?: number;
  locationId?: number;
  startDate: string | Date;
  endDate: string | Date;
  pickupLocation?: string;
  dropLocation?: string;
  withChauffeur?: boolean;
  customerId?: number | null;
  source?: string;
  platform?: "web" | "android" | "ios";
  notes?: string;
  idempotencyKey?: string;
  couponCode?: string;
}

export interface BookingResult {
  success: boolean;
  booking?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Executes atomic booking creation following the PrimeRides KM-Plan & Location Specification:
 * 1. Validate inputs and date ranges.
 * 2. Verify car existence, active location, and selected RentalPlan.
 * 3. Check for overlapping active bookings for the specific car.
 * 4. Perform server-side price calculation based on the selected KM / Monthly plan.
 * 4b. Calculate GST (18% on taxable value: rental + chauffeur - discount; deposit excluded).
 * 5. Run atomic Prisma transaction:
 *    - Create Booking row with location_id and rental_plan_id
 *    - Create immutable PriceSnapshot with plan details, GST breakdown (CGST/SGST), SAC 996601
 *    - Create BookingStatusHistory audit trail
 */
export async function createBookingSafe(input: CreateBookingInput): Promise<BookingResult> {
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
    withChauffeur = false,
    customerId,
    source = "web",
    platform,
    notes,
    idempotencyKey,
    couponCode,
  } = input;

  // 1. Validate Required Fields
  if (!fullName?.trim() || !phone?.trim() || !carId || !startDate || !endDate) {
    return {
      success: false,
      error: "Full name, phone number, vehicle selection, start date, and end date are required.",
      statusCode: 400,
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, error: "Invalid start or end date format.", statusCode: 400 };
  }

  if (start < new Date(now.getTime() - 5 * 60 * 1000)) {
    return { success: false, error: "Pickup date cannot be in the past.", statusCode: 400 };
  }

  if (end <= start) {
    return { success: false, error: "Return date must be after pickup date.", statusCode: 400 };
  }

  // 2. Fetch Car, Location & Rental Plans
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      category: true,
      location: true,
      rental_plans: { where: { is_active: true } },
    },
  });

  if (!car || car.deleted_at || !car.is_available) {
    return {
      success: false,
      error: "The requested vehicle is currently unavailable or does not exist.",
      statusCode: 404,
    };
  }

  // Verify location if explicitly passed
  if (locationId && car.location_id && car.location_id !== locationId) {
    return {
      success: false,
      error: "The selected vehicle is not available in the requested location.",
      statusCode: 400,
    };
  }

  // 3. Select Rental Plan
  let selectedPlan = car.rental_plans.find((p) => p.id === rentalPlanId);
  if (!selectedPlan && car.rental_plans.length > 0) {
    selectedPlan = car.rental_plans[0];
  }

  if (!selectedPlan) {
    return {
      success: false,
      error: "No active rental plans found for this vehicle.",
      statusCode: 400,
    };
  }

  // 4. Server-Side Price, Discount & GST Calculation
  const planPrice = Number(selectedPlan.price);
  const securityDeposit = Number(selectedPlan.security_deposit || car.security_deposit || 5000);
  const freeKm = selectedPlan.free_km;
  const extraKmRate = Number(selectedPlan.extra_km_rate || 7);

  const diffMs = end.getTime() - start.getTime();
  const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const calculatedDays = Math.max(1, Math.ceil(totalHours / 24));
  const chauffeurRatePerDay = 1500;
  const chauffeurFee = withChauffeur ? calculatedDays * chauffeurRatePerDay : 0;
  const grossAmount = planPrice + chauffeurFee;

  let appliedCoupon: any = null;
  let discountAmount = 0;

  if (couponCode && couponCode.trim()) {
    const couponValidation = await validateCoupon(couponCode.trim(), grossAmount, {
      customerId,
      phone,
      platform: platform || (source as any),
    });
    if (!couponValidation.valid) {
      return {
        success: false,
        error: couponValidation.error || "Invalid coupon code.",
        statusCode: 400,
      };
    }
    appliedCoupon = couponValidation.coupon;
    discountAmount = couponValidation.discountAmount || 0;
  }

  // Issue #15: Dynamically fetch configurable GSTIN, tax rate, SAC code and corporate name from Site Settings
  const siteSettings = await getSiteSettingsAsync().catch(() => getSiteSettings());
  const configuredGstRate = typeof siteSettings.gstRatePercentage === "number" ? siteSettings.gstRatePercentage : 18;
  const configuredGstin = siteSettings.gstNumber || "07AABCP1234F1Z5";
  const configuredSacCode = siteSettings.sacCode || SAC_CODE;
  const configuredLegalName = siteSettings.legalCorporateName || "PrimeRides Mobility Solutions Private Limited";

  // GST Calculation (using admin-configured rate; deposit excluded)
  const gstBreakdown = calculateGst({
    rentalAmount: planPrice,
    chauffeurFee,
    discountAmount,
    securityDeposit,
    isInterState: false, // PrimeRides operates intra-state (Delhi NCR / Lucknow within UP/Delhi)
    gstRateOverride: configuredGstRate,
  });

  // Total = taxable amount + GST + security deposit (GST-inclusive grand total)
  const netTotalAmount = gstBreakdown.grandTotal;

  // 5. Atomic Concurrency Lock & Transaction
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // A. Pessimistic Row Lock on Car Record
        // In MySQL InnoDB, acquiring an exclusive FOR UPDATE lock on the car record forces
        // all concurrent transactions for this vehicle to serialize, ensuring the overlapping
        // count check is 100% consistent and immune to REPEATABLE READ snapshot phantom reads.
        const lockedCars = await tx.$queryRaw<
          Array<{
            id: number;
            fleet_count: number;
            name: string;
            is_available: boolean;
            deleted_at: Date | null;
          }>
        >`SELECT id, fleet_count, name, is_available, deleted_at FROM tbl_cars WHERE id = ${carId} FOR UPDATE`;

        if (!lockedCars || lockedCars.length === 0 || lockedCars[0].deleted_at || !lockedCars[0].is_available) {
          throw new Error("Vehicle is currently unavailable for booking.");
        }

        const lockedCar = lockedCars[0];
        const totalFleet = lockedCar.fleet_count || 1;

        // B. Check for Idempotency
        if (idempotencyKey) {
          const existing = await tx.booking.findUnique({
            where: { idempotency_key: idempotencyKey },
            include: { price_snapshot: true, car: true, location: true, rental_plan: true },
          });
          if (existing) return existing;
        }

        // C. Check for Overlapping Bookings against Car Fleet Count (Multi-unit inventory)
        const overlappingCount = await tx.booking.count({
          where: {
            car_id: carId,
            deleted_at: null,
            status: { in: ["pending", "confirmed", "active"] },
            AND: [
              { start_date: { lt: end } },
              { end_date: { gt: start } },
            ],
          },
        });

        if (overlappingCount >= totalFleet) {
          throw new Error(
            `All ${totalFleet} units of ${lockedCar.name} are already reserved for the selected dates in ${car.location?.name || "this location"}. Please choose alternative dates.`
          );
        }

        // D. Generate Sequential Booking/Invoice Code (GST Rule 46 compliant)
        const bookingCode = await generateSequentialBookingCode(tx, start);

        // E. Concurrency Row-Lock & Re-Validation on Applied Coupon (Issue #11 & #12)
        if (appliedCoupon) {
          const [lockedCoupon]: any = await tx.$queryRaw`
            SELECT id, code, is_active, usage_limit, used_count, min_booking_amount, per_user_limit, new_users_only, applicable_platforms, valid_from, valid_until, deleted_at
            FROM tbl_coupons
            WHERE id = ${appliedCoupon.id}
            FOR UPDATE
          `;

          if (!lockedCoupon || !lockedCoupon.is_active || lockedCoupon.deleted_at) {
            throw new Error("COUPON_INACTIVE: This promotional coupon is no longer active.");
          }

          const now = new Date();
          if (lockedCoupon.valid_from && now < new Date(lockedCoupon.valid_from)) {
            throw new Error("COUPON_NOT_STARTED: This promotional coupon is not yet active.");
          }
          if (lockedCoupon.valid_until && now > new Date(lockedCoupon.valid_until)) {
            throw new Error("COUPON_EXPIRED: This promotional coupon has expired.");
          }

          const lockedMinAmt = Number(lockedCoupon.min_booking_amount || 0);
          if (lockedMinAmt > 0 && grossAmount < lockedMinAmt) {
            throw new Error(`COUPON_MIN_AMOUNT: Minimum booking value of ₹${lockedMinAmt.toLocaleString("en-IN")} required.`);
          }

          // 1. Platform verification
          const rawPlatforms = lockedCoupon.applicable_platforms || "web,android,ios";
          const allowedPlatforms = rawPlatforms.split(",").map((p: string) => p.trim().toLowerCase());
          const targetPlatform = (platform || source || "web").trim().toLowerCase();
          if (!allowedPlatforms.includes(targetPlatform)) {
            const platformLabel = targetPlatform === "android" ? "Android App" : targetPlatform === "ios" ? "iOS App" : "Website";
            throw new Error(`COUPON_PLATFORM_RESTRICTED: This promo code is not eligible on ${platformLabel}.`);
          }

          // 2. Concurrency Usage Limit guard (Issue #11)
          if (lockedCoupon.usage_limit && lockedCoupon.used_count >= lockedCoupon.usage_limit) {
            throw new Error("COUPON_LIMIT_EXCEEDED: This promotional coupon has reached its maximum redemption limit.");
          }

          // 3. New Users Only guard
          if (lockedCoupon.new_users_only && (customerId || phone)) {
            const priorCount = await tx.booking.count({
              where: {
                OR: [
                  ...(customerId ? [{ customer_id: customerId }] : []),
                  ...(phone ? [{ phone }] : []),
                ],
                status: { notIn: ["cancelled", "expired"] },
              },
            });
            if (priorCount > 0) {
              throw new Error("COUPON_NEW_USERS_ONLY: This promo coupon is exclusively reserved for first-time customers.");
            }
          }

          // 4. Per-User Limit guard
          if (lockedCoupon.per_user_limit && (customerId || phone)) {
            const userCount = await tx.booking.count({
              where: {
                coupon_id: lockedCoupon.id,
                OR: [
                  ...(customerId ? [{ customer_id: customerId }] : []),
                  ...(phone ? [{ phone }] : []),
                ],
                status: { notIn: ["cancelled", "expired"] },
              },
            });
            if (userCount >= lockedCoupon.per_user_limit) {
              throw new Error(`COUPON_USER_LIMIT_EXCEEDED: You have already used this coupon the maximum allowed times (${lockedCoupon.per_user_limit}).`);
            }
          }
        }

      // A. Create Booking with Coupon & Discount
      const createdBooking = await tx.booking.create({
        data: {
          booking_code: bookingCode,
          customer_id: customerId || null,
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          location_id: car.location_id,
          car_id: car.id,
          car_name: car.name,
          rental_plan_id: selectedPlan.id,
          start_date: start,
          end_date: end,
          pickup_location: pickupLocation || car.location?.name || "Hub Pickup",
          drop_location: dropLocation || car.location?.name || "Hub Drop",
          with_chauffeur: !!withChauffeur,
          base_amount: planPrice,
          chauffeur_fee: chauffeurFee,
          security_deposit: securityDeposit,
          discount_amount: discountAmount,
          coupon_id: appliedCoupon?.id || null,
          coupon_code: appliedCoupon?.code || null,
          total_amount: netTotalAmount,
          status: "pending",
          source,
          notes,
          idempotency_key: idempotencyKey || null,
        },
      });

      // B. Create Immutable Price Snapshot with Plan Details, Discount & GST Breakdown
      await tx.priceSnapshot.create({
        data: {
          booking_id: createdBooking.id,
          car_id: car.id,
          rental_plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          plan_price: planPrice,
          free_km: freeKm,
          extra_km_rate: extraKmRate,
          security_deposit: securityDeposit,
          tax_amount: gstBreakdown.totalGst,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon?.code || null,
          calculated_days: calculatedDays,
          calculated_hours: totalHours,
          total_calculated: netTotalAmount,
          currency: "INR",
          snapshot_data: {
            carName: car.name,
            brand: car.brand,
            category: car.category?.name,
            locationName: car.location?.name,
            locationCity: car.location?.city,
            planName: selectedPlan.name,
            planType: selectedPlan.plan_type,
            grossAmount,
            discountAmount,
            couponCode: appliedCoupon?.code || null,
            // GST Breakdown (Indian Tax Compliance - Issue #15 Configurable Tax Settings)
            legalCorporateName: configuredLegalName,
            sacCode: configuredSacCode,
            gstin: configuredGstin,
            taxInvoiceAddress: siteSettings.taxInvoiceAddress || "Indira Gandhi International Airport, Terminal 3 VIP Valet, New Delhi 110037",
            taxInvoiceState: siteSettings.taxInvoiceState || "07 - Delhi",
            taxableAmount: gstBreakdown.taxableAmount,
            gstRate: configuredGstRate,
            cgstRate: gstBreakdown.cgstRate,
            cgstAmount: gstBreakdown.cgstAmount,
            sgstRate: gstBreakdown.sgstRate,
            sgstAmount: gstBreakdown.sgstAmount,
            igstRate: gstBreakdown.igstRate,
            igstAmount: gstBreakdown.igstAmount,
            totalGst: gstBreakdown.totalGst,
            isInterState: gstBreakdown.isInterState,
            // Totals
            netTotalAmount,
            grandTotal: gstBreakdown.grandTotal,
            appliedAt: new Date().toISOString(),
          },
        },
      });

      // C. Increment Coupon Usage Count if coupon was applied
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { used_count: { increment: 1 } },
        });
      }

      // D. Record Booking Status History
      await tx.bookingStatusHistory.create({
        data: {
          booking_id: createdBooking.id,
          from_status: "none",
          to_status: "pending",
          changed_by_user_id: customerId || null,
          changed_by_role: customerId ? "customer" : "guest",
          reason: `Initial booking submission under ${selectedPlan.name}${appliedCoupon ? ` (Coupon: ${appliedCoupon.code} applied)` : ""}`,
        },
      });

      return createdBooking;
    }, { timeout: 15000, maxWait: 10000 });

    // Asynchronous notification dispatch (errors caught so user flow is uninterrupted)
    notifyBookingConfirmed({
      customerName: result.full_name || "Valued Customer",
      customerEmail: result.email || null,
      customerPhone: result.phone || "",
      bookingCode: result.booking_code || "PR-PENDING",
      carName: result.car_name || "Vehicle",
      startDate: result.start_date,
      endDate: result.end_date,
      totalAmount: Number(result.total_amount || 0),
      pickupLocation: result.pickup_location,
    }).catch((e) => console.error("[Notification:BookingConfirmed] Failed to dispatch:", e));

    return {
      success: true,
      booking: result,
      statusCode: 201,
    };
  } catch (err: any) {
    if (idempotencyKey && (err.code === "P2002" || err.message?.includes("idempotency_key"))) {
      const existing = await prisma.booking.findUnique({
        where: { idempotency_key: idempotencyKey },
        include: { price_snapshot: true, car: true, location: true, rental_plan: true },
      });
      if (existing) {
        return {
          success: true,
          booking: existing,
          statusCode: 200,
        };
      }
    }

    const isCouponConflict = err.message?.includes("COUPON_LIMIT_EXCEEDED");
    const isCouponError = typeof err.message === "string" && err.message.startsWith("COUPON_");
    let userError = err.message || "Failed to create booking";
    if (isCouponError) {
      userError = err.message.replace(/^COUPON_[A-Z_]+:\s*/, "");
    }
    const isConflict = err.message?.includes("already reserved") || err.message?.includes("unavailable") || isCouponConflict;
    return {
      success: false,
      error: userError,
      statusCode: isConflict ? 409 : isCouponError ? 400 : 500,
    };
  }
}

export async function getCustomerBookings(customerId: number, limit = 50, skip = 0) {
  return await prisma.booking.findMany({
    where: {
      customer_id: customerId,
      deleted_at: null,
    },
    include: {
      car: true,
      location: true,
      rental_plan: true,
      price_snapshot: true,
      status_history: { orderBy: { created_at: "desc" } },
      payments: true,
    },
    orderBy: { created_at: "desc" },
    take: limit,
    skip,
  });
}

export async function getCustomerPayments(customerId: number, limit = 50, skip = 0) {
  return await prisma.payment.findMany({
    where: {
      booking: {
        customer_id: customerId,
        deleted_at: null,
      },
    },
    include: {
      booking: {
        include: {
          car: true,
          location: true,
          rental_plan: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
    take: limit,
    skip,
  });
}

export async function getCustomerPortalStats(customerId: number) {
  const [totalTrips, activeBookings, verifiedDoc] = await Promise.all([
    prisma.booking.count({
      where: {
        customer_id: customerId,
        deleted_at: null,
      },
    }),
    prisma.booking.count({
      where: {
        customer_id: customerId,
        deleted_at: null,
        status: { in: ["pending", "confirmed", "active"] },
      },
    }),
    prisma.identityDocument.findFirst({
      where: {
        customer_id: customerId,
        type: { in: ["driving_license_front", "driving_license_back"] },
        status: "verified",
        deleted_at: null,
      },
    }),
  ]);

  return {
    totalTrips,
    activeBookings,
    hasVerifiedDL: !!verifiedDoc,
  };
}

export async function getCustomerUnpaidBookings(customerId: number, limit = 20, skip = 0) {
  const bookings = await prisma.booking.findMany({
    where: {
      customer_id: customerId,
      deleted_at: null,
      status: { in: ["pending", "confirmed"] },
    },
    include: {
      car: {
        include: {
          category: true,
          location: true,
        },
      },
      location: true,
      rental_plan: true,
      price_snapshot: true,
      payments: true,
    },
    orderBy: { created_at: "desc" },
    take: limit,
    skip,
  });

  return bookings.map((b) => {
    const totalPaid = (b.payments || [])
      .filter((p) => p.status === "captured" || p.status === "successful")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const requiredTotal = Number(b.total_amount || 0);
    const isPaid = totalPaid >= requiredTotal && requiredTotal > 0;

    return {
      ...b,
      totalPaid,
      isPaid,
    };
  });
}

export interface ValidateCouponContext {
  customerId?: number | null;
  phone?: string;
  platform?: "web" | "android" | "ios" | string;
}

export interface ValidateCouponResult {
  valid: boolean;
  error?: string;
  coupon?: {
    id: number;
    code: string;
    description: string | null;
    discount_type: string;
    discount_value: number;
    min_booking_amount: number;
    max_discount_amount: number | null;
    applicable_platforms?: string;
    show_in_slider?: boolean;
    new_users_only?: boolean;
    per_user_limit?: number | null;
  };
  discountAmount?: number;
  discountType?: string;
  discountValue?: number;
  netPayableAmount?: number;
}

export interface CancelBookingResult {
  success: boolean;
  error?: string;
  statusCode?: number;
  refundAmount?: number;
  penaltyAmount?: number;
  refundPolicyTier?: string;
  refundGatewayRef?: string;
}

/**
 * cancelBookingForCustomer
 *
 * Safely cancels a booking on behalf of the customer:
 * - Only allows cancellation of `pending` or `confirmed` bookings.
 * - Active, completed, or already-cancelled bookings cannot be self-cancelled.
 * - Enforces tiered refund policy:
 *   • > 24 hours before pickup: 100% rental refund + 100% security deposit
 *   • 12 - 24 hours before pickup: 50% rental refund + 100% security deposit
 *   • < 12 hours before pickup: 0% rental refund + 100% security deposit
 * - Executes real Razorpay refund API call via `createRazorpayRefund`.
 * - Records cancellation in `tbl_cancellations` and refund transaction in `tbl_payments`.
 * - Records the status transition in `tbl_booking_status_history`.
 */
export async function cancelBookingForCustomer(
  bookingId: number,
  customerId: number,
  reason?: string
): Promise<CancelBookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      customer_id: true,
      status: true,
      booking_code: true,
      full_name: true,
      email: true,
      phone: true,
      car_name: true,
      start_date: true,
      total_amount: true,
      security_deposit: true,
      deleted_at: true,
      payments: {
        where: { status: { in: ["captured", "successful"] } },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!booking || booking.deleted_at) {
    return { success: false, error: "Booking not found.", statusCode: 404 };
  }

  if (booking.customer_id !== customerId) {
    return { success: false, error: "You are not authorised to cancel this booking.", statusCode: 403 };
  }

  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(booking.status)) {
    return {
      success: false,
      error:
        booking.status === "active"
          ? "Your trip is already underway and cannot be self-cancelled. Please contact support."
          : booking.status === "cancelled"
          ? "This reservation has already been cancelled."
          : "This reservation cannot be cancelled at its current stage. Please contact support.",
      statusCode: 422,
    };
  }

  // 1. Calculate Refund Policy Tiers
  const now = new Date();
  const pickupTime = new Date(booking.start_date);
  const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  const capturedPayments = (booking.payments || []).filter(
    (p) => p.payment_method !== "refund"
  );
  const totalPaid = capturedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  let refundAmount = 0;
  let penaltyAmount = 0;
  let refundPolicyTier = "no_payment_captured";

  if (totalPaid > 0) {
    const deposit = Number(booking.security_deposit || 0);
    const rentalPaid = Math.max(0, totalPaid - deposit);

    if (hoursUntilPickup >= 24) {
      refundAmount = totalPaid;
      penaltyAmount = 0;
      refundPolicyTier = "100% full refund (>24h)";
    } else if (hoursUntilPickup >= 12) {
      const rentalRefund = Math.round(rentalPaid * 0.5 * 100) / 100;
      refundAmount = rentalRefund + deposit;
      penaltyAmount = Math.max(0, totalPaid - refundAmount);
      refundPolicyTier = "50% cancellation fee (12-24h)";
    } else {
      refundAmount = deposit;
      penaltyAmount = rentalPaid;
      refundPolicyTier = "100% cancellation fee on rental (<12h), deposit refunded";
    }
  }

  // 2. Real Gateway Execution (Razorpay Refund API)
  let refundGatewayRef: string | undefined;
  if (totalPaid > 0 && refundAmount > 0 && capturedPayments.length > 0) {
    const primaryPayment = capturedPayments[0];
    try {
      const gatewayRefund = await createRazorpayRefund({
        paymentId: primaryPayment.transaction_ref,
        amountInRupees: refundAmount,
        notes: {
          bookingCode: booking.booking_code,
          bookingId: String(booking.id),
          reason: reason || "Customer self-cancellation",
          tier: refundPolicyTier,
        },
      });
      refundGatewayRef = gatewayRefund.id;
    } catch (gatewayErr: any) {
      console.error("[Refund:GatewayError] Razorpay refund failed:", gatewayErr);
      return {
        success: false,
        error: `Payment refund failed at payment gateway: ${gatewayErr.message || "Unknown error"}. Please contact support.`,
        statusCode: 502,
      };
    }
  }

  // 3. Atomic Database Ledger & Status Update
  await prisma.$transaction(async (tx) => {
    // A. Update booking status
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });

    // B. Upsert Cancellation record
    await tx.cancellation.upsert({
      where: { booking_id: bookingId },
      create: {
        booking_id: bookingId,
        reason: reason?.trim() || "Customer self-cancelled via account portal.",
        cancelled_by: "customer",
        refund_amount: refundAmount,
        penalty_amount: penaltyAmount,
        processed_at: new Date(),
      },
      update: {
        reason: reason?.trim() || "Customer self-cancelled via account portal.",
        cancelled_by: "customer",
        refund_amount: refundAmount,
        penalty_amount: penaltyAmount,
        processed_at: new Date(),
      },
    });

    // C. Insert Refund Payment ledger record
    if (refundAmount > 0) {
      await tx.payment.create({
        data: {
          booking_id: bookingId,
          amount: refundAmount,
          currency: "INR",
          status: "refunded",
          gateway: capturedPayments[0]?.gateway || "razorpay",
          transaction_ref: refundGatewayRef || `rfnd_${Date.now()}`,
          payment_method: "refund",
          metadata: {
            refundPolicyTier,
            originalPaymentRef: capturedPayments[0]?.transaction_ref,
            hoursUntilPickup: Math.round(hoursUntilPickup * 10) / 10,
            penaltyAmount,
            refundedAt: new Date().toISOString(),
          },
        },
      });
    }

    // D. Log Status History
    await tx.bookingStatusHistory.create({
      data: {
        booking_id: bookingId,
        from_status: booking.status,
        to_status: "cancelled",
        changed_by_role: "customer",
        changed_by_user_id: customerId,
        reason: refundAmount > 0
          ? `Cancelled (${refundPolicyTier}). Refund of ₹${refundAmount.toLocaleString("en-IN")} processed via ${refundGatewayRef || "gateway"}. Cancellation penalty: ₹${penaltyAmount}.`
          : `Cancelled (${refundPolicyTier}). No refundable payment recorded.`,
      },
    });
  });

  // 4. Dispatch notification
  notifyBookingCancelled({
    customerName: booking.full_name || "Valued Customer",
    customerEmail: booking.email || null,
    customerPhone: booking.phone || "",
    bookingCode: booking.booking_code || "PR-CANCELLED",
    carName: booking.car_name || "Vehicle",
  }).catch((e) => console.error("[Notification:BookingCancelled] Failed to dispatch:", e));

  return {
    success: true,
    refundAmount,
    penaltyAmount,
    refundPolicyTier,
    refundGatewayRef,
  };
}

export async function validateCoupon(
  code: string,
  bookingAmount: number,
  context?: ValidateCouponContext
): Promise<ValidateCouponResult> {
  if (!code || !code.trim()) {
    return { valid: false, error: "Coupon code is required." };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.is_active || coupon.deleted_at) {
    return { valid: false, error: "Invalid, expired, or inactive coupon code." };
  }

  const now = new Date();
  if (coupon.valid_from && now < coupon.valid_from) {
    return { valid: false, error: "This promo coupon is not yet active." };
  }

  const couponData = coupon as any;

  if (coupon.valid_until && now > coupon.valid_until) {
    return { valid: false, error: "This promo coupon has expired." };
  }

  // 1. Platform eligibility check
  const rawPlatforms = couponData.applicable_platforms || "web,android,ios";
  const allowedPlatforms = rawPlatforms.split(",").map((p: string) => p.trim().toLowerCase());
  const clientPlatform = (context?.platform || "web").trim().toLowerCase();
  if (!allowedPlatforms.includes(clientPlatform)) {
    const isMobileOnly = !allowedPlatforms.includes("web") && (allowedPlatforms.includes("android") || allowedPlatforms.includes("ios"));
    if (isMobileOnly) {
      return { valid: false, error: "This coupon is exclusively valid on the PrimeRides Mobile App (Android & iOS). Download our app to redeem." };
    }
    const platformName = clientPlatform === "android" ? "Android App" : clientPlatform === "ios" ? "iOS App" : "Website";
    return { valid: false, error: `This promo coupon is not valid on ${platformName}.` };
  }

  // 2. Global platform redemption limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: "This promo coupon has reached its maximum redemption limit." };
  }

  // 3. New users only check
  if (couponData.new_users_only && (context?.customerId || context?.phone)) {
    const priorCount = await prisma.booking.count({
      where: {
        OR: [
          ...(context.customerId ? [{ customer_id: context.customerId }] : []),
          ...(context.phone ? [{ phone: context.phone }] : []),
        ],
        status: { notIn: ["cancelled", "expired"] },
      },
    });
    if (priorCount > 0) {
      return { valid: false, error: "This promo coupon is exclusively reserved for first-time customers on their first booking." };
    }
  }

  // 4. Per-user limit check
  if (couponData.per_user_limit && (context?.customerId || context?.phone)) {
    const userCount = await prisma.booking.count({
      where: {
        coupon_id: coupon.id,
        OR: [
          ...(context.customerId ? [{ customer_id: context.customerId }] : []),
          ...(context.phone ? [{ phone: context.phone }] : []),
        ],
        status: { notIn: ["cancelled", "expired"] },
      },
    });
    if (userCount >= couponData.per_user_limit) {
      return {
        valid: false,
        error: `You have already redeemed this coupon the maximum allowed times (${couponData.per_user_limit}).`,
      };
    }
  }

  const minAmt = Number(coupon.min_booking_amount || 0);
  if (bookingAmount < minAmt) {
    return {
      valid: false,
      error: `Minimum booking value of ₹${minAmt.toLocaleString("en-IN")} required to apply this coupon.`,
    };
  }

  let discount = 0;
  const val = Number(coupon.discount_value);
  if (coupon.discount_type === "percentage") {
    discount = Math.round((bookingAmount * val) / 100);
    const maxCap = coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null;
    if (maxCap && discount > maxCap) {
      discount = maxCap;
    }
  } else {
    discount = Math.min(val, bookingAmount);
  }

  const netPayable = Math.max(0, bookingAmount - discount);

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: val,
      min_booking_amount: minAmt,
      max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
      applicable_platforms: couponData.applicable_platforms,
      show_in_slider: couponData.show_in_slider,
      new_users_only: couponData.new_users_only,
      per_user_limit: couponData.per_user_limit,
    },
    discountAmount: discount,
    discountType: coupon.discount_type,
    discountValue: val,
    netPayableAmount: netPayable,
  };
}

export interface ExtendBookingParams {
  bookingId: number;
  newEndDate: string | Date;
  customerId?: number;
  adminActor?: { id: number; name: string };
  reason?: string;
}

export async function extendBookingSafe(params: ExtendBookingParams) {
  const { bookingId, newEndDate: newEndDateInput, customerId, adminActor, reason } = params;

  const targetDate = new Date(newEndDateInput);
  if (isNaN(targetDate.getTime())) {
    return { success: false, error: "Invalid new return date format.", statusCode: 400 };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      car: true,
      rental_plan: true,
      price_snapshot: true,
      customer: true,
    },
  });

  if (!booking || booking.deleted_at) {
    return { success: false, error: "Booking not found.", statusCode: 404 };
  }

  // Authorization check: If customerId is provided, enforce ownership
  if (customerId && booking.customer_id !== customerId) {
    return { success: false, error: "Unauthorized. You cannot extend another customer's booking.", statusCode: 403 };
  }

  // State guard: Can only extend active or confirmed trips
  if (booking.status !== "active" && booking.status !== "confirmed") {
    return {
      success: false,
      error: `Cannot extend booking with status "${booking.status}". Only active or confirmed rentals can be extended.`,
      statusCode: 400,
    };
  }

  const currentEndDate = new Date(booking.end_date);
  if (targetDate.getTime() <= currentEndDate.getTime()) {
    return {
      success: false,
      error: `New return date must be strictly after the current scheduled return date (${formatIstDateTime(currentEndDate)}).`,
      statusCode: 400,
    };
  }

  // Concurrency-safe extension transaction
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Lock vehicle row to prevent concurrent booking race conditions
        const [lockedCar]: any[] = await tx.$queryRaw`
          SELECT id, fleet_count, name, is_available, deleted_at 
          FROM tbl_cars 
          WHERE id = ${booking.car_id} 
          FOR UPDATE
        `;

        if (!lockedCar || lockedCar.deleted_at) {
          throw new Error("Vehicle associated with this booking is no longer available.");
        }

        // 2. Count overlapping bookings during the extension window (currentEndDate to targetDate)
        const overlappingCount = await tx.booking.count({
          where: {
            car_id: booking.car_id,
            id: { not: booking.id },
            deleted_at: null,
            status: { in: ["pending", "confirmed", "active"] },
            AND: [
              { start_date: { lt: targetDate } },
              { end_date: { gt: currentEndDate } },
            ],
          },
        });

        const totalFleet = lockedCar.fleet_count || 1;
        if (overlappingCount >= totalFleet) {
          const err: any = new Error(
            `Vehicle ${lockedCar.name} is reserved for another customer immediately following your current return slot. Extension cannot be accommodated.`
          );
          err.statusCode = 409;
          throw err;
        }

        // 3. Compute extension charges
        const extensionDurationMs = targetDate.getTime() - currentEndDate.getTime();
        const additionalDays = Math.max(1, Math.ceil(extensionDurationMs / (24 * 60 * 60 * 1000)));

        const dailyRate = Number(
          booking.car?.price_per_day || (booking.rental_plan?.price ? Number(booking.rental_plan.price) : 2500)
        );
        const additionalRental = dailyRate * additionalDays;
        const additionalGst = Math.round(additionalRental * 0.18 * 100) / 100;
        const additionalTotal = additionalRental + additionalGst;

        // 4. Update booking
        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: {
            end_date: targetDate,
            total_amount: { increment: additionalTotal },
            updated_at: new Date(),
          },
        });

        // 5. Record booking status history
        await tx.bookingStatusHistory.create({
          data: {
            booking_id: booking.id,
            from_status: booking.status,
            to_status: booking.status,
            changed_by_user_id: adminActor ? adminActor.id : customerId || null,
            changed_by_role: adminActor ? "admin" : "customer",
            reason: `Rental extended to ${formatIstDateTime(targetDate)} (+${additionalDays} day${additionalDays > 1 ? "s" : ""}). Additional fee: ₹${additionalTotal.toLocaleString("en-IN")}${reason ? ` (${reason})` : ""}`,
          },
        });

        // 6. Record audit log if modified by admin
        if (adminActor) {
          await tx.auditLog.create({
            data: {
              actor_id: adminActor.id,
              action: "EXTEND_BOOKING",
              entity: "Booking",
              entity_id: booking.id,
              after_state: {
                previousEndDate: currentEndDate.toISOString(),
                newEndDate: targetDate.toISOString(),
                additionalDays,
                additionalTotal,
                reason: reason || "Admin extension",
              },
            },
          });
        }

        return {
          booking: updatedBooking,
          additionalDays,
          additionalRental,
          additionalGst,
          additionalTotal,
          newEndDate: targetDate,
        };
      },
      { timeout: 15000, maxWait: 10000 }
    );

    return {
      success: true,
      data: result,
      message: `Booking successfully extended to ${formatIstDateTime(result.newEndDate)}. Additional fee: ₹${result.additionalTotal.toLocaleString("en-IN")}.`,
      statusCode: 200,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to extend booking.",
      statusCode: err.statusCode || 500,
    };
  }
}

