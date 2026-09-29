import { prisma } from "../db/client";
import { generateDocumentSignedUrl } from "../storage";

export const ALLOWED_DOC_TYPES = [
  "driving_license_front",
  "driving_license_back",
  "aadhaar",
  "passport",
] as const;

export type DocumentType = (typeof ALLOWED_DOC_TYPES)[number];

/**
 * Checks if a customer has at least one verified Driving License on record.
 * Required to pass the vehicle handover gate (confirmed -> active status).
 */
export async function hasVerifiedDrivingLicense(customerId: number): Promise<boolean> {
  const verifiedDL = await prisma.identityDocument.findFirst({
    where: {
      customer_id: customerId,
      type: { in: ["driving_license_front", "driving_license_back"] },
      status: "verified",
      deleted_at: null,
    },
  });

  return Boolean(verifiedDL);
}

/**
 * Retrieves all documents for a customer with signed private URLs.
 */
export async function getCustomerDocumentsWithSignedUrls(customerId: number) {
  const docs = await prisma.identityDocument.findMany({
    where: {
      customer_id: customerId,
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
  });

  return docs.map((doc) => ({
    ...doc,
    viewUrl: generateDocumentSignedUrl(doc.id, customerId, 7200), // 2 hours
  }));
}

/**
 * Retrieves documents for Admin review with signed URLs and customer metadata.
 */
export async function getAdminDocumentsWithSignedUrls(statusFilter?: string, customerId?: number) {
  const whereClause: any = { deleted_at: null };
  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter;
  }
  if (customerId) {
    whereClause.customer_id = customerId;
  }

  const docs = await prisma.identityDocument.findMany({
    where: whereClause,
    include: {
      customer: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          email: true,
          created_at: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return docs.map((doc) => ({
    ...doc,
    viewUrl: generateDocumentSignedUrl(doc.id, "admin", 7200),
  }));
}
