import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import { prisma } from "@/server/db/client";
import { createAccessToken } from "@/server/auth/jwt";
import { getAbsoluteStoragePath, deletePrivateDocument } from "@/server/storage";
import { POST } from "@/app/api/v1/customer/documents/route";
import { NextRequest } from "next/server";

describe("Issue #27: Orphaned Rejected KYC Documents Pruning", () => {
  let customerId: number;
  let customerToken: string;
  let createdDocId: number | null = null;
  const storageKeysToClean: string[] = [];

  const sampleJpeg1 = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00,
  ]);
  const sampleJpeg2 = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x02, 0x02, 0x02, 0x00, 0x70, 0x00, 0x70, 0x00, 0x00,
  ]);

  beforeAll(async () => {
    // 1. Create a dedicated test customer
    const phone = `+919999${Date.now().toString().slice(-6)}`;
    const customer = await prisma.customerUser.create({
      data: {
        phone,
        email: `kyc_test_${Date.now()}@primerides.in`,
        full_name: "KYC Test Customer",
        is_verified: false,
      },
    });
    customerId = customer.id;

    customerToken = await createAccessToken(
      {
        id: customer.id,
        phone: customer.phone,
        name: customer.full_name,
        type: "customer",
      },
      3600
    );
  });

  afterAll(async () => {
    // Clean up DB records
    if (customerId) {
      await prisma.identityDocument.deleteMany({
        where: { customer_id: customerId },
      });
      await prisma.customerUser.delete({
        where: { id: customerId },
      });
    }

    // Clean up any remaining test storage files
    for (const key of storageKeysToClean) {
      await deletePrivateDocument(key);
    }
  });

  it("Test 1: First upload saves document to disk and creates pending record", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/customer/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "driving_license_front",
        fileBase64: sampleJpeg1.toString("base64"),
        fileName: "license_front_v1.jpg",
        mimeType: "image/jpeg",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.type).toBe("driving_license_front");
    expect(json.data.status).toBe("pending");

    createdDocId = json.data.id;
    const initialStorageKey = json.data.storage_key;
    storageKeysToClean.push(initialStorageKey);

    // Verify physical file was written to disk
    const initialFilePath = getAbsoluteStoragePath(initialStorageKey);
    expect(fs.existsSync(initialFilePath)).toBe(true);
  });

  it("Test 2: Document is marked rejected by admin", async () => {
    expect(createdDocId).not.toBeNull();

    const updated = await prisma.identityDocument.update({
      where: { id: createdDocId! },
      data: {
        status: "rejected",
        rejection_reason: "Image blurry. Driving license number not readable.",
        verified_at: new Date(),
      },
    });

    expect(updated.status).toBe("rejected");
    expect(updated.rejection_reason).toBe("Image blurry. Driving license number not readable.");
  });

  it("Test 3: Re-uploading replaces record, creates new file, and PRUNES old rejected file from disk", async () => {
    // Get the old document storage key before re-upload
    const docBefore = await prisma.identityDocument.findUnique({
      where: { id: createdDocId! },
    });
    expect(docBefore).not.toBeNull();
    const oldStorageKey = docBefore!.storage_key;
    const oldFilePath = getAbsoluteStoragePath(oldStorageKey);

    // Verify old file currently exists before re-upload
    expect(fs.existsSync(oldFilePath)).toBe(true);

    // Re-upload clear document
    const req = new NextRequest("http://localhost:3000/api/v1/customer/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "driving_license_front",
        fileBase64: sampleJpeg2.toString("base64"),
        fileName: "license_front_clear_v2.jpg",
        mimeType: "image/jpeg",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);

    const newStorageKey = json.data.storage_key;
    storageKeysToClean.push(newStorageKey);

    // Storage keys must be different
    expect(newStorageKey).not.toBe(oldStorageKey);

    // Status must be reset to pending and rejection_reason cleared
    expect(json.data.status).toBe("pending");
    expect(json.data.rejection_reason).toBeNull();

    // Verify NEW physical file was created on disk
    const newFilePath = getAbsoluteStoragePath(newStorageKey);
    expect(fs.existsSync(newFilePath)).toBe(true);

    // CRUCIAL: Verify OLD rejected physical file has been PRUNED from disk
    expect(fs.existsSync(oldFilePath)).toBe(false);
  });

  it("Test 4: deletePrivateDocument guards against directory traversal attacks", async () => {
    // Attempt directory traversal
    const traversalResult = await deletePrivateDocument("../../etc/passwd");
    expect(traversalResult).toBe(false);

    // Empty key returns false
    const emptyResult = await deletePrivateDocument("");
    expect(emptyResult).toBe(false);

    // Non-existent key returns false cleanly without error
    const nonExistentResult = await deletePrivateDocument("documents/cust_99999/non_existent.jpg");
    expect(nonExistentResult).toBe(false);
  });
});
