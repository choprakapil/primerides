/**
 * PrimeRides Canonical Date & Timezone Utilities
 *
 * All PrimeRides operations (Delhi NCR, Lucknow, Uttar Pradesh) operate strictly in
 * Indian Standard Time (Asia/Kolkata, UTC+05:30).
 *
 * Pinned timezone prevents:
 * 1. UTC server date-shift: 00:30 IST being shifted backwards to 19:00 previous day on AWS/Vercel/Docker.
 * 2. Client browser timezone divergence: International tourists or NRIs in UK/US/UAE seeing the wrong day.
 */

export const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Formats a Date or ISO string into IST datetime: e.g. "10 Oct 2026, 12:00 am"
 */
export function formatIstDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a Date or ISO string into IST date: e.g. "10 Oct 2026"
 */
export function formatIstDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: options?.day ?? "numeric",
    month: options?.month ?? "short",
    year: options?.year ?? "numeric",
    ...options,
  });
}

/**
 * Returns the 1-indexed month (1-12) and year in Indian Standard Time.
 */
export function getIstMonthAndYear(date: Date | string = new Date()): { month: number; year: number } {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(d);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  return { month, year };
}
