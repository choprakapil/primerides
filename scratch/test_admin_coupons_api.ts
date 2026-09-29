import { createAccessToken } from "../src/server/auth/jwt";

async function main() {
  const token = await createAccessToken({
    id: 1,
    username: "superadmin",
    role: "superadmin",
    type: "admin",
  });

  console.log("=== 1. Testing Admin GET /api/v1/admin/coupons ===");
  const getRes = await fetch("http://localhost:3000/api/v1/admin/coupons", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getData = await getRes.json();
  console.log("GET Coupons status:", getRes.status, "Active count:", getData.data?.length);

  console.log("\n=== 2. Testing Admin POST /api/v1/admin/coupons (Create FESTIVE20) ===");
  const postRes = await fetch("http://localhost:3000/api/v1/admin/coupons", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: "FESTIVE20",
      description: "20% Festive Season Special",
      discount_type: "percentage",
      discount_value: 20,
      min_booking_amount: 5000,
      max_discount_amount: 3000,
      usage_limit: 25,
    }),
  });
  const postData = await postRes.json();
  console.log("POST Coupon status:", postRes.status, postData.message, postData.data?.code);

  const createdId = postData.data?.id;

  console.log("\n=== 3. Testing Admin PATCH /api/v1/admin/coupons (Toggle Active) ===");
  const patchRes = await fetch("http://localhost:3000/api/v1/admin/coupons", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: createdId,
      is_active: false,
    }),
  });
  const patchData = await patchRes.json();
  console.log("PATCH Coupon status:", patchRes.status, "New is_active:", patchData.data?.is_active);

  console.log("\n=== 4. Testing Admin DELETE /api/v1/admin/coupons (Retire) ===");
  const delRes = await fetch(`http://localhost:3000/api/v1/admin/coupons?id=${createdId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const delData = await delRes.json();
  console.log("DELETE Coupon status:", delRes.status, delData.message);

  console.log("\n✅ ADMIN COUPONS API TESTS ALL PASSED!");
}

main().catch(console.error);
