import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { requireAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiSuccess, apiCreated, apiError } from "@/server/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdminPermission(ADMIN_PERMISSIONS.CONTENT_MANAGE);

    const faqs = await prisma.fAQ.findMany({
      where: { deleted_at: null },
      orderBy: { sort_order: "asc" },
    });

    return apiSuccess(faqs, "Admin FAQs retrieved.");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return apiError(error.message, 403);
    }
    console.error("Admin FAQ fetch error:", error);
    return apiError("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminPermission(ADMIN_PERMISSIONS.CONTENT_MANAGE);
    const body = await req.json();

    const { question, answer, category, sort_order } = body;

    if (!question || !answer) {
      return apiError("Question and answer are required fields.", 400);
    }

    const faq = await prisma.fAQ.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || "General",
        sort_order: typeof sort_order === "number" ? sort_order : 0,
        is_active: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "FAQ_CREATED",
        entity: "FAQ",
        entity_id: faq.id,
        after_state: faq as any,
      },
    });

    return apiCreated(faq, "FAQ created successfully.");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return apiError(error.message, 403);
    }
    console.error("Admin FAQ create error:", error);
    return apiError("Failed to create FAQ.", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminPermission(ADMIN_PERMISSIONS.CONTENT_MANAGE);
    const body = await req.json();
    const { id, is_active, question, answer, category, sort_order } = body;

    if (!id || typeof id !== "number") {
      return apiError("Valid numeric FAQ ID is required.", 400);
    }

    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return apiError("FAQ not found.", 404);
    }

    const updated = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(typeof is_active === "boolean" ? { is_active } : {}),
        ...(question ? { question: question.trim() } : {}),
        ...(answer ? { answer: answer.trim() } : {}),
        ...(category ? { category: category.trim() } : {}),
        ...(typeof sort_order === "number" ? { sort_order } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "FAQ_UPDATED",
        entity: "FAQ",
        entity_id: updated.id,
        before_state: existing as any,
        after_state: updated as any,
      },
    });

    return apiSuccess(updated, "FAQ updated successfully.");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return apiError(error.message, 403);
    }
    console.error("Admin FAQ update error:", error);
    return apiError("Failed to update FAQ.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminPermission(ADMIN_PERMISSIONS.CONTENT_MANAGE);
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "", 10);

    if (!id || isNaN(id)) {
      return apiError("Valid numeric FAQ ID is required in query params.", 400);
    }

    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return apiError("FAQ not found.", 404);
    }

    await prisma.fAQ.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "FAQ_DELETED",
        entity: "FAQ",
        entity_id: id,
        before_state: existing as any,
      },
    });

    return apiSuccess({ id }, "FAQ deleted successfully.");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return apiError(error.message, 403);
    }
    console.error("Admin FAQ delete error:", error);
    return apiError("Failed to delete FAQ.", 500);
  }
}
