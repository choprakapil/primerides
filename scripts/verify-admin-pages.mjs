import crypto from "node:crypto";
import fs from "node:fs";

// Read JWT secret from .env if present
let jwtSecret = "primerides_super_secure_jwt_secret_2026_fallback";
if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf8");
  const match = envContent.match(/JWT_SECRET=["']?([^"'\r\n]+)/);
  if (match) jwtSecret = match[1];
}

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createToken(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + 86400 * 7;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

async function run() {
  console.log("===================================================================");
  console.log("🔍 PRIMERIDES ADMIN PAGES END-TO-END HTTP & RENDER VERIFICATION");
  console.log("===================================================================");

  const token = createToken(
    {
      id: 1,
      username: "admin",
      email: "admin@primerides.in",
      role: "superadmin",
      type: "admin",
    },
    jwtSecret
  );

  const cookieHeader = `primerides_admin_token=${token}`;

  const pagesToTest = [
    {
      url: "http://localhost:3000/admin/cars",
      name: "Fleet Inventory Management",
      checks: [
        "Fleet Inventory",
        "admin-pill-bar",
        "All Hubs",
        "Search model, brand, hub...",
        "Add Vehicle",
        "Security Deposit",
      ],
    },
    {
      url: "http://localhost:3000/admin/bookings",
      name: "Bookings Management",
      checks: [
        "admin-pill-bar",
        "Booking Code",
        "Search code, customer, phone...",
        "Handover",
        "Status",
      ],
    },
    {
      url: "http://localhost:3000/admin/documents",
      name: "KYC Documents Review",
      checks: [
        "KYC Documents",
        "Review customer Driving Licenses",
        "admin-pill-bar",
        "verified",
        "rejected",
      ],
    },
    {
      url: "http://localhost:3000/admin/cms",
      name: "CMS & Content Operations",
      checks: [
        "Active Knowledge FAQs",
        "Travel Journal Articles",
        "Website Sections &amp; Banners",
        "CMS v2",
        "FAQs &amp; Knowledge Base",
      ],
    },
    {
      url: "http://localhost:3000/admin/staff",
      name: "Staff & RBAC Administration",
      checks: [
        "Security &amp; Governance",
        "Active Administrators",
        "Provision Administrator",
        "Superadmin Tier",
        "Argon2id",
      ],
    },
  ];

  let passed = 0;

  for (const page of pagesToTest) {
    const res = await fetch(page.url, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    const body = await res.text();
    console.log(`\nTesting ${page.name} (${page.url}):`);
    console.log(` - HTTP Status: ${res.status}`);

    let allChecksPassed = res.status === 200;
    for (const check of page.checks) {
      const found = body.includes(check);
      console.log(` - Element "${check}": ${found ? "✅ FOUND" : "❌ MISSING"}`);
      if (!found) allChecksPassed = false;
    }

    if (allChecksPassed) {
      console.log(`✅ [PASS] ${page.name} verified successfully.`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${page.name} verification failed.`);
    }
  }

  console.log("\n===================================================================");
  console.log(`RESULTS: ${passed} / ${pagesToTest.length} pages passed complete HTTP render verification`);
  console.log("===================================================================");

  if (passed !== pagesToTest.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
