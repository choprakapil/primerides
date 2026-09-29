import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import {
  getNotificationSettings,
  saveNotificationSettings,
  getHomepageConfig,
  saveHomepageConfig,
} from "@/server/settings";

/**
 * GET /api/v1/admin/cms/website
 * Fetch live website sections (Top announcement banner and homepage hero copy).
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const notifications = getNotificationSettings();
    const homepage = getHomepageConfig();

    const heroTitle =
      homepage.heroData?.titleLine1
        ? `${homepage.heroData.titleLine1} ${homepage.heroData.titleLine2 || ""}`.trim()
        : "Drive Exceptional. Luxury Self-Drive Rentals in Delhi NCR & Lucknow.";
    const heroSubtitle =
      homepage.heroData?.subtext ||
      "Experience Unmatched Luxury Mobility Across Delhi NCR & Lucknow. Doorstep White-Glove Handover.";

    return apiSuccess({
      promoBarActive: notifications.announcementBar?.enabled ?? true,
      promoBarText:
        notifications.announcementBar?.text ||
        "Complimentary Doorstep Handover for rentals above 3 days • Use code LUXPRIME",
      heroTitle,
      heroSubtitle,
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch website CMS settings", 500);
  }
}

/**
 * PUT /api/v1/admin/cms/website
 * Persist website sections & banners configuration.
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: You lack content.manage permission.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { promoBarActive, promoBarText, heroTitle, heroSubtitle } = body;

    // 1. Update notification settings (announcement bar)
    const currentNotif = getNotificationSettings();
    const updatedNotif = saveNotificationSettings({
      announcementBar: {
        ...currentNotif.announcementBar,
        enabled: promoBarActive !== undefined ? !!promoBarActive : currentNotif.announcementBar.enabled,
        text: typeof promoBarText === "string" ? promoBarText.trim() : currentNotif.announcementBar.text,
      },
    });

    // 2. Update homepage config (hero title & subtitle in heroData)
    const currentHome = getHomepageConfig();
    const updatedHome = saveHomepageConfig({
      heroData: {
        ...currentHome.heroData,
        titleLine1: typeof heroTitle === "string" ? heroTitle.trim() : currentHome.heroData?.titleLine1,
        titleLine2: "",
        subtext: typeof heroSubtitle === "string" ? heroSubtitle.trim() : currentHome.heroData?.subtext,
      },
    });

    // 3. Write Audit Log
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "CMS_WEBSITE_UPDATED",
        entity: "WebsiteContent",
        entity_id: 0,
        before_state: {
          promoBarActive: currentNotif.announcementBar.enabled,
          promoBarText: currentNotif.announcementBar.text,
          heroTitle: currentHome.heroData?.titleLine1,
          heroSubtitle: currentHome.heroData?.subtext,
        },
        after_state: {
          promoBarActive: updatedNotif.announcementBar.enabled,
          promoBarText: updatedNotif.announcementBar.text,
          heroTitle: updatedHome.heroData?.titleLine1,
          heroSubtitle: updatedHome.heroData?.subtext,
        },
      },
    });

    return apiSuccess(
      {
        promoBarActive: updatedNotif.announcementBar.enabled,
        promoBarText: updatedNotif.announcementBar.text,
        heroTitle: updatedHome.heroData?.titleLine1,
        heroSubtitle: updatedHome.heroData?.subtext,
      },
      "Website sections and promotional banners saved successfully."
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to persist website CMS settings", 500);
  }
}
