import { NextRequest } from "next/server";
import { getCurrentAdmin } from "@/server/auth/rbac";
import { apiSuccess, apiCreated, apiError, apiUnauthorized } from "@/server/utils/api-response";
import fs from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
];

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

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return apiError(
        `Invalid file type: '${file.type}'. Allowed: JPEG, PNG, WebP, AVIF, SVG.`,
        400
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return apiError("File exceeds maximum allowed size of 8MB.", 400);
    }

    // Sanitize folder path to prevent directory traversal
    const safeFolder = requestedFolder.replace(/[^a-zA-Z0-9_-]/g, "");
    const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize original file name and add timestamp
    const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 40);
    const uniqueFileName = `${Date.now()}_${baseName}${ext}`;
    const fullPath = path.join(uploadDir, uniqueFileName);

    // Convert to Buffer and write
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(fullPath, buffer);

    const publicUrl = `/uploads/${safeFolder}/${uniqueFileName}`;

    return apiCreated(
      {
        url: publicUrl,
        fileName: uniqueFileName,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      },
      "Image uploaded successfully."
    );
  } catch (err: any) {
    console.error("Admin image upload failed:", err);
    return apiError(err.message || "Failed to upload image.", 500);
  }
}
