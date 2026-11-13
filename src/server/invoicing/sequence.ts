import { PrismaClient } from "@prisma/client";

/**
 * Sequential Invoice Number Generator
 *
 * Generates strictly sequential booking/invoice codes that comply with
 * Indian GST sequential invoice series rules (Rule 46 of CGST Rules, 2017).
 *
 * Format: PR/FYFY/NNNNNN
 *   - PR      = PrimeRides prefix
 *   - FYFY    = Financial year code (e.g. "2627" for Apr 2026 - Mar 2027)
 *   - NNNNNN  = 6-digit zero-padded sequential number (resets each financial year)
 *
 * Examples: PR/2627/000001, PR/2627/000002, ..., PR/2627/999999
 *
 * Concurrency Safety:
 *   Uses MySQL `FOR UPDATE` row-level lock on the sequence counter to guarantee
 *   that concurrent transactions receive unique, strictly monotonic numbers.
 *   This is called INSIDE the booking transaction, sharing the same lock scope.
 */

/**
 * Returns the Indian financial year code for a given date.
 * Indian FY runs April 1 to March 31.
 *
 * @param date - The date to determine the financial year for
 * @returns String like "2627" (FY 2026-27) or "2526" (FY 2025-26)
 */
import { getIstMonthAndYear } from "@/lib/dates";

export function getFinancialYearCode(date: Date = new Date()): string {
  // Always evaluate month and year strictly in Indian Standard Time (Asia/Kolkata)
  // to prevent UTC servers from miscalculating the FY near the midnight April 1 boundary.
  const { month, year } = getIstMonthAndYear(date);

  // If Jan-Mar (month 1..3), the FY started in the previous calendar year
  const fyStartYear = month <= 3 ? year - 1 : year;
  const fyEndYear = fyStartYear + 1;

  // Return last 2 digits of each year: "2627" for FY 2026-27
  const startSuffix = String(fyStartYear).slice(-2);
  const endSuffix = String(fyEndYear).slice(-2);

  return `${startSuffix}${endSuffix}`;
}

/**
 * Returns the full series prefix for the current financial year.
 * e.g. "PR/2627" for FY 2026-27
 */
export function getSeriesPrefix(date: Date = new Date()): string {
  return `PR/${getFinancialYearCode(date)}`;
}

/**
 * Generates the next sequential booking code within a Prisma transaction.
 *
 * MUST be called inside an existing `prisma.$transaction()` to ensure the
 * FOR UPDATE lock is held until the transaction commits, preventing gaps
 * or duplicates under concurrent requests.
 *
 * @param tx - Prisma transaction client (from `prisma.$transaction(async (tx) => ...)`)
 * @param date - Optional date to determine financial year (default: now)
 * @returns Sequential booking code like "PR/2627/000001"
 */
export async function generateSequentialBookingCode(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  date: Date = new Date()
): Promise<string> {
  const prefix = getSeriesPrefix(date);

  // 1. Acquire exclusive lock on the sequence row (or create if first booking of FY)
  const rows = await (tx as any).$queryRaw`
    SELECT id, last_number
    FROM tbl_invoice_sequences
    WHERE series_prefix = ${prefix}
    FOR UPDATE
  `;

  let nextNumber: number;

  if (Array.isArray(rows) && rows.length > 0) {
    // Increment the existing counter
    nextNumber = rows[0].last_number + 1;
    await (tx as any).$executeRaw`
      UPDATE tbl_invoice_sequences
      SET last_number = ${nextNumber}, updated_at = NOW()
      WHERE series_prefix = ${prefix}
    `;
  } else {
    // First booking of this financial year — create the sequence row
    nextNumber = 1;
    await (tx as any).$executeRaw`
      INSERT INTO tbl_invoice_sequences (series_prefix, last_number, updated_at)
      VALUES (${prefix}, ${nextNumber}, NOW())
    `;
  }

  // 2. Format as zero-padded 6-digit number
  const paddedNumber = String(nextNumber).padStart(6, "0");

  return `${prefix}/${paddedNumber}`;
}
