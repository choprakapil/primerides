import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { createRefreshTokenSession } from "@/server/auth/tokens";
import { GET as meHandler } from "@/app/api/v1/auth/me/route";
import { POST as refreshHandler } from "@/app/api/v1/auth/refresh/route";
import { clearRateLimitStore } from "@/lib/rateLimit";

describe("Mobile Cold-Start Silent Refresh Workflow (PROJECT_CHECKLIST Line 101)", () => {
  let testCustomer: any;

  beforeEach(async () => {
    clearRateLimitStore();

    // Ensure a test customer exists
    testCustomer = await prisma.customerUser.findFirst({
      where: { phone: "9876543210" },
    });

    if (!testCustomer) {
      testCustomer = await prisma.customerUser.create({
        data: {
          phone: "9876543210",
          full_name: "Cold Start Test User",
          email: "coldstart@test.com",
        },
      });
    }
  });

  it("completes full cold-start silent token refresh exchange and authenticates user", async () => {
    // 1. Setup: Create a persistent session with a refresh token (as stored in SecureStore on mobile device)
    const sessionData = await createRefreshTokenSession({
      userId: testCustomer.id,
      userType: "customer",
    });
    const storedRefreshToken = sessionData.refreshToken;

    // 2. Step 1 of Cold Start: App launches with empty in-memory access token
    // Profile request with no Authorization header must return 401
    const coldStartReq = new NextRequest("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
    });
    const coldStartRes = await meHandler(coldStartReq);
    expect(coldStartRes.status).toBe(401);

    // 3. Step 2 of Cold Start: Client intercepts 401 and calls /api/v1/auth/refresh with storedRefreshToken
    const refreshReq = new NextRequest("http://localhost:3000/api/v1/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });
    const refreshRes = await refreshHandler(refreshReq);
    expect(refreshRes.status).toBe(200);

    const refreshJson = await refreshRes.json();
    expect(refreshJson.success).toBe(true);
    expect(refreshJson.data.accessToken).toBeDefined();
    expect(refreshJson.data.newRefreshToken).toBeDefined();

    const newAccessToken = refreshJson.data.accessToken;
    const newRefreshToken = refreshJson.data.newRefreshToken;

    // 4. Step 3 of Cold Start: Client retries /api/v1/auth/me with newly issued access token
    const retryReq = new NextRequest("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: {
        authorization: `Bearer ${newAccessToken}`,
      },
    });
    const retryRes = await meHandler(retryReq);
    expect(retryRes.status).toBe(200);

    const profileJson = await retryRes.json();
    expect(profileJson.success).toBe(true);
    expect(profileJson.data.customer.id).toBe(testCustomer.id);
    expect(profileJson.data.customer.fullName).toBe(testCustomer.full_name);

    // 5. Security Guard: Old refresh token must be rotated/invalidated (replay attack prevention)
    const replayReq = new NextRequest("http://localhost:3000/api/v1/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });
    const replayRes = await refreshHandler(replayReq);
    expect(replayRes.status).toBe(401);

    // 6. Verification: New rotated refresh token continues to be valid for next session
    const nextRefreshReq = new NextRequest("http://localhost:3000/api/v1/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: newRefreshToken }),
    });
    const nextRefreshRes = await refreshHandler(nextRefreshReq);
    expect(nextRefreshRes.status).toBe(200);
  });

  it("handles revoked or invalid refresh token by rejecting refresh without infinite loops", async () => {
    // Attempting refresh with non-existent token
    const invalidReq = new NextRequest("http://localhost:3000/api/v1/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: "deadbeef000000000000000000000000" }),
    });
    const invalidRes = await refreshHandler(invalidReq);
    expect(invalidRes.status).toBe(401);

    const invalidJson = await invalidRes.json();
    expect(invalidJson.success).toBe(false);
    expect(invalidJson.error).toContain("Invalid, expired, or revoked refresh token");
  });
});
