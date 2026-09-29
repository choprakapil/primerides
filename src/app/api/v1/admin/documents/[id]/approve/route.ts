import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { notifyKycStatusChange } from "@/server/notifications";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * POST /api/v1/admin/documents/[id]/approve
 * Sets document verification status to "verified" and writes an AuditLog.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.DOCUMENTS_MANAGE)) {
      return apiError("Forbidden: You lack documents.manage permission to verify KYC documents.", 403);
    }

    const { id } = await context.params;
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) return apiError("Invalid document ID.", 400);

    const doc = await prisma.identityDocument.findUnique({
      where: { id: documentId, deleted_at: null },
      include: { customer: true },
    });

    if (!doc) return apiError("Document not found.", 404);

    const oldStatus = doc.status;

    const updatedDoc = await prisma.$transaction(async (tx) => {
      const updated = await tx.identityDocument.update({
        where: { id: documentId },
        data: {
          status: "verified",
          rejection_reason: null,
          verified_at: new Date(),
          verified_by: admin.id,
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "DOCUMENT_VERIFIED",
          entity: "IdentityDocument",
          entity_id: documentId,
          before_state: {
            status: oldStatus,
            type: doc.type,
            customer_id: doc.customer_id,
          },
          after_state: {
            status: "verified",
            verified_by: admin.id,
            type: doc.type,
            customer_id: doc.customer_id,
          },
        },
      });

      return updated;
    });

    // Notify customer asynchronously
    if (doc.customer) {
      notifyKycStatusChange({
        customerName: doc.customer.full_name || "Valued Customer",
        customerEmail: doc.customer.email,
        customerPhone: doc.customer.phone,
        documentType: doc.type.replace(/_/g, " ").toUpperCase(),
        status: "verified",
      }).catch((e) => console.error("[Notification:KYC:Approve] Failed to dispatch:", e));
    }

    return apiSuccess(updatedDoc, "Document verified successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to approve document", 500);
  }
}
