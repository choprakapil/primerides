import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createAccessToken, verifyAccessToken, getJwtSecret } from "@/server/auth/jwt";

describe("Auth Module — JWT & Security", () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "test_super_secure_jwt_secret_key_2026_test_suite_minimum_length";
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  it("should generate a valid HS256 JWT access token and verify its payload", async () => {
    const payload = {
      id: 42,
      email: "test.customer@primerides.in",
      name: "Rohan Sharma",
      type: "customer" as const,
    };

    const token = await createAccessToken(payload, 3600);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const verified = await verifyAccessToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(42);
    expect(verified?.email).toBe("test.customer@primerides.in");
    expect(verified?.name).toBe("Rohan Sharma");
    expect(verified?.type).toBe("customer");
  });

  it("should reject tampered or modified JWT tokens", async () => {
    const payload = {
      id: 99,
      email: "admin@primerides.in",
      type: "admin" as const,
    };

    const token = await createAccessToken(payload, 3600);
    const parts = token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ ...payload, id: 1, role: "super_admin" }))
      .toString("base64")
      .replace(/=/g, "");
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const verified = await verifyAccessToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it("should reject expired tokens", async () => {
    const payload = {
      id: 10,
      email: "expired@primerides.in",
      type: "customer" as const,
    };

    const expiredToken = await createAccessToken(payload, -100);
    const verified = await verifyAccessToken(expiredToken);
    expect(verified).toBeNull();
  });

  it("should throw fatal startup error when JWT_SECRET is empty", () => {
    process.env.JWT_SECRET = "";
    expect(() => getJwtSecret()).toThrowError(/FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined/);
  });
});
