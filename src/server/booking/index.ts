import { prisma } from "../db/client";
import { notifyBookingConfirmed, notifyBookingCancelled } from "@/server/notifications";

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
 * 5. Run atomic Prisma transaction:
 *    - Create Booking row with location_id and rental_plan_id
 *    - Create immutable PriceSnapshot with plan details, free km, extra km rate, deposit, tax_amount: 0
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

  // 4. Server-Side Price & Discount Calculation
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
    const couponValidation = await validateCoupon(couponCode.trim(), grossAmount);
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

  const netTotalAmount = Math.max(0, grossAmount - discountAmount);

  // 5. Atomic Concurrency Lock & Transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check for Idempotency
      if (idempotencyKey) {
        const existing = await tx.booking.findUnique({
          where: { idempotency_key: idempotencyKey },
          include: { price_snapshot: true, car: true, location: true, rental_plan: true },
        });
        if (existing) return existing;
      }

      // Check for Overlapping Bookings for the Same Vehicle
      const overlapping = await tx.booking.findFirst({
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

      if (overlapping) {
        throw new Error("This vehicle is already reserved for the selected date and time range.");
      }

      const bookingCode = `PR-${start.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

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

      // B. Create Immutable Price Snapshot with Plan Details & Discount
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
          tax_amount: 0.0, // Inclusive for now, real GST deferred to Phase 5
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
            netTotalAmount,
            taxAmount: 0.0,
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
    });

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
    const isConflict = err.message?.includes("already reserved");
    return {
      success: false,
      error: err.message || "Failed to create booking",
      statusCode: isConflict ? 409 : 500,
    };
  }
}

export async function getCustomerBookings(customerId: number) {
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
  });
}

export async function getCustomerPayments(customerId: number) {
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

export async function getCustomerUnpaidBookings(customerId: number) {
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
  };
  discountAmount?: number;
  discountType?: string;
  discountValue?: number;
  netPayableAmount?: number;
}

/**
 * cancelBookingForCustomer
 *
 * Safely cancels a booking on behalf of the customer:
 * - Only allows cancellation of `pending` or `confirmed` bookings.
 * - Active, completed, or already-cancelled bookings cannot be self-cancelled.
 * - Records the status transition in `tbl_booking_status_history`.
 */
export async function cancelBookingForCustomer(
  bookingId: number,
  customerId: number,
  reason?: string
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
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
      deleted_at: true,
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

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    }),
    prisma.bookingStatusHistory.create({
      data: {
        booking_id: bookingId,
        from_status: booking.status,
        to_status: "cancelled",
        changed_by_role: "customer",
        changed_by_user_id: customerId,
        reason: reason?.trim() || "Customer self-cancelled via account portal.",
      },
    }),
  ]);

  // Dispatch cancellation notification asynchronously
  notifyBookingCancelled({
    customerName: booking.full_name || "Valued Customer",
    customerEmail: booking.email || null,
    customerPhone: booking.phone || "",
    bookingCode: booking.booking_code || "PR-CANCELLED",
    carName: booking.car_name || "Vehicle",
  }).catch((e) => console.error("[Notification:BookingCancelled] Failed to dispatch:", e));

  return { success: true };
}

export async function validateCoupon(code: string, bookingAmount: number): Promise<ValidateCouponResult> {
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

  if (coupon.valid_until && now > coupon.valid_until) {
    return { valid: false, error: "This promo coupon has expired." };
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: "This promo coupon has reached its maximum redemption limit." };
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
    },
    discountAmount: discount,
    discountType: coupon.discount_type,
    discountValue: val,
    netPayableAmount: netPayable,
  };
}
