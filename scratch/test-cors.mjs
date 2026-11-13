// Test simulated CORS headers against the middleware logic
import { NextRequest } from "next/server";
import { middleware } from "../src/middleware.ts";

async function testCors() {
  console.log("=== Testing CORS Verification ===");

  // 1. Unauthorized origin: https://evil.com
  const evilPreflight = new NextRequest("http://localhost:3000/api/v1/cars", {
    method: "OPTIONS",
    headers: { origin: "https://evil.com" },
  });
  const evilRes = await middleware(evilPreflight);
  console.log("1. evil.com preflight status:", evilRes.status);
  console.log("   evil.com Access-Control-Allow-Origin:", evilRes.headers.get("Access-Control-Allow-Origin"));

  // 2. Legitimate origin: http://localhost:3000
  const validPreflight = new NextRequest("http://localhost:3000/api/v1/cars", {
    method: "OPTIONS",
    headers: { origin: "http://localhost:3000" },
  });
  const validRes = await middleware(validPreflight);
  console.log("2. localhost:3000 preflight status:", validRes.status);
  console.log("   localhost:3000 Access-Control-Allow-Origin:", validRes.headers.get("Access-Control-Allow-Origin"));

  // 3. Legitimate mobile scheme: primerides://
  const mobilePreflight = new NextRequest("http://localhost:3000/api/v1/cars", {
    method: "OPTIONS",
    headers: { origin: "primerides://" },
  });
  const mobileRes = await middleware(mobilePreflight);
  console.log("3. primerides:// mobile preflight status:", mobileRes.status);
  console.log("   primerides:// Access-Control-Allow-Origin:", mobileRes.headers.get("Access-Control-Allow-Origin"));

  if (
    evilRes.status === 403 &&
    !evilRes.headers.get("Access-Control-Allow-Origin") &&
    validRes.status === 204 &&
    validRes.headers.get("Access-Control-Allow-Origin") === "http://localhost:3000" &&
    mobileRes.status === 204 &&
    mobileRes.headers.get("Access-Control-Allow-Origin") === "primerides://"
  ) {
    console.log("\nRESULT: CORS STRICT SECURITY POLICY VERIFIED SUCCESSFULLY!");
  } else {
    console.error("\nRESULT: CORS POLICY FAILED!");
    process.exit(1);
  }
}

testCors();
