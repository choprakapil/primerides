import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { formatIstDateTime, formatIstDate, getIstMonthAndYear, IST_TIMEZONE } from "@/lib/dates";
import { getFinancialYearCode } from "@/server/invoicing/sequence";

describe("Risk #8 Audit: Midnight Pickup Shift by -1 Day on UTC Server", () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    // Explicitly enforce UTC server environment for this test suite
    process.env.TZ = "UTC";
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("Test 1: Midnight IST pickup (00:00 IST) is NOT shifted backwards to previous day in UTC", () => {
    // 2026-10-11 00:00:00 IST in UTC is 2026-10-10 18:30:00Z (-5h 30m)
    const midnightIst = new Date("2026-10-10T18:30:00.000Z");

    const formatted = formatIstDateTime(midnightIst);
    console.log("Midnight IST DateTime Output:", formatted);

    // Must be 11 Oct 2026, 12:00 am — NOT 10 Oct 2026, 06:30 pm!
    expect(formatted).toContain("11 Oct 2026");
    expect(formatted.toLowerCase()).toMatch(/12:00\s*(am|a\.m\.)/);
    expect(formatted).not.toContain("10 Oct 2026");
    expect(formatted).not.toContain("06:30 pm");
  });

  it("Test 2: Late night IST pickup (00:30 IST) formats correctly as 12:30 am on the correct day", () => {
    // 2026-10-11 00:30:00 IST in UTC is 2026-10-10 19:00:00Z
    const lateNightIst = new Date("2026-10-10T19:00:00.000Z");

    const formatted = formatIstDateTime(lateNightIst);
    console.log("00:30 IST DateTime Output:", formatted);

    expect(formatted).toContain("11 Oct 2026");
    expect(formatted.toLowerCase()).toMatch(/12:30\s*(am|a\.m\.)/);
    expect(formatted).not.toContain("10 Oct 2026");
    expect(formatted).not.toContain("07:00 pm");
  });

  it("Test 3: Date-only formatter formatIstDate stays on the correct IST calendar day", () => {
    // 2026-12-25 00:15:00 IST = 2026-12-24 18:45:00Z
    const christmasMorningIst = new Date("2026-12-24T18:45:00.000Z");

    const dateOnly = formatIstDate(christmasMorningIst);
    console.log("IST Date Only Output:", dateOnly);

    // Must be 25 Dec 2026, NOT 24 Dec 2026
    expect(dateOnly).toContain("25");
    expect(dateOnly).toContain("Dec");
    expect(dateOnly).toContain("2026");
    expect(dateOnly).not.toContain("24");
  });

  it("Test 4: Financial Year code calculation at midnight April 1 boundary on UTC server", () => {
    // In India, April 1 01:00:00 AM IST is FY 2027-28 (code: "2728").
    // In UTC, this is March 31 19:30:00 PM (which would mistakenly be "2627" without timezone pinning).
    const newFyMidnightIst = new Date("2027-03-31T19:30:00.000Z");

    const istMonthYear = getIstMonthAndYear(newFyMidnightIst);
    expect(istMonthYear.month).toBe(4); // April in IST!
    expect(istMonthYear.year).toBe(2027);

    const fyCode = getFinancialYearCode(newFyMidnightIst);
    console.log("April 1 boundary FY Code on UTC server:", fyCode);

    expect(fyCode).toBe("2728"); // FY 2027-28, NOT FY 2026-27!
  });

  it("Test 5: SMS body simulation includes correct pickup schedule in IST", () => {
    const pickupUtc = new Date("2026-11-14T19:00:00.000Z"); // 2026-11-15 00:30:00 IST
    const startFormatted = formatIstDateTime(pickupUtc);

    const smsBody =
      `Hi Rahul Sharma, your PrimeRides booking for BMW 5 Series is confirmed! ` +
      `Code: PR/2627/000099. Pickup: ${startFormatted}.`;

    console.log("Simulated SMS Body:", smsBody);

    expect(smsBody).toContain("15 Nov 2026");
    expect(smsBody.toLowerCase()).toMatch(/12:30\s*(am|a\.m\.)/);
    expect(smsBody).not.toContain("14 Nov 2026");
    expect(smsBody).not.toContain("07:00 pm");
  });
});
