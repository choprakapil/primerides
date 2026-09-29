import { NextRequest } from "next/server";
import { getSiteSettings, getFooterConfig } from "@/server/settings";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * GET /api/v1/cms/settings
 * Public endpoint providing branding, phone numbers, WhatsApp, addresses, and footer configuration.
 */
export async function GET(req: NextRequest) {
  try {
    const siteSettings = getSiteSettings();
    const footerConfig = getFooterConfig();

    return apiSuccess(
      {
        site: {
          brandName: siteSettings.brandName,
          tagline: siteSettings.tagline,
          phone: siteSettings.phone,
          phoneRaw: siteSettings.phoneRaw || siteSettings.phone.replace(/[^0-9+]/g, ""),
          whatsapp: siteSettings.whatsapp,
          whatsappRaw: siteSettings.whatsappRaw || siteSettings.whatsapp.replace(/[^0-9]/g, ""),
          email: siteSettings.email,
          supportEmail: siteSettings.supportEmail,
          emergencyPhone: siteSettings.emergencyPhone,
          roadsideAssistancePhone: siteSettings.roadsideAssistancePhone,
          businessHours: siteSettings.businessHours,
          addresses: siteSettings.addresses,
        },
        footer: footerConfig,
      },
      "Site settings retrieved successfully."
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to load site settings", 500);
  }
}
