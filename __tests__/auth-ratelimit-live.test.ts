import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as loginHandler } from "@/app/api/v1/auth/login/route";
import { POST as registerHandler } from "@/app/api/v1/auth/register/route";
import { POST as refreshHandler } from "@/app/api/v1/auth/refresh/route";
import { clearRateLimitStore } from "@/lib/rateLimit";

describe("Auth Endpoints Rate Limiting Verification (PROJECT_CHECKLIST Line 84)", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("returns HTTP 429 after 5 rapid login attempts from the same IP", async () => {
    const testIp = "203.0.113.42";

    // 1-5: Requests within limit should execute authentication logic
    for (let i = 1; i <= 5; i++) {
      const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({ identifier: "attacker@test.com", password: "wrong-password" }),
      });

      const res = await loginHandler(req);
      // Handled by login logic (e.g. 401 invalid credentials)
      expect(res.status).not.toBe(429);
      expect([400, 401]).toContain(res.status);
    }

    // 6th request: Exceeds maxRequests (5) -> must return HTTP 429
    const req6 = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({ identifier: "attacker@test.com", password: "wrong-password" }),
    });

    const res6 = await loginHandler(req6);
    expect(res6.status).toBe(429);

    const data = await res6.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Too many authentication attempts");
    expect(data.retryAfter).toBeGreaterThan(0);

    // Verify rate limit response headers
    expect(res6.headers.get("Retry-After")).toBeDefined();
    expect(res6.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(res6.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res6.headers.get("X-RateLimit-Reset")).toBeDefined();
  });

  it("isolates rate limiting by client IP address", async () => {
    const blockedIp = "198.51.100.1";
    const cleanIp = "198.51.100.2";

    // Exhaust limits for blockedIp
    for (let i = 1; i <= 5; i++) {
      const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "x-forwarded-for": blockedIp },
        body: JSON.stringify({ identifier: "user@test.com", password: "pwd" }),
      });
      await loginHandler(req);
    }

    // blockedIp is now rate limited
    const blockedReq = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "x-forwarded-for": blockedIp },
      body: JSON.stringify({ identifier: "user@test.com", password: "pwd" }),
    });
    const blockedRes = await loginHandler(blockedReq);
    expect(blockedRes.status).toBe(429);

    // cleanIp must NOT be rate limited
    const cleanReq = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "x-forwarded-for": cleanIp },
      body: JSON.stringify({ identifier: "clean@test.com", password: "pwd" }),
    });
    const cleanRes = await loginHandler(cleanReq);
    expect(cleanRes.status).not.toBe(429);
  });

  it("enforces rate limiting on customer registration endpoint", async () => {
    const testIp = "192.0.2.100";

    for (let i = 1; i <= 5; i++) {
      const req = new NextRequest("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: { "x-forwarded-for": testIp },
        body: JSON.stringify({}),
      });
      const res = await registerHandler(req);
      expect(res.status).not.toBe(429);
    }

    // 6th registration attempt
    const req6 = new NextRequest("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: { "x-forwarded-for": testIp },
      body: JSON.stringify({}),
    });
    const res6 = await registerHandler(req6);
    expect(res6.status).toBe(429);
  });

  it("enforces rate limiting on token refresh endpoint", async () => {
    const testIp = "192.0.2.200";

    for (let i = 1; i <= 5; i++) {
      const req = new NextRequest("http://localhost:3000/api/v1/auth/refresh", {
        method: "POST",
        headers: { "x-forwarded-for": testIp },
        body: JSON.stringify({}),
      });
      const res = await refreshHandler(req);
      expect(res.status).not.toBe(429);
    }

    // 6th refresh attempt
    const req6 = new NextRequest("http://localhost:3000/api/v1/auth/refresh", {
      method: "POST",
      headers: { "x-forwarded-for": testIp },
      body: JSON.stringify({}),
    });
    const res6 = await refreshHandler(req6);
    expect(res6.status).toBe(429);
  });
});
