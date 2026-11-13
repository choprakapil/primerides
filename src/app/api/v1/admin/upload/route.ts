import { NextRequest } from "next/server";
import { getCurrentAdmin } from "@/server/auth/rbac";
import { apiSuccess, apiCreated, apiError, apiUnauthorized } from "@/server/utils/api-response";
import { detectImageBinarySignature } from "@/server/storage";
import fs from "fs/promises";
import path from "path";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return apiUnauthorized("Unauthorized. Admin session required.");
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return apiError("Invalid Content-Type. Expected multipart/form-data.", 400);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as string) || "cars";

    if (!file) {
      return apiError("No file provided. Please attach an image file.", 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return apiError("File exceeds maximum allowed size of 8MB.", 400);
    }

    // Convert to Buffer for binary magic-bytes inspection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Deep binary signature verification (prevents malicious scripts with spoofed MIME headers)
    const verifiedFormat = detectImageBinarySignature(buffer);
    if (!verifiedFormat) {
      return apiError(
        "Invalid or corrupted file content. Binary signature does not match allowed image formats (JPEG, PNG, WebP).",
        400
      );
    }

    // Sanitize folder path to prevent directory traversal
    const safeFolder = requestedFolder.replace(/[^a-zA-Z0-9_-]/g, "");
    const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Derive canonical safe extension strictly from verified binary signature
    const safeExt = verifiedFormat.extension;
    const baseName = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 40);
    const uniqueFileName = `${Date.now()}_${baseName}${safeExt}`;
    const fullPath = path.join(uploadDir, uniqueFileName);

    // Write verified buffer to disk
    await fs.writeFile(fullPath, buffer);

    const publicUrl = `/uploads/${safeFolder}/${uniqueFileName}`;

    return apiCreated(
      {
        url: publicUrl,
        fileName: uniqueFileName,
        originalName: file.name,
        format: verifiedFormat.formatName,
        mimeType: verifiedFormat.mimeType,
        size: buffer.length,
      },
      "File uploaded and validated successfully."
    );
  } catch (err: any) {
    console.error("Admin image upload failed:", err);
    return apiError(err.message || "Failed to upload image.", 500);
  }
}
