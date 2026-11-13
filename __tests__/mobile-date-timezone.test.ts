import { describe, it, expect } from "vitest";
import {
  formatIstDate,
  formatIstDateTime,
  formatIstTime,
  toIstDateRangeString,
  getIstDateParts,
  IST_TIMEZONE,
  parseDate,
} from "../apps/mobile/src/utils/dates";

describe("Risk #17 Audit: Mobile App Shifts Booking Dates on Non-IST Devices", () => {
  // Midnight pickup on 15 Oct 2026 in IST (+05:30)
  // In UTC, this corresponds to 14 Oct 2026 18:30:00.000Z
  const midnightPickupUtc = "2026-10-14T18:30:00.000Z";
  // 00:30 AM IST on 15 Oct 2026
  const earlyMorningPickupUtc = "2026-10-14T19:00:00.000Z";
  // Daytime return at 6:00 PM IST on 18 Oct 2026 (12:30 UTC)
  const returnUtc = "2026-10-18T12:30:00.000Z";

  it("Test 1: Midnight IST pickup (00:00 IST) is NOT shifted backwards to 14 Oct on non-IST timezones", () => {
    // Unpinned standard Date methods in non-IST timezones would show Oct 14
    const d = new Date(midnightPickupUtc);
    
    // In UTC, the date component is 14
    expect(d.getUTCDate()).toBe(14);

    // But formatIstDate MUST pin to Indian Standard Time (Asia/Kolkata)
    const formatted = formatIstDate(midnightPickupUtc, { day: "numeric", month: "short" });
    expect(formatted).toContain("15");
    expect(formatted).toContain("Oct");

    const fullFormatted = formatIstDate(midnightPickupUtc, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    expect(fullFormatted).toContain("15");
    expect(fullFormatted).toContain("Oct");
    expect(fullFormatted).toContain("2026");
  });

  it("Test 2: Early morning pickup (00:30 IST) correctly formats as 12:30 am on 15 Oct in IST", () => {
    const formattedDateTime = formatIstDateTime(earlyMorningPickupUtc);
    
    // Day must be 15, month Oct, year 2026
    expect(formattedDateTime).toContain("15");
    expect(formattedDateTime).toContain("Oct");
    expect(formattedDateTime).toContain("2026");

    // Time must be 12:30 am IST
    const formattedTime = formatIstTime(earlyMorningPickupUtc);
    expect(formattedTime.toLowerCase()).toContain("12:30");
    expect(formattedTime.toLowerCase()).toContain("am");
  });

  it("Test 3: Date range formatting toIstDateRangeString displays true IST itinerary", () => {
    const range = toIstDateRangeString(midnightPickupUtc, returnUtc);
    
    // Range must start on 15 Oct (not 14 Oct) and end on 18 Oct
    expect(range).toContain("15");
    expect(range).toContain("18");
    expect(range).toContain("Oct");
  });

  it("Test 4: getIstDateParts returns exact calendar parts in IST timezone", () => {
    // 2026-10-14T18:30:00.000Z is 2026-10-15 00:00:00 IST
    const parts = getIstDateParts(midnightPickupUtc);
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(10);
    expect(parts.day).toBe(15);
    expect(parts.hours).toBe(0);
    expect(parts.minutes).toBe(0);

    // Early morning 00:30 IST
    const earlyParts = getIstDateParts(earlyMorningPickupUtc);
    expect(earlyParts.day).toBe(15);
    expect(earlyParts.hours).toBe(0);
    expect(earlyParts.minutes).toBe(30);
  });

  it("Test 5: Edge cases and invalid inputs handle gracefully without crashing", () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate("")).toBeNull();
    expect(parseDate("invalid-date-string")).toBeNull();

    expect(formatIstDate(null)).toBe("");
    expect(formatIstDate(undefined)).toBe("");
    expect(formatIstDate("")).toBe("");
    expect(formatIstDate("not-a-date")).toBe("");

    expect(formatIstDateTime(null)).toBe("");
    expect(formatIstTime(null)).toBe("");
    expect(toIstDateRangeString(null, null)).toBe("");
    expect(toIstDateRangeString(midnightPickupUtc, null)).toContain("15");
  });

  it("Test 6: Verified across multiple global timezones via Intl options", () => {
    // Verify that foreign timezone formatters give different results than IST, proving vulnerability exists
    const nyFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      day: "numeric",
      month: "short",
    });
    const nyDate = nyFormatter.format(new Date(midnightPickupUtc));
    // In NY (EDT UTC-4), 18:30 UTC is 14:30 on Oct 14
    expect(nyDate).toContain("14");

    const londonFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      day: "numeric",
      month: "short",
    });
    const londonDate = londonFormatter.format(new Date(midnightPickupUtc));
    // In London (BST UTC+1), 18:30 UTC is 19:30 on Oct 14
    expect(londonDate).toContain("14");

    // But formatIstDate ALWAYS evaluates to 15 Oct in IST!
    const istDate = formatIstDate(midnightPickupUtc, { day: "numeric", month: "short" });
    expect(istDate).toContain("15");
  });
});
