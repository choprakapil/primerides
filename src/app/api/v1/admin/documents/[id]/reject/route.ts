import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { notifyKycStatusChange } from "@/server/notifications";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * POST /api/v1/admin/documents/[id]/reject
 * Sets document verification status to "rejected", records reason, and writes an AuditLog.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.DOCUMENTS_MANAGE)) {
      return apiError("Forbidden: You lack documents.manage permission to reject KYC documents.", 403);
    }

    const { id } = await context.params;
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) return apiError("Invalid document ID.", 400);

    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return apiError("Rejection reason is required.", 400);
    }

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
          status: "rejected",
          rejection_reason: reason.trim(),
          verified_at: new Date(),
          verified_by: admin.id,
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "DOCUMENT_REJECTED",
          entity: "IdentityDocument",
          entity_id: documentId,
          before_state: {
            status: oldStatus,
            type: doc.type,
            customer_id: doc.customer_id,
          },
          after_state: {
            status: "rejected",
            rejection_reason: reason.trim(),
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
        status: "rejected",
        rejectionReason: reason.trim(),
      }).catch((e) => console.error("[Notification:KYC:Reject] Failed to dispatch:", e));
    }

    return apiSuccess(updatedDoc, "Document rejected.");
  } catch (err: any) {
    return apiError(err.message || "Failed to reject document", 500);
  }
}
