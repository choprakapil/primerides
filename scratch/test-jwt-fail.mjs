// Test script to verify the application refuses to start/operate when JWT_SECRET is unset
async function testJwtValidation() {
  console.log("--> Testing with JWT_SECRET set:");
  process.env.JWT_SECRET = "valid_production_secret_key_12345";
  const { getJwtSecret } = await import("../src/server/auth/jwt.ts");
  console.log("Success: retrieved secret length:", getJwtSecret().length);

  console.log("\n--> Testing with JWT_SECRET unset (empty string):");
  delete process.env.JWT_SECRET;
  try {
    getJwtSecret();
    console.error("FAIL: Did not throw error when JWT_SECRET was missing!");
    process.exit(1);
  } catch (err) {
    console.log("PASSED: Caught expected fatal error:");
    console.log(err.message);
  }
}

testJwtValidation();
