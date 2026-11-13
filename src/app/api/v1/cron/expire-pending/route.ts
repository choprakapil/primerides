import { NextRequest, NextResponse } from "next/server";
import { expireStalePendingBookings } from "@/server/booking/cleanup";

/**
 * POST /api/v1/cron/expire-pending
 *
 * Cron-triggered endpoint to expire stale pending bookings.
 * Secured by a shared CRON_SECRET header to prevent unauthorized invocation.
 *
 * Designed to be called every 5 minutes via:
 *  - Vercel Cron Jobs (vercel.json)
 *  - External cron service (e.g. cron-job.org, AWS EventBridge)
 *  - Kubernetes CronJob
 *
 * Request Headers:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Query Parameters:
 *   ttl: (optional) Override TTL in minutes (default: 30)
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate cron request
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing CRON_SECRET." },
      { status: 401 }
    );
  }

  try {
    // 2. Parse optional TTL override
    const { searchParams } = new URL(request.url);
    const ttlParam = searchParams.get("ttl");
    const ttlMinutes = ttlParam ? Math.max(5, Math.min(1440, parseInt(ttlParam, 10) || 30)) : 30;

    // 3. Execute cleanup
    const result = await expireStalePendingBookings(ttlMinutes);

    return NextResponse.json({
      success: true,
      message: `Expired ${result.expiredCount} stale pending booking(s).`,
      expiredCount: result.expiredCount,
      expiredBookingCodes: result.expiredBookingCodes,
      ttlMinutes,
      executedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Cron:ExpirePending] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal cleanup error." },
      { status: 500 }
    );
  }
}

// Also support GET for simple external cron services that only support GET
export async function GET(request: NextRequest) {
  return POST(request);
}
