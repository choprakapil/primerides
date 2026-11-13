/**
 * GST Calculation Engine for PrimeRides Car Rental Services
 *
 * Implements Indian Goods & Services Tax (GST) rules for:
 *  - SAC Code: 996601 (Renting/leasing services involving motor vehicles with or without operators)
 *  - Standard GST Rate: 18% (9% CGST + 9% SGST for intra-state, or 18% IGST for inter-state)
 *  - Security deposits are NOT taxable (refundable advance, excluded from taxable value)
 *
 * Reference: GST Council Notification No. 11/2017 (Central Tax Rate), Schedule III
 */

/** SAC Code for motor vehicle rental services */
export const SAC_CODE = "996601";

/** Standard GST rate for car rental services */
export const GST_RATE_PERCENT = 18;

/** CGST rate (half of GST for intra-state supply) */
export const CGST_RATE_PERCENT = 9;

/** SGST rate (half of GST for intra-state supply) */
export const SGST_RATE_PERCENT = 9;

/** IGST rate (for inter-state supply — equal to full GST) */
export const IGST_RATE_PERCENT = 18;

export interface GstBreakdown {
  /** The base taxable amount (rental + chauffeur - discount, EXCLUDING security deposit) */
  taxableAmount: number;
  /** Total GST amount (CGST + SGST, or IGST) */
  totalGst: number;
  /** CGST component (intra-state) */
  cgstAmount: number;
  /** SGST component (intra-state) */
  sgstAmount: number;
  /** IGST component (inter-state, 0 for intra-state) */
  igstAmount: number;
  /** CGST rate applied */
  cgstRate: number;
  /** SGST rate applied */
  sgstRate: number;
  /** IGST rate applied */
  igstRate: number;
  /** SAC code used */
  sacCode: string;
  /** Whether this is an inter-state supply */
  isInterState: boolean;
  /** Grand total = taxableAmount + totalGst + securityDeposit */
  grandTotal: number;
  /** Security deposit (not taxable, shown separately) */
  securityDeposit: number;
}

export interface GstCalculationInput {
  /** Base rental plan price (per-package or monthly) */
  rentalAmount: number;
  /** Chauffeur fee if applicable */
  chauffeurFee: number;
  /** Discount from coupons/promotions */
  discountAmount: number;
  /** Refundable security deposit (NOT taxable) */
  securityDeposit: number;
  /** Whether supply is inter-state (IGST) vs intra-state (CGST+SGST). Default: intra-state */
  isInterState?: boolean;
  /** Override GST rate (for future-proofing if admin configures different rate). Default: 18 */
  gstRateOverride?: number;
}

/**
 * Calculates GST breakdown for a car rental booking.
 *
 * Indian GST rules for car rental (SAC 996601):
 * - Taxable value = rental amount + chauffeur fee - discount
 * - Security deposit is EXCLUDED from taxable value (it's a refundable advance)
 * - Intra-state: CGST (9%) + SGST (9%) = 18%
 * - Inter-state: IGST (18%)
 * - All amounts rounded to nearest paisa (2 decimal places)
 *
 * @param input - The rental amounts to calculate GST on
 * @returns Full GST breakdown with CGST/SGST/IGST split
 */
export function calculateGst(input: GstCalculationInput): GstBreakdown {
  const {
    rentalAmount,
    chauffeurFee,
    discountAmount,
    securityDeposit,
    isInterState = false,
    gstRateOverride,
  } = input;

  // Taxable value: rental + chauffeur - discount (security deposit is NOT taxable)
  const taxableAmount = Math.max(0, rentalAmount + chauffeurFee - discountAmount);

  const effectiveGstRate = gstRateOverride ?? GST_RATE_PERCENT;

  // Calculate total GST
  const totalGst = roundToTwoDecimals((taxableAmount * effectiveGstRate) / 100);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;

  if (isInterState) {
    // Inter-state: full rate as IGST
    igstAmount = totalGst;
    igstRate = effectiveGstRate;
  } else {
    // Intra-state: split equally into CGST and SGST
    const halfRate = effectiveGstRate / 2;
    cgstRate = halfRate;
    sgstRate = halfRate;
    cgstAmount = roundToTwoDecimals((taxableAmount * halfRate) / 100);
    sgstAmount = roundToTwoDecimals((taxableAmount * halfRate) / 100);

    // Ensure CGST + SGST = totalGst (handle rounding discrepancy)
    const roundingDiff = roundToTwoDecimals(totalGst - cgstAmount - sgstAmount);
    if (roundingDiff !== 0) {
      sgstAmount = roundToTwoDecimals(sgstAmount + roundingDiff);
    }
  }

  // Grand total = taxable + GST + security deposit
  const grandTotal = roundToTwoDecimals(taxableAmount + totalGst + securityDeposit);

  return {
    taxableAmount,
    totalGst,
    cgstAmount,
    sgstAmount,
    igstAmount,
    cgstRate,
    sgstRate,
    igstRate,
    sacCode: SAC_CODE,
    isInterState,
    grandTotal,
    securityDeposit,
  };
}

/**
 * Round a number to 2 decimal places (nearest paisa).
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
