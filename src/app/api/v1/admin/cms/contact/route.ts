import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getContactConfig, saveContactConfig, saveSiteSettings } from "@/server/settings";

/**
 * GET /api/v1/admin/cms/contact
 * Returns the persisted contact page and concierge desk configuration
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const config = getContactConfig();
    return apiSuccess(config);
  } catch (error: any) {
    console.error("[API Admin Contact CMS GET] Error:", error);
    return apiError("Internal error loading contact configuration.", 500);
  }
}

/**
 * PUT /api/v1/admin/cms/contact
 * Updates and persists contact and concierge details to persistedContact.json and site settings
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: You lack content.manage permission.", 403);
    }

    const body = await req.json().catch(() => null);
    if (!body) return apiError("Invalid request body.", 400);

    const updated = saveContactConfig({
      eyebrow: body.eyebrow,
      title: body.title,
      subtitle: body.subtitle,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      supportEmail: body.supportEmail,
      addressDelhi: body.addressDelhi,
      addressGurgaon: body.addressGurgaon,
      addressLucknow: body.addressLucknow,
      timings: body.timings,
    });

    // Also sync the site-wide contact info
    saveSiteSettings({
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      supportEmail: body.supportEmail,
      addresses: {
        delhi: body.addressDelhi,
        gurgaon: body.addressGurgaon,
        lucknow: body.addressLucknow,
      },
    });

    return apiSuccess(updated, "Contact & concierge details saved and published successfully.");
  } catch (error: any) {
    console.error("[API Admin Contact CMS PUT] Error:", error);
    return apiError(error.message || "Failed to update contact settings.", 500);
  }
}
