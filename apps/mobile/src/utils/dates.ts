/**
 * PrimeRides Mobile: Canonical Date & Timezone Utilities
 *
 * All PrimeRides physical hubs (Delhi NCR Terminal 3, Lucknow Charbagh, Uttar Pradesh)
 * operate strictly in Indian Standard Time (Asia/Kolkata, UTC+05:30).
 *
 * When international travelers, tourists, or NRIs book or view reservations from
 * different device timezones (e.g. US EDT/PDT, London BST, Dubai GST, Singapore SGT),
 * using unpinned device `toLocaleDateString()` shifts midnight (00:00 - 05:29 IST)
 * pickups backwards to the PREVIOUS day in local device time.
 *
 * This utility pins all customer-facing mobile date rendering strictly to Asia/Kolkata.
 */

export const IST_TIMEZONE = "Asia/Kolkata";
export const IST_OFFSET_MINUTES = 330; // UTC+05:30

/**
 * Safely parses any input into a valid Date object, or null if invalid.
 */
export function parseDate(date: Date | string | number | null | undefined): Date | null {
  if (date === null || date === undefined || date === "") return null;
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date pinned strictly to Indian Standard Time (Asia/Kolkata).
 *
 * Example outputs:
 * - "15 Oct" (default { month: "short", day: "numeric" })
 * - "15 Oct 2026" ({ day: "numeric", month: "short", year: "numeric" })
 */
export function formatIstDate(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDate(date);
  if (!d) return "";

  try {
    return d.toLocaleDateString("en-IN", {
      timeZone: IST_TIMEZONE,
      month: options?.month ?? "short",
      day: options?.day ?? "numeric",
      ...options,
    });
  } catch {
    // Robust mathematical fallback for environments with missing IANA timezone database:
    // Shift epoch milliseconds by (+330 min - local device offset)
    const shifted = new Date(d.getTime() + (IST_OFFSET_MINUTES + d.getTimezoneOffset()) * 60000);
    return shifted.toLocaleDateString("en-IN", {
      month: options?.month ?? "short",
      day: options?.day ?? "numeric",
      ...options,
    });
  }
}

/**
 * Formats a date and time pinned to Indian Standard Time (e.g. "15 Oct 2026, 12:30 pm").
 */
export function formatIstDateTime(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDate(date);
  if (!d) return "";

  try {
    return d.toLocaleString("en-IN", {
      timeZone: IST_TIMEZONE,
      day: options?.day ?? "numeric",
      month: options?.month ?? "short",
      year: options?.year ?? "numeric",
      hour: options?.hour ?? "2-digit",
      minute: options?.minute ?? "2-digit",
      hour12: options?.hour12 ?? true,
      ...options,
    });
  } catch {
    const shifted = new Date(d.getTime() + (IST_OFFSET_MINUTES + d.getTimezoneOffset()) * 60000);
    return shifted.toLocaleString("en-IN", {
      day: options?.day ?? "numeric",
      month: options?.month ?? "short",
      year: options?.year ?? "numeric",
      hour: options?.hour ?? "2-digit",
      minute: options?.minute ?? "2-digit",
      hour12: options?.hour12 ?? true,
      ...options,
    });
  }
}

/**
 * Formats time only pinned to Indian Standard Time (e.g. "12:30 pm").
 */
export function formatIstTime(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDate(date);
  if (!d) return "";

  try {
    return d.toLocaleTimeString("en-IN", {
      timeZone: IST_TIMEZONE,
      hour: options?.hour ?? "2-digit",
      minute: options?.minute ?? "2-digit",
      hour12: options?.hour12 ?? true,
      ...options,
    });
  } catch {
    const shifted = new Date(d.getTime() + (IST_OFFSET_MINUTES + d.getTimezoneOffset()) * 60000);
    return shifted.toLocaleTimeString("en-IN", {
      hour: options?.hour ?? "2-digit",
      minute: options?.minute ?? "2-digit",
      hour12: options?.hour12 ?? true,
      ...options,
    });
  }
}

/**
 * Formats a booking itinerary range pinned to Indian Standard Time (e.g. "15 Oct – 17 Oct").
 */
export function toIstDateRangeString(
  startDate: Date | string | number | null | undefined,
  endDate: Date | string | number | null | undefined
): string {
  const start = formatIstDate(startDate, { month: "short", day: "numeric" });
  const end = formatIstDate(endDate, { month: "short", day: "numeric" });
  if (!start && !end) return "";
  if (!end) return start;
  if (!start) return end;
  return `${start} – ${end}`;
}

/**
 * Returns integer date parts (year, month, day, hours, minutes) in IST timezone.
 */
export function getIstDateParts(date: Date | string | number = new Date()): {
  year: number;
  month: number; // 1-12
  day: number;
  hours: number;
  minutes: number;
} {
  const d = parseDate(date) || new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  return {
    year: Number(partMap.year) || d.getFullYear(),
    month: Number(partMap.month) || d.getMonth() + 1,
    day: Number(partMap.day) || d.getDate(),
    hours: Number(partMap.hour) || d.getHours(),
    minutes: Number(partMap.minute) || d.getMinutes(),
  };
}
