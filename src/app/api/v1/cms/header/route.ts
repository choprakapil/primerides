import { apiError, apiSuccess } from "@/server/utils/api-response";
import { getHeaderConfig } from "@/server/settings";

/**
 * GET /api/v1/cms/header
 * Public endpoint returning header navigation links and action buttons
 */
export async function GET() {
  try {
    const config = getHeaderConfig();
    return apiSuccess(config);
  } catch (err: any) {
    return apiError(err.message || "Failed to load header configuration", 500);
  }
}
