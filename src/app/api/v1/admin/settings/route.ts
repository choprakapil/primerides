import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getSiteSettings, saveSiteSettings } from "@/server/settings";

/**
 * GET /api/v1/admin/settings
 * Fetch current site configuration and contact details
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const settings = getSiteSettings();
    return apiSuccess(settings);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch settings", 500);
  }
}

/**
 * PUT /api/v1/admin/settings
 * Update site configuration (phone, whatsapp, address, social, tax compliance, etc.)
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.ADMINS_MANAGE)) {
      return apiError("Insufficient permission to modify site settings.", 403);
    }

    const body = await req.json().catch(() => ({}));

    // Tax Settings Validation (Issue #15)
    if (body.gstRatePercentage !== undefined && body.gstRatePercentage !== null) {
      const rate = Number(body.gstRatePercentage);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return apiError("GST rate percentage must be a valid number between 0 and 100.", 400);
      }
      body.gstRatePercentage = rate;
    }

    if (body.cgstRatePercentage !== undefined && body.cgstRatePercentage !== null) {
      const cgst = Number(body.cgstRatePercentage);
      if (isNaN(cgst) || cgst < 0 || cgst > 100) {
        return apiError("CGST rate percentage must be a valid number between 0 and 100.", 400);
      }
      body.cgstRatePercentage = cgst;
    }

    if (body.sgstRatePercentage !== undefined && body.sgstRatePercentage !== null) {
      const sgst = Number(body.sgstRatePercentage);
      if (isNaN(sgst) || sgst < 0 || sgst > 100) {
        return apiError("SGST rate percentage must be a valid number between 0 and 100.", 400);
      }
      body.sgstRatePercentage = sgst;
    }

    if (body.igstRatePercentage !== undefined && body.igstRatePercentage !== null) {
      const igst = Number(body.igstRatePercentage);
      if (isNaN(igst) || igst < 0 || igst > 100) {
        return apiError("IGST rate percentage must be a valid number between 0 and 100.", 400);
      }
      body.igstRatePercentage = igst;
    }

    if (body.gstNumber !== undefined && body.gstNumber !== null) {
      const cleanGstin = String(body.gstNumber).trim().toUpperCase();
      if (cleanGstin.length > 0 && cleanGstin.length < 10) {
        return apiError("GSTIN must be at least 10 characters long.", 400);
      }
      body.gstNumber = cleanGstin;
    }

    if (body.sacCode !== undefined && body.sacCode !== null) {
      body.sacCode = String(body.sacCode).trim();
    }

    if (body.legalCorporateName !== undefined && body.legalCorporateName !== null) {
      body.legalCorporateName = String(body.legalCorporateName).trim();
    }

    const updated = saveSiteSettings(body);

    return apiSuccess(updated, "Site configuration saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to save settings", 500);
  }
}
