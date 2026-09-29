import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentCustomer } from "@/server/auth/customer";
import { savePrivateDocument } from "@/server/storage";
import { getCustomerDocumentsWithSignedUrls, ALLOWED_DOC_TYPES } from "@/server/kyc";
import { apiError, apiSuccess, apiCreated, apiUnauthorized } from "@/server/utils/api-response";
import { uploadRateLimiter } from "@/lib/rateLimit";

/**
 * GET /api/v1/customer/documents
 * Returns the authenticated customer's documents and status.
 */
export async function GET(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return apiUnauthorized("Please sign in to view documents.");

    const documents = await getCustomerDocumentsWithSignedUrls(customer.id);
    return apiSuccess(documents, "Documents retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve documents", 500);
  }
}

/**
 * POST /api/v1/customer/documents
 * Uploads an identity document (Driving License, Aadhaar, Passport).
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting (10 uploads per hour)
  const rateLimitResult = await uploadRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return apiUnauthorized("Please sign in to upload documents.");

    let type: string | null = null;
    let fileBuffer: Buffer | null = null;
    let originalName = "document.jpg";
    let mimeType = "image/jpeg";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      type = formData.get("type") as string;
      const file = formData.get("file") as File | null;

      if (!file) {
        return apiError("No file uploaded. Please attach an image.", 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      originalName = file.name || "document.jpg";
      mimeType = file.type || "image/jpeg";
    } else {
      const body = await req.json().catch(() => ({}));
      type = body.type;
      if (body.fileBase64) {
        const base64Data = body.fileBase64.replace(/^data:image\/\w+;base64,/, "");
        fileBuffer = Buffer.from(base64Data, "base64");
        if (body.fileName) originalName = body.fileName;
        if (body.mimeType) mimeType = body.mimeType;
      }
    }

    if (!type || !ALLOWED_DOC_TYPES.includes(type as any)) {
      return apiError(
        `Invalid document type. Allowed types: ${ALLOWED_DOC_TYPES.join(", ")}`,
        400
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return apiError("File data is required.", 400);
    }

    // 1. Save to Private Storage (Enforces real binary magic bytes & max size)
    let saveResult;
    try {
      saveResult = await savePrivateDocument({
        buffer: fileBuffer,
        originalName,
        mimeType,
        customerId: customer.id,
        type,
      });
    } catch (valErr: any) {
      return apiError(valErr.message || "File validation failed.", 400);
    }

    // 2. Create or Update IdentityDocument record
    const existingDoc = await prisma.identityDocument.findFirst({
      where: {
        customer_id: customer.id,
        type,
        deleted_at: null,
      },
    });

    let doc;
    if (existingDoc) {
      doc = await prisma.identityDocument.update({
        where: { id: existingDoc.id },
        data: {
          storage_key: saveResult.storageKey,
          file_name: saveResult.fileName,
          mime_type: saveResult.mimeType,
          file_size: saveResult.fileSize,
          status: "pending", // Reset to pending for admin re-verification
          rejection_reason: null,
          verified_at: null,
          verified_by: null,
        },
      });
    } else {
      doc = await prisma.identityDocument.create({
        data: {
          customer_id: customer.id,
          type,
          storage_key: saveResult.storageKey,
          file_name: saveResult.fileName,
          mime_type: saveResult.mimeType,
          file_size: saveResult.fileSize,
          status: "pending",
        },
      });
    }

    return apiCreated(doc, "Document uploaded successfully and queued for verification.");
  } catch (err: any) {
    return apiError(err.message || "Failed to upload document", 500);
  }
}
