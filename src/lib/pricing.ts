/**
 * PrimeRides Canonical Pricing & Tariff Utilities
 *
 * Mirrors server-side calculation from src/server/booking/index.ts
 * Ensures 100% pricing parity across:
 * 1. Customer Vehicle Detail Booking Card
 * 2. Admin Desk Walk-In Reservation Modal
 * 3. Server Booking Engine & Invoicing
 */

export const CHAUFFEUR_RATE_PER_DAY = 1500;
export const DEFAULT_SECURITY_DEPOSIT = 5000;
export const DEFAULT_GST_RATE_PERCENTAGE = 18;

export interface BookingTariffInput {
  startDate: Date | string;
  endDate: Date | string;
  planPrice: number;
  securityDeposit?: number;
  withChauffeur?: boolean;
  discountAmount?: number;
  gstRatePercentage?: number;
}

export interface BookingTariffEstimate {
  diffHours: number;
  diffDays: number;
  planPrice: number;
  chauffeurFee: number;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  securityDeposit: number;
  netPayableAmount: number;
  grandTotal: number;
}

/**
 * Calculates standardized rental tariff estimate.
 */
export function calculateBookingTariff(input: BookingTariffInput): BookingTariffEstimate {
  const start = typeof input.startDate === "string" ? new Date(input.startDate) : input.startDate;
  const end = typeof input.endDate === "string" ? new Date(input.endDate) : input.endDate;

  const sTime = start.getTime();
  const eTime = end.getTime();

  let diffHours = 24;
  let diffDays = 1;

  if (!isNaN(sTime) && !isNaN(eTime) && eTime > sTime) {
    const diffMs = eTime - sTime;
    diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    diffDays = Math.max(1, Math.ceil(diffHours / 24));
  }

  const planPrice = Number(input.planPrice) || 0;
  const chauffeurFee = input.withChauffeur ? diffDays * CHAUFFEUR_RATE_PER_DAY : 0;
  const grossAmount = planPrice + chauffeurFee;
  const discountAmount = Math.max(0, Number(input.discountAmount) || 0);
  const taxableAmount = Math.max(0, grossAmount - discountAmount);

  const gstRate = typeof input.gstRatePercentage === "number" ? input.gstRatePercentage : DEFAULT_GST_RATE_PERCENTAGE;
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);

  const securityDeposit = typeof input.securityDeposit === "number" ? input.securityDeposit : DEFAULT_SECURITY_DEPOSIT;

  // Rental payable + deposit
  const netPayableAmount = taxableAmount + gstAmount;
  const grandTotal = netPayableAmount + securityDeposit;

  return {
    diffHours,
    diffDays,
    planPrice,
    chauffeurFee,
    grossAmount,
    discountAmount,
    taxableAmount,
    gstAmount,
    securityDeposit,
    netPayableAmount,
    grandTotal,
  };
}

/**
 * Formats a number to Indian Rupee standard: e.g. ₹3,999
 */
export function formatInr(amount: number | string | null | undefined): string {
  const val = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(val)) return "₹0";
  return `₹${val.toLocaleString("en-IN")}`;
}

