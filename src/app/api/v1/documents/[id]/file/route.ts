import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { readPrivateDocument, verifyDocumentSignedToken } from "@/server/storage";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { getCurrentCustomer } from "@/server/auth/customer";

/**
 * GET /api/v1/documents/[id]/file?token=<signed_token>
 * Securely streams a private identity document to authorized clients.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      return new NextResponse("Invalid document ID", { status: 400 });
    }

    const doc = await prisma.identityDocument.findUnique({
      where: { id: documentId, deleted_at: null },
    });

    if (!doc) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // 1. Check Signed Token
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    let isAuthorized = false;

    if (token && verifyDocumentSignedToken(documentId, token)) {
      isAuthorized = true;
    }

    // 2. Check Admin Session if token invalid or absent
    if (!isAuthorized) {
      const admin = await getCurrentAdmin();
      if (admin && (admin.role === "superadmin" || hasAdminPermission(admin, [ADMIN_PERMISSIONS.DOCUMENTS_MANAGE, ADMIN_PERMISSIONS.BOOKINGS_VIEW]))) {
        isAuthorized = true;
      }
    }

    // 3. Check Customer Session if not admin
    if (!isAuthorized) {
      const customer = await getCurrentCustomer();
      if (customer && customer.id === doc.customer_id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new NextResponse("Unauthorized or expired document access token", { status: 401 });
    }

    // 4. Read File from Private Storage
    const fileData = await readPrivateDocument(doc.storage_key);
    if (!fileData) {
      return new NextResponse("Document file missing from storage", { status: 404 });
    }

    return new Response(new Uint8Array(fileData.buffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mime_type || fileData.mimeType,
        "Cache-Control": "private, no-transform, max-age=3600",
        "Content-Disposition": `inline; filename="${doc.file_name || "document.jpg"}"`,
      },
    });
  } catch (err: any) {
    console.error("Error serving document file:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
